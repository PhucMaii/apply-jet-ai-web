// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { jsonResponse } from "../_shared/stripe-cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


interface CreateTailoredApplicationBody {
  userId: string;
  jobId: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return jsonResponse({message: "OK"}, 200)
  }

  const secretKey = Deno.env.get("X-SECRET-KEY");
  const xsecretkey = req.headers.get("X-Secret-Key");
  if (!secretKey || xsecretkey !== secretKey) {
    return jsonResponse({error: "Unauthorized"}, 401)
  }

  let body: CreateTailoredApplicationBody;
  try {
    body = await req.json();
    if (!body?.userId || !body?.jobId) {
      return jsonResponse({error: "Missing required fields: userId, jobId"}, 400)
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Something went wrong: Supabase env is not configured for create-tailored-application", {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceRoleKey: Boolean(serviceRoleKey),
      })
    }

    const supabase = createClient(supabaseUrl as string, serviceRoleKey as string);

    // Create a new application
    // Get job description_html from jobId
    // If not, 
  } catch (error: any) {
    console.error("Something went wrong: create-tailored-application call", {
      error: error.message,
      stack: error.stack,
    })
    return jsonResponse({error: "Internal Server Error"}, 500)
  }


  return jsonResponse({message: "OK"}, 200)
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-tailored-application' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIxMDU2ODI3NjN9.653f25hlzkgu3vWIX-1KSV_JiwmfLhPLkvnbvwVlk2dbCYtnTk0Hm0jryO6BLk1_jsf_9DJ8uLROtG8UQUb3iQ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
