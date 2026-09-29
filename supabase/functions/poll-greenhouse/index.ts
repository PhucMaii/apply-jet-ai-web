// supabase/functions/poll-greenhouse/index.ts
// Deploy with: supabase functions deploy poll-greenhouse --no-verify-jwt
// (we authenticate with our own CRON_SECRET instead of a user JWT)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
// const CRON_SECRET = Deno.env.get("CRON_SECRET")!;
// console.log("CRON_SECRET", CRON_SECRET);

const CRON_SECRET = Deno.env.get("CRON_SECRET")!;
const BATCH_SIZE = 60;
const CONCURRENCY = 10;
const MAX_DETAIL_FETCHES_PER_COMPANY = 40; // safety valve for weird boards
/** Only persist jobs whose Greenhouse post date falls in this window. */
const MAX_JOB_AGE_DAYS = 2;
const MAX_JOB_AGE_MS = MAX_JOB_AGE_DAYS * 24 * 60 * 60 * 1000;
const TIER_INTERVAL_MIN: Record<number, number> = { 1: 5, 2: 30, 3: 240 };
const UA = "ApplyJetBot/1.0 (+https://applyjetai.com)";

type Company = {
  id: number;
  slug: string;
  tier: number;
  etag: string | null;
  last_success_at: string | null;
  consecutive_failures: number;
};

// ---------- helpers ----------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function pool<T>(items: T[], limit: number, fn: (x: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      while (queue.length) await fn(queue.shift()!);
    }),
  );
}

// Greenhouse returns `content` as HTML-escaped text (&lt;p&gt;...), so decode it once.
function decodeEntities(s: string) {
  return s
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

function nextPollDate(tier: number, failures = 0) {
  const base = TIER_INTERVAL_MIN[tier] ?? 240;
  // exponential backoff on failures, capped at 24h
  const minutes = Math.min(base * 2 ** failures, 24 * 60);
  const jitter = 1 + (Math.random() * 0.2 - 0.1); // +/-10%
  return new Date(Date.now() + minutes * 60_000 * jitter).toISOString();
}

function jobPostedAt(j: { first_published?: string; updated_at?: string }) {
  return j.first_published ?? j.updated_at ?? null;
}

/** True when Greenhouse says the job was posted within the last N days. */
function isPostedWithinMaxAge(postedAt: string | null | undefined): boolean {
  if (!postedAt) return false;
  const postedMs = Date.parse(postedAt);
  if (Number.isNaN(postedMs)) return false;
  return Date.now() - postedMs <= MAX_JOB_AGE_MS;
}

// ---------- per-company poll ----------
async function pollCompany(c: Company): Promise<{ newJobs: number; status: string }> {
  await sleep(Math.random() * 1500); // jitter so we don't burst

  const listUrl = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(c.slug)}/jobs`;
  const headers: Record<string, string> = { "User-Agent": UA };
  if (c.etag) headers["If-None-Match"] = c.etag;

  const res = await fetch(listUrl, { headers, signal: AbortSignal.timeout(15_000) });
  const now = new Date().toISOString();

  // Nothing changed
  if (res.status === 304) {
    await supabase.from("companies").update({
      last_polled_at: now,
      next_poll_at: nextPollDate(c.tier),
    }).eq("id", c.id);
    return { newJobs: 0, status: "304" };
  }

  // Failure paths: back off, and deactivate boards that keep 404ing
  if (!res.ok) {
    const failures = c.consecutive_failures + 1;
    await supabase.from("companies").update({
      last_polled_at: now,
      consecutive_failures: failures,
      active: !(res.status === 404 && failures >= 5),
      next_poll_at: nextPollDate(c.tier, failures), // 429s and 5xx back off harder
    }).eq("id", c.id);
    return { newJobs: 0, status: String(res.status) };
  }

  const body = await res.json();
  const list: any[] = body.jobs ?? [];
  const ids = list.map((j) => String(j.id));

  // Step 1: cheap diff in SQL. Returns only ids we've never stored.
  const { data: newIds, error } = await supabase.rpc("sync_company_jobs", {
    p_company_id: c.id,
    p_seen_ids: ids,
  });
  if (error) throw error;

  const isSeed = c.last_success_at === null; // first ever poll: everything is "new" but not really
  const newSet = new Set<string>(newIds ?? []);
  const rows: Record<string, unknown>[] = [];

  // Step 2: only fetch/save genuinely new jobs posted in the last MAX_JOB_AGE_DAYS.
  // Older "new" ids are skipped so we don't fill the DB with stale board inventory.
  const toDetail = list.filter((j) => {
    if (!newSet.has(String(j.id))) return false;
    return isPostedWithinMaxAge(jobPostedAt(j));
  });

  if (isSeed) {
    // Store list-level data only; descriptions can be fetched lazily when a user opens a job.
    for (const j of toDetail) {
      const postedAt = jobPostedAt(j);
      if (!isPostedWithinMaxAge(postedAt)) continue;
      rows.push({
        company_id: c.id,
        ats: "greenhouse",
        external_id: String(j.id),
        title: j.title,
        location: j.location?.name ?? null,
        apply_url: j.absolute_url,
        posted_at: postedAt,
        is_seed: true,
        raw: j,
      });
    }
  } else {
    await pool(toDetail.slice(0, MAX_DETAIL_FETCHES_PER_COMPANY), 5, async (j) => {
      let detail: any = j;
      try {
        const d = await fetch(
          `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(c.slug)}/jobs/${j.id}`,
          { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15_000) },
        );
        if (d.ok) detail = await d.json();
      } catch { /* fall back to list-level data; description stays null */ }

      const postedAt = jobPostedAt(detail) ?? jobPostedAt(j);
      // Re-check after detail fetch — list `updated_at` can be newer than first_published.
      if (!isPostedWithinMaxAge(postedAt)) return;

      rows.push({
        company_id: c.id,
        ats: "greenhouse",
        external_id: String(j.id),
        title: detail.title ?? j.title,
        location: detail.location?.name ?? j.location?.name ?? null,
        department: detail.departments?.[0]?.name ?? null,
        apply_url: detail.absolute_url ?? j.absolute_url,
        description_html: detail.content ? decodeEntities(detail.content) : null,
        posted_at: postedAt,
        is_seed: false,
        raw: detail,
      });
    });
  }

  if (rows.length) {
    const { error: upErr } = await supabase
      .from("jobs")
      .upsert(rows, { onConflict: "company_id,external_id", ignoreDuplicates: true });
    if (upErr) throw upErr;
  }

  // Only save the etag AFTER everything succeeded, so a half-failed poll gets retried in full.
  await supabase.from("companies").update({
    etag: res.headers.get("etag"),
    last_polled_at: now,
    last_success_at: now,
    consecutive_failures: 0,
    next_poll_at: nextPollDate(c.tier),
  }).eq("id", c.id);

  return { newJobs: isSeed ? 0 : rows.length, status: isSeed ? "seeded" : "ok" };
}

// ---------- handler ----------
Deno.serve(async (req) => {
  if (req.headers.get("Authorization") !== `Bearer ${CRON_SECRET}`) {
    return new Response("unauthorized", { status: 401 });
  }

  const { data: due, error } = await supabase.rpc("claim_due_companies", {
    p_ats: "greenhouse",
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