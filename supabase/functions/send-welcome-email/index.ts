// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { jsonResponse, STRIPE_FUNCTION_CORS } from "../_shared/stripe-cors.ts";
import {
  buildWelcomeEmailHtml,
} from "./welcome-email-html.ts";

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

  const { displayName, email } = await req.json()
  if (!email) {
    return jsonResponse({ error: "email is required" }, 400);
  }

  const mailgunApiKey = Deno.env.get("MAILGUN_API_KEY");
  // const mailgunDomain = Deno.env.get("MAILGUN_DOMAIN");
  if (!mailgunApiKey) {
    console.error("Something went wrong, send-welcome-email missing Mailgun env");
    return jsonResponse({ error: "server_misconfigured" }, 500);
  }

  try {
    const formData = new FormData();
    formData.append(
      "from",
      `ApplyJet <no-reply@applyjetai.com>`,
    );
    formData.append("to", "Bin Mai <maithienphuc0102@gmail.com>");
    formData.append("subject", "Welcome to ApplyJet!");
    formData.append(
      "html",
      buildWelcomeEmailHtml({
        email,
        displayName,
      }),
    );
    // formData.append(
    //   "text",
    //   buildWelcomeEmailText({
    //     email: user.email,
    //     displayName,
    //   }),
    // );

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
      console.error("Something went wrong sending welcome email:", details);
      return jsonResponse({ error: "Failed to send welcome email" }, 502);
    }
  } catch (error: unknown) {
    console.error("Something went wrong sending welcome email:", error);
    return jsonResponse(
      {
        error: error instanceof Error
          ? error.message
          : "Failed to send welcome email",
      },
      500,
    );
  }

  return jsonResponse({ message: "Welcome email sent" });
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-welcome-email' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6ImFub24iLCJleHAiOjIxMDAyMzUzNjl9.9Geddt1-3mfpNmtZCXvCj2xRX2U6Nj__pG4Ds_J6gaP0Vyiff9ws9ENqP4PoQ1Ay-Z7e2NRE705TGdH9iMRCxA' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
