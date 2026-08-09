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
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   STRIPE_PRICE_INTERN_PACK, STRIPE_PRICE_JUNIOR_PACK,
 *   STRIPE_PRICE_ADVANCED_PACK
 */

type PackKey = "intern_pack" | "junior_pack" | "advanced_pack";

interface PackCredits {
  packKey: PackKey;
  aiGenerations: number;
  coverLetters: number;
  filesDownload: number;
  findHr: number;
}

interface UsageLimitsRow {
  ai_generations_limit?: number | null;
  resume_generations_limit?: number | null;
  cover_letters_limit?: number | null;
  files_download_limit?: number | null;
  find_hr_limit?: number | null;
}

const STARTER_USAGE_RESET = {
  resume_generations_limit: 10,
  cover_letters_limit: 5,
  extract_text_limit: 10,
  files_download_limit: 5,
  find_hr_limit: 0,
  ai_generations_limit: 10,
  ai_generations_used: 0,
  resume_generations_used: 0,
  cover_letters_used: 0,
  extract_text_used: 0,
  files_download_used: 0,
  find_hr_used: 0,
  plan_key: "free",
} as const;

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

function resolvePackCredits(
  priceId: string | null | undefined,
): PackCredits | null {
  if (!priceId) return null;

  // const internPrice = Deno.env.get("STRIPE_PRICE_INTERN_PACK");
  // const juniorPrice = Deno.env.get("STRIPE_PRICE_JUNIOR_PACK");
  // const advancedPrice = Deno.env.get("STRIPE_PRICE_ADVANCED_PACK");
  const internPrice = "price_1U2F5KRdPwUNVtDIerf1YwGm";
  const juniorPrice = "price_1U2F69RdPwUNVtDILVFOIVLa";
  const advancedPrice = "price_1U1qhLDcwEeENZwpFtJpB7PS";

  if (internPrice && priceId === internPrice) {
    return {
      packKey: "intern_pack",
      aiGenerations: 10,
      coverLetters: 10,
      filesDownload: 10,
      findHr: 0,
    };
  }
  if (juniorPrice && priceId === juniorPrice) {
    return {
      packKey: "junior_pack",
      aiGenerations: 50,
      coverLetters: 50,
      filesDownload: 50,
      findHr: 25,
    };
  }
  if (advancedPrice && priceId === advancedPrice) {
    return {
      packKey: "advanced_pack",
      aiGenerations: 100,
      coverLetters: 100,
      filesDownload: 100,
      findHr: 50,
    };
  }

  return null;
}

function asLimit(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function resolveCheckoutPriceId(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<string | null> {
  if (session.metadata?.stripe_price_id) {
    return session.metadata.stripe_price_id;
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 1,
  });
  const price = lineItems.data[0]?.price;
  return typeof price === "string" ? price : (price?.id ?? null);
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
    // const stripeKey =
    //   "sk_test_51TDUgmRdPwUNVtDIxFBPTXwtMvUnBJnJjZW13ISLPCzFw5jMQ7i62wzChPkXGQU2fLcTsyAD8N8cCdhlvydZ84qX00qDIGV47Q";
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
      console.log("body", body);
      console.log("signature", signature);
      console.log("webhookSecret", webhookSecret);
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
        if (session.mode === "payment" && session.payment_status == "paid") {
          const userId = session.metadata?.supabase_user_id;
          if (!userId) {
            console.error(
              "Something went wrong: payment checkout missing user id",
            );
            return new Response("db error", { status: 500 });
          }

          const priceId = await resolveCheckoutPriceId(stripe, session);
          const pack = resolvePackCredits(priceId);
          if (!pack) {
            console.error("Something went wrong: unknown one-time price", {
              priceId,
              sessionId: session.id,
            });
            return new Response("unknown_price", { status: 400 });
          }

          const { data: usage, error: usageSelectError } = await admin
            .from("user_usage")
            .select(
              "user_id, ai_generations_limit, resume_generations_limit, cover_letters_limit, files_download_limit, find_hr_limit",
            )
            .eq("user_id", userId)
            .maybeSingle();

          if (usageSelectError || !usage) {
            console.error("User usage not found:", {
              userId,
              usageSelectError,
            });
            return new Response("db error", { status: 500 });
          }

          const usageRow = usage as UsageLimitsRow;
          const nextAiLimit =
            asLimit(usageRow.ai_generations_limit) + pack.aiGenerations;

          const updatedUsage = {
            ai_generations_limit: nextAiLimit,
            resume_generations_limit:
              asLimit(usageRow.resume_generations_limit) + pack.aiGenerations,
            cover_letters_limit:
              asLimit(usageRow.cover_letters_limit) + pack.coverLetters,
            files_download_limit:
              asLimit(usageRow.files_download_limit) + pack.filesDownload,
            find_hr_limit: asLimit(usageRow.find_hr_limit) + pack.findHr,
            plan_key: pack.packKey,
          };

          const { error: usageError } = await admin
            .from("user_usage")
            .update(updatedUsage)
            .eq("user_id", userId);

          if (usageError) {
            console.error(
              "Something went wrong updating user usage:",
              usageError,
            );
            return new Response("db error", { status: 500 });
          }
        }

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

        if (plan === "pro") {
          const { error: usageError } = await admin
            .from("user_usage")
            .update({ plan_key: "pro" })
            .eq("user_id", userId);

          if (usageError) {
            console.error(
              "Something went wrong marking Pro usage:",
              usageError,
            );
            return new Response("db error", { status: 500 });
          }
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

        if (event.type === "customer.subscription.deleted") {
          const { error: usageError } = await admin
            .from("user_usage")
            .update(STARTER_USAGE_RESET)
            .eq("user_id", subscriptionRow.user_id);

          if (usageError) {
            console.error(
              "Something went wrong resetting user usage:",
              usageError,
            );
            return new Response("db error", { status: 500 });
          }
        } else if (plan === "pro") {
          const { error: usageError } = await admin
            .from("user_usage")
            .update({ plan_key: "pro" })
            .eq("user_id", subscriptionRow.user_id);

          if (usageError) {
            console.error(
              "Something went wrong marking Pro usage:",
              usageError,
            );
            return new Response("db error", { status: 500 });
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const lineMeta = invoice.lines?.data?.[0]?.metadata as
          | Record<string, string>
          | null
          | undefined;
        const userId = lineMeta?.supabase_user_id;

        if (!userId) {
          console.error(
            "Something went wrong: invoice.paid missing supabase_user_id",
          );
          break;
        }

        // Pro is unlimited via subscription.plan; only mark plan_key.
        const { error: usageError } = await admin
          .from("user_usage")
          .update({ plan_key: "pro" })
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
