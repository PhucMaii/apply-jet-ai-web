// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js";
import { jsonResponse } from "../_shared/stripe-cors.ts";

declare const Deno: any;

type Body = {
  userId: string
  guardType:
    | "resume_generations"
    | "cover_letter_generations"
    | "extract_text"
    | "application_answers"
    | "ai_generations"
    | "find_hr_contacts"
    | "files_download"
}

Deno.serve(async (req: Request) => {
  if (req.method == "OPTIONS") {
    return jsonResponse({ message: "OK" }, 200)
  }

  const secretKey = Deno.env.get("X-SECRET-KEY");
  const xsecretkey = req.headers.get("X-Secret-Key");
  if (!secretKey || xsecretkey !== secretKey) {
    console.error(
      "Unauthorized increment-usage call",
      {
        hasSecretEnv: Boolean(secretKey),
        hasSecretHeader: Boolean(xsecretkey),
        secretsMatch: Boolean(
          secretKey && xsecretkey && secretKey === xsecretkey,
        ),
      },
    );
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const { userId, guardType } = await req.json() as Body
  if (!userId || !guardType) {
    return jsonResponse({ error: "Missing required fields: userId, guardType" }, 400)
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Supabase env is not configured" }, 500)
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Get user usage
  const { data: userUsage, error: userUsageError } = await supabase.from("user_usage").select("*").eq("user_id", userId).single();
  if (userUsageError) {
    return jsonResponse({ error: userUsageError.message }, 500)
  }

  const usedKey = `${guardType}_used`

  // Increment usage
  const { error: updatedUsageError } = await supabase.from("user_usage").update({
    [usedKey]: userUsage[usedKey] + 1,
  }).eq("id", userUsage.id);
  if (updatedUsageError) {
    return jsonResponse({ error: updatedUsageError.message }, 500)
  }

  return jsonResponse({ message: "OK" }, 200)
})
