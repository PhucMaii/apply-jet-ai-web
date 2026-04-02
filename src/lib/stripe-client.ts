import { EDGE_FUNCTIONS } from "@/lib/constants";
import { env } from "@/lib/env";
import { invokeEdgeFunction } from "@/lib/edge-function";
import { supabase } from "./supabase";

type PortalResponse = { url?: string | null; error?: string };

/**
 * Opens Stripe Checkout (subscription mode) for the Pro plan.
 * Requires deployed `stripe-checkout` Edge Function and secrets.
 */
export async function startProSubscriptionCheckout() {
  // const result = await invokeEdgeFunction<CheckoutResponse>(
  // 	EDGE_FUNCTIONS.stripeCheckout,
  // 	{
  // 		origin,
  // 		priceId: env.stripeProPriceId || undefined,
  // 	},
  // )
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { ok: false as const, message: "User not found" };
  }
  if (!env.stripeProPriceId) {
    return { ok: false as const, message: "Stripe price not found" };
  }
  const result = await invokeEdgeFunction<PortalResponse>(
    EDGE_FUNCTIONS.stripeCheckout,
    {
      priceId: env.stripeProPriceId,
      userId: user.id,
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
