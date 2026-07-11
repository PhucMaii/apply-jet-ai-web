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
  const { count: cookieCount } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true })
    .eq('anon_id', anon_id);

  if ((cookieCount ?? 0) > 0) {
    return jsonResponse({ error: 'Trial already used' }, 400, headers);
  }

  // 2. same fingerprint seen within the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
  const { count: fingerprintCount } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true })
    .eq('fingerprint', fingerprint)
    .gt('created_at', thirtyDaysAgo);

  if ((fingerprintCount ?? 0) > 0) {
    return jsonResponse({ error: 'Fingerprint already used' }, 400, headers);
  }

  // 3. soft rate limit — max 3 trials per IP per 24h
  const oneDayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
  const { count: ipCount } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true })
    .eq('ip_hash', ip_hash)
    .gt('created_at', oneDayAgo);

  if ((ipCount ?? 0) >= 3) {
    return jsonResponse({ error: 'IP rate limited' }, 400, headers);
  }

  // register
  const { error: insertError } = await supabase.from('visitors').insert({
    anon_id,
    ip_hash,
    fingerprint,
  });

  if (insertError) {
    return jsonResponse({ error: insertError.message }, 500, headers);
  }

  return jsonResponse({ success: true }, 200, headers);
});