// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { jsonResponse, STRIPE_FUNCTION_CORS } from "../_shared/stripe-cors.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

Deno.serve(async (req: any) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: STRIPE_FUNCTION_CORS });
  }

  const secret = Deno.env.get("X-SECRET-KEY")!;

  const authHeader = req.headers.get("X-Secret-Key");
  if (authHeader !== secret) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { visitorAnonId } = await req.json()
  
  const { data: visitor, error: visitorError } = await supabase.from("visitors").select("*").eq("anon_id", visitorAnonId).single();
  if (visitorError) {
    return jsonResponse({ error: visitorError.message }, 500);
  }

  const { data: resume, error: resumeError } = await supabase.from("generated_resumes").select("*").eq("visitor_id", visitor.id).single();
  if (resumeError) {
    return jsonResponse({ error: resumeError.message }, 500);
  }

  return jsonResponse({ resume }, 200);
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/visitor-retrieve-resume' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwOTk0MzI1NDN9.MdFWDJIpz8kqNYjImXVqfDPuqHiL-sptpjdVOpn6Dnt6BHrzx5ZUk_6AnCgzxVNSiQDqVzGF1zdnftqk8cGOKw' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
