// supabase/functions/poll-workable/index.ts
// Deploy with: supabase functions deploy poll-workable --no-verify-jwt
//
// Workable's public widget endpoint returns title/location/department/date but
// NOT the full job description — there's no documented public detail endpoint
// for that. description_html stays null here; apply_url is enough to alert on.
// If you need the full description later, that likely means fetching and
// parsing the public job page HTML, which is a separate, heavier feature.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

const BATCH_SIZE = 60;
const CONCURRENCY = 10;
const MAX_JOB_AGE_DAYS = 2;
const MAX_JOB_AGE_MS = MAX_JOB_AGE_DAYS * 24 * 60 * 60 * 1000;
const TIER_INTERVAL_MIN: Record<number, number> = { 1: 5, 2: 30, 3: 240 };
const UA = "ApplyJetBot/1.0 (+https://applyjetai.com)";

type Company = {
  id: number;
  slug: string;
  tier: number;
  last_success_at: string | null;
  consecutive_failures: number;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function pool<T>(items: T[], limit: number, fn: (x: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      while (queue.length) await fn(queue.shift()!);
    }),
  );
}

function nextPollDate(tier: number, failures = 0) {
  const base = TIER_INTERVAL_MIN[tier] ?? 240;
  const minutes = Math.min(base * 2 ** failures, 24 * 60);
  const jitter = 1 + (Math.random() * 0.2 - 0.1);
  return new Date(Date.now() + minutes * 60_000 * jitter).toISOString();
}

function isFresh(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const ms = Date.parse(dateStr);
  if (Number.isNaN(ms)) return false;
  return Date.now() - ms <= MAX_JOB_AGE_MS;
}

async function pollCompany(c: Company): Promise<{ newJobs: number; status: string }> {
  await sleep(Math.random() * 1500);

  const url = `https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(c.slug)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15_000) });
  const now = new Date().toISOString();

  if (!res.ok) {
    const failures = c.consecutive_failures + 1;
    await supabase.from("companies").update({
      last_polled_at: now,
      consecutive_failures: failures,
      active: !(res.status === 404 && failures >= 5),
      next_poll_at: nextPollDate(c.tier, failures),
    }).eq("id", c.id);
    return { newJobs: 0, status: String(res.status) };
  }

  // IMPORTANT: verify against a real response once —
  // console.log(JSON.stringify(body.jobs?.[0])) — then adjust field names below.
  const body = await res.json();
  const list: any[] = body.jobs ?? [];
  // Workable's job id is usually `shortcode`; fall back to `id` if present.
  const ids = list.map((j) => String(j.shortcode ?? j.id));

  const { data: newIds, error } = await supabase.rpc("sync_company_jobs", {
    p_company_id: c.id,
    p_seen_ids: ids,
  });
  if (error) throw error;

  const isSeed = c.last_success_at === null;
  const newSet = new Set<string>(newIds ?? []);
  const rows: Record<string, unknown>[] = [];

  for (const j of list) {
    const extId = String(j.shortcode ?? j.id);
    if (!newSet.has(extId)) continue;
    if (!isFresh(j.published_on ?? j.created_at)) continue;

    rows.push({
      company_id: c.id,
      ats: "workable",
      external_id: extId,
      title: j.title ?? null,
      location: j.location?.location_str ?? j.city ?? null,
      department: j.department ?? null,
      apply_url: j.url ?? `https://apply.workable.com/${c.slug}/j/${extId}/`,
      description_html: null, // not available from this endpoint, see file header
      posted_at: j.published_on ?? j.created_at ?? null,
      is_seed: isSeed,
      raw: j,
    });
  }

  if (rows.length) {
    const { error: upErr } = await supabase
      .from("jobs")
      .upsert(rows, { onConflict: "company_id,external_id", ignoreDuplicates: true });
    if (upErr) throw upErr;
  }

  await supabase.from("companies").update({
    last_polled_at: now,
    last_success_at: now,
    consecutive_failures: 0,
    next_poll_at: nextPollDate(c.tier),
  }).eq("id", c.id);

  return { newJobs: isSeed ? 0 : rows.length, status: isSeed ? "seeded" : "ok" };
}

Deno.serve(async (req) => {
  if (req.headers.get("Authorization") !== `Bearer ${CRON_SECRET}`) {
    return new Response("unauthorized", { status: 401 });
  }

  const { data: due, error } = await supabase.rpc("claim_due_companies", {
    p_ats: "workable",
    p_batch: BATCH_SIZE,
  });
  if (error) return new Response(error.message, { status: 500 });

  const summary = { claimed: due?.length ?? 0, newJobs: 0, errors: 0 };

  await pool((due ?? []) as Company[], CONCURRENCY, async (c) => {
    try {
      const r = await pollCompany(c);
      summary.newJobs += r.newJobs;
    } catch (e) {
      summary.errors++;
      console.error(`poll failed for ${c.slug}:`, e);
      const failures = c.consecutive_failures + 1;
      await supabase.from("companies").update({
        last_polled_at: new Date().toISOString(),
        consecutive_failures: failures,
        next_poll_at: nextPollDate(c.tier, failures),
      }).eq("id", c.id);
    }
  });

  return Response.json(summary);
});