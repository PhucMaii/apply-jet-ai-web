import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@^17.3.1";
import { jsonResponse, STRIPE_FUNCTION_CORS } from "../_shared/stripe-cors.ts";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (name: string) => string | undefined };
};

/**
 * Syncs Stripe subscription state into public.subscriptions.
 * Configure endpoint in Stripe Dashboard → Webhooks.
 * Events: checkout.session.completed, customer.subscription.*
 *
 * Secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "active":
    case "trialing":
      return status;
    case "past_due":
    case "unpaid":
      return status;
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    case "incomplete":
    case "paused":
      return status;
    default:
      return status;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: STRIPE_FUNCTION_CORS });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "method_not_allowed" }, 405);
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    // const webhookSecret = "whsec_7ahE9UbrEomdofjKVRMZtT6J4lJWfnC1";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceRole) {
      console.error("Something went wrong, stripe-webhook missing env");
      return new Response("misconfigured", { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    if (!signature) {
      return new Response("no signature", { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.error("Something went wrong verifying webhook:", err);
      return new Response("invalid signature", { status: 400 });
    }

    const admin = createClient(supabaseUrl, serviceRole);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.supabase_user_id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        console.log(session, "session");
        console.log(subId, "subId");

        if (!userId || !customerId || !subId) {
          console.error("checkout.session.completed missing ids", {
            userId: !!userId,
            customerId: !!customerId,
            subId: !!subId,
          });
          break;
        }

        const sub = await stripe.subscriptions.retrieve(subId);
        const plan: "free" | "pro" =
          sub.status === "canceled" || sub.status === "incomplete_expired"
            ? "free"
            : "pro";

        const { error } = await admin
          .from("user_subscriptions")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subId,
            stripe_price_id: sub.items.data[0].price.id,
            plan,
            status: mapStripeStatus(sub.status),
            current_period_end: new Date(
              sub.current_period_end * 1000,
            ).toISOString(),
            current_period_start: new Date(
              sub.current_period_start * 1000,
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Something went wrong updating subscription:", error);
          return new Response("db error", { status: 500 });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const subId = sub.id;
        const userId = sub.metadata?.supabase_user_id;
        const itemData = sub.items.data[0];

        const plan: "free" | "pro" =
          sub.status === "canceled" || sub.status === "incomplete_expired"
            ? "free"
            : "pro";

        const { error } = await admin
          .from("user_subscriptions")
          .update({
            plan,
            status: mapStripeStatus(sub.status),
            canceled_at: sub.canceled_at
              ? new Date(sub.canceled_at * 1000).toISOString()
              : null,
            stripe_subscription_id: subId,
            stripe_customer_id: sub.customer as string,
            stripe_price_id: itemData.price.id,
            current_period_end: new Date(
              itemData.current_period_end * 1000,
            ).toISOString(),
            current_period_start: new Date(
              itemData.current_period_start * 1000,
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Something went wrong syncing subscription:", error);
          return new Response("db error", { status: 500 });
        }

        // Get user id from subscription id
        const { data: subscriptionRow } = await admin
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subId)
          .maybeSingle();

        if (!subscriptionRow) {
          console.error(
            "Something went wrong getting user id from subscription:",
            subId,
          );
          return new Response("db error", { status: 500 });
        }

        // Handle if subscription is cancelled
        if (event.type === "customer.subscription.deleted") {
          // Reset user usage
          const { error: usageError } = await admin
            .from("user_usage")
            .update({
              resume_generations_limit: 10,
              cover_letters_limit: 10,
              extract_text_limit: 10,
              applications_answers_limit: 0,
              plan_key: "free",
            })
            .eq("user_id", subscriptionRow.user_id);

          if (usageError) {
            console.error(
              "Something went wrong resetting user usage:",
              usageError,
            );
            return new Response("db error", { status: 500 });
          }
        }
        break;
      }

      // Handle renewal of subscription
      case "invoice.paid": {
        // Get user id from subscription id
        const invoice = event.data.object as Stripe.Invoice;
        const userId = invoice.lines.data[0].metadata.supabase_user_id;

        // Update user usage
        const { error: usageError } = await admin
          .from("user_usage")
          .update({
            resume_generations_limit: 200,
            cover_letters_limit: 200,
            extract_text_limit: 200,
            application_answers_limit: 200,
            plan_key: "pro",
          })
          .eq("user_id", userId);

        if (usageError) {
          console.error(
            "Something went wrong updating user usage:",
            usageError,
          );
          return new Response("db error", { status: 500 });
        }
        break;
      }

      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Something went wrong in stripe-webhook:", err);
    return new Response("error", { status: 500 });
  }
});
