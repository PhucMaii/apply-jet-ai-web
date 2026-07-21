import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsonResponse, STRIPE_FUNCTION_CORS } from "../_shared/stripe-cors.ts";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (name: string) => string | undefined };
};


async function hashValue(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: STRIPE_FUNCTION_CORS });
  }

  const authHeader = req.headers.get("X-Secret-Key")
  if (authHeader !== Deno.env.get("X-SECRET-KEY")) {
    return jsonResponse({ error: "Unauthorized" }, 401)
  }

  const { fingerprint } = await req.json();

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? "unknown";
  const ip_hash = await hashValue(ip);

  const cookieHeader = req.headers.get('cookie') ?? '';
  const match = cookieHeader.match(/anon_id=([^;]+)/);
  const anon_id = match ? match[1] : crypto.randomUUID();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append(
    'Set-Cookie',
    `anon_id=${anon_id}; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000; Path=/`
  );

  // 1. cookie already used a trial — any row at all means "seen before"
  const { data: visitorData } = await supabase
    .from('visitors')
    .select('*')
    .eq('anon_id', anon_id);

  if (visitorData && visitorData.length > 0) {
    // update the visitor count and last visit date
    const { error: updateError } = await supabase
      .from('visitors')
      .update({
        visit_count: visitorData[0]?.visit_count + 1,
        last_visit_at: new Date().toISOString(),
      })
      .eq('anon_id', anon_id);

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 500, headers);
    }

    return jsonResponse({ data: {anonId: visitorData[0]?.anon_id} }, 200, headers);
  }

  // 2. same fingerprint seen within the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
  const { data: fingerprintData } = await supabase
    .from('visitors')
    .select('*')
    .eq('fingerprint', fingerprint)
    .gt('created_at', thirtyDaysAgo);

  if (fingerprintData && fingerprintData.length > 0) {
    // update the visitor count and last visit date
    const { error: updateError } = await supabase
      .from('visitors')
      .update({
        visit_count: fingerprintData[0]?.visit_count + 1,
        last_visit_at: new Date().toISOString(),
      })
      .eq('anon_id', fingerprintData[0]?.anon_id);

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 500, headers);
    }

    return jsonResponse({ data: {anonId: fingerprintData[0]?.anon_id} }, 200, headers);
  }

  // 3. soft rate limit — max 3 trials per IP per 24h
  const oneDayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
  const { data: ipData } = await supabase
    .from('visitors')
    .select('*')
    .eq('ip_hash', ip_hash)
    .gt('created_at', oneDayAgo);

  if (ipData && ipData.length > 0) {
    // update the visitor count and last visit date
    const { error: updateError } = await supabase
      .from('visitors')
      .update({
        visit_count: ipData[0]?.visit_count + 1,
        last_visit_at: new Date().toISOString(),
      })
      .eq('anon_id', ipData[0]?.anon_id);

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 500, headers);
    }

    return jsonResponse({ data: {anonId: ipData[0]?.anon_id} }, 200, headers);
  }

  // register
  const { error: insertError } = await supabase.from('visitors').insert({
    anon_id,
    ip_hash,
    fingerprint,
    visit_count: 1,
    last_visit_at: new Date().toISOString(),
  });

  if (insertError) {
    return jsonResponse({ error: insertError.message }, 500, headers);
  }

  return jsonResponse({ success: true }, 200, headers);
});