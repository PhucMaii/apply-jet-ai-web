import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe@^17.3.1";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (name: string) => string | undefined };
};
import { jsonResponse, STRIPE_FUNCTION_CORS } from "../_shared/stripe-cors.ts";

/**
 * Creates a Stripe Customer Portal session for billing self-service.
 * Docs: https://docs.stripe.com/api/customer_portal/sessions/create
 *
 * Body: { origin: string }
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: STRIPE_FUNCTION_CORS });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "method_not_allowed" }, 405);
    }

   const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    // const stripeKey = "sk_test_51TDUgmRdPwUNVtDIxFBPTXwtMvUnBJnJjZW13ISLPCzFw5jMQ7i62wzChPkXGQU2fLcTsyAD8N8cCdhlvydZ84qX00qDIGV47Q"
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    // const appOrigin = Deno.env.get("APP_ORIGIN");
    const appOrigin = "http://applyjetai.com";

    if (!stripeKey || !supabaseUrl || !serviceRole) {
      console.error("Something went wrong, portal missing env");
      return jsonResponse({ error: "server_misconfigured" }, 500);
    }

	const secretKey = Deno.env.get("X-SECRET-KEY");
	const xsecretkey = req.headers.get("X-Secret-Key");
    if (xsecretkey !== secretKey) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

	const payload = await req.json();
	const userId = payload.userId;
	if (!userId) {
		return jsonResponse({ error: "missing_user_id" }, 400);
	}

    const admin = createClient(supabaseUrl, serviceRole);
    const { data: subRow, error: subErr } = await admin
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (subErr) {
      console.error("Something went wrong loading subscription:", subErr);
      return jsonResponse({ error: "db_error" }, 500);
    }

    const customerId = subRow?.stripe_customer_id as string | null;
    if (!customerId) {
      return jsonResponse({ error: "no_customer" }, 400);
    }

    const stripe = new Stripe(stripeKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appOrigin}/profile`,
    });

    return jsonResponse({ url: portal.url });
  } catch (err) {
    console.error("Something went wrong in stripe-customer-portal:", err);
    return jsonResponse({ error: "internal_error" }, 500);
  }
});
