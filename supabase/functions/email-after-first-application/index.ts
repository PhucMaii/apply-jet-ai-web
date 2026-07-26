// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { jsonResponse, STRIPE_FUNCTION_CORS } from "../_shared/stripe-cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildFirstApplicationEmailHtml,
  buildFirstApplicationEmailText,
} from "./first-application-email-html.ts";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (name: string) => string | undefined };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: STRIPE_FUNCTION_CORS });
  }

  const secretKey = Deno.env.get("X-SECRET-KEY");
  const xsecretkey = req.headers.get("X-Secret-Key");
  if (xsecretkey !== secretKey) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const { userId } = await req.json()
  if (!userId) {
    return jsonResponse({ error: "userId is required" }, 400);
  }

  const mailgunApiKey = Deno.env.get("MAILGUN_API_KEY");
  if (!mailgunApiKey) {
    console.error(
      "Something went wrong, email-after-first-application missing Mailgun env",
    );
    return jsonResponse({ error: "server_misconfigured" }, 500);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: { user }, error } = await supabase.auth.admin.getUserById(
    userId,
  );
  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }
  if (!user?.email) {
    return jsonResponse({ error: "User not found" }, 404);
  }

  const displayName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null

  try {
    const formData = new FormData();
    formData.append(
      "from",
      `ApplyJet <no-reply@applyjetai.com>`,
    );
    formData.append("to", user.email);
    formData.append("subject", "Congratulations on your first application");
    formData.append(
      "html",
      buildFirstApplicationEmailHtml({
        email: user.email,
        displayName,
      }),
    );
    formData.append(
      "text",
      buildFirstApplicationEmailText({
        email: user.email,
        displayName,
      }),
    );

    const response = await fetch(
      `https://api.mailgun.net/v3/mg.applyjetai.com/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`api:${mailgunApiKey}`)}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const details = await response.text();
      console.error(
        "Something went wrong sending first-application email:",
        details,
      );
      return jsonResponse(
        { error: "Failed to send first-application email" },
        502,
      );
    }
  } catch (error: unknown) {
    console.error(
      "Something went wrong sending first-application email:",
      error,
    );
    return jsonResponse(
      {
        error: error instanceof Error
          ? error.message
          : "Failed to send first-application email",
      },
      500,
    );
  }

  return jsonResponse({ message: "First-application email sent" });
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/email-after-first-application' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6ImFub24iLCJleHAiOjIxMDA0MDI4NDh9.9QF-IhZ4xAxc5sompzsLL1MjZrbgVtGR1DvpwyjGM3vUlzJ7hj-74hT3tKUZIVlviRT94cLus-3kW5WGIr0rdQ' \
    --header 'Content-Type: application/json' \
    --header 'X-Secret-Key: YOUR_SECRET' \
    --data '{"userId":"USER_UUID"}'

*/
