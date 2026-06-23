import { EDGE_FUNCTIONS } from "@/lib/constants";
import { env } from "@/lib/env";
import { invokeEdgeFunction } from "@/lib/edge-function";
import { supabase } from "./supabase";

type PortalResponse = { url?: string | null; error?: string };

type CheckoutMode = "subscription" | "payment";

async function startStripeCheckout(priceId: string, mode: CheckoutMode) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { ok: false as const, message: "User not found" };
  }
  if (!priceId) {
    return { ok: false as const, message: "Stripe price not found" };
  }
  const result = await invokeEdgeFunction<PortalResponse>(
    EDGE_FUNCTIONS.stripeCheckout,
    {
      priceId,
      userId: user.id,
      mode,
    },
  );

  if (!result.ok) {
    return { ok: false as const, message: result.message };
  }

  const url = result.data?.url ?? result.data?.error;
  if (!url) {
    return {
      ok: false as const,
      message: result.data?.error ?? "Checkout did not return a URL.",
    };
  }

  window.location.assign(url);
  return { ok: true as const };
}

/**
 * Opens Stripe Checkout (subscription mode) for the Pro plan.
 * Requires deployed `stripe-checkout` Edge Function and secrets.
 */
export async function startProSubscriptionCheckout() {
  return startStripeCheckout(env.stripeProPriceId, "subscription");
}

/**
 * Opens Stripe Checkout (payment mode) for the Job Hunt Pack.
 */
export async function startJobHuntPackCheckout() {
  return startStripeCheckout(env.stripeJobHuntPackPriceId, "payment");
}

/**
 * Opens Stripe Customer Portal (payment methods, cancel, invoices).
 */
export async function openStripeCustomerPortal() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { ok: false as const, message: "User not found" };
  }

  const result = await invokeEdgeFunction<PortalResponse>(
    EDGE_FUNCTIONS.stripeCustomerPortal,
    { userId: user.id },
  );

  if (!result.ok) {
    return { ok: false as const, message: result.message };
  }

  const url = result.data?.url;
  if (!url) {
    return {
      ok: false as const,
      message: result.data?.error ?? "Portal did not return a URL.",
    };
  }

  window.location.assign(url);
  return { ok: true as const };
}
