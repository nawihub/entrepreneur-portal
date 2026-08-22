import { api } from "@/lib/api/http";
import type { CheckoutSessionRequest, CheckoutSessionResponse } from "@/lib/api/types";

const BASE = "/api/v1/payments";

export const paymentsApi = {
  createCheckoutSession: (payload: CheckoutSessionRequest) =>
    api.post<CheckoutSessionResponse>(`${BASE}/checkout-sessions`, payload),
};

/** Convenience helper: create a checkout session and immediately redirect
 * the browser to it. Webhook confirmation happens server-side; the
 * `successUrl`/`cancelUrl` pages just reflect the outcome the gateway
 * already recorded (e.g. re-fetch the business/order and show its status). */
export async function startCheckout(payload: CheckoutSessionRequest) {
  const { checkoutUrl } = await paymentsApi.createCheckoutSession(payload);
  window.location.assign(checkoutUrl);
}
