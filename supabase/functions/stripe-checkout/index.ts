import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "npm:stripe@^17.3.1"
import { STRIPE_FUNCTION_CORS, jsonResponse } from "../_shared/stripe-cors.ts"

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void
  env: { get: (name: string) => string | undefined }
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: STRIPE_FUNCTION_CORS });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "method_not_allowed" }, 405);
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    const defaultPrice = Deno.env.get("STRIPE_PRICE_PRO")

    if (!stripeKey || !supabaseUrl || !anonKey || !serviceRole) {
      console.error("Something went wrong, stripe-checkout missing env:", {
        stripeKey: !!stripeKey,
        supabaseUrl: !!supabaseUrl
      })
      return jsonResponse({ error: "server_misconfigured" }, 500)
    }

    const secretKey = Deno.env.get("X-SECRET-KEY");
    const xsecretkey = req.headers.get("X-Secret-Key");
    if (xsecretkey !== secretKey) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    const payload = await req.json();

    const priceId = payload.priceId ?? defaultPrice
    const userId = payload.userId

    if (!priceId) {
      return jsonResponse({ error: "missing_price_or_origin" }, 400)
    }

    const admin = createClient(supabaseUrl, serviceRole)

    const { data: user } = await admin
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    const { data: subRow } = await admin
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle()

    const stripe = new Stripe(stripeKey, {
      httpClient: Stripe.createFetchHttpClient()
    })

    let customerId = subRow?.stripe_customer_id as string | null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id }
      })
      customerId = customer.id

      const { error: upErr } = await admin.from("user_subscriptions").upsert(
        {
          user_id: user.id,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      )

      if (upErr) {
        console.error("Something went wrong saving customer id:", upErr)
        return jsonResponse({ error: "db_error" }, 500)
      }
    }

    const successUrl = `http://applyjetai.com/profile?checkout=success&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `http://applyjetai.com/profile?checkout=cancel`

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id }
      },
      allow_promotion_codes: true
    })

    return jsonResponse({ url: session.url })
  } catch (err) {
    console.error("Something went wrong in stripe-checkout:", err)
    return jsonResponse({ error: "internal_error" }, 500)
  }
})
