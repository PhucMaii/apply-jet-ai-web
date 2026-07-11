export const STRIPE_FUNCTION_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, x-secret-key, content-type",
} as const;

export function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  headers: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...STRIPE_FUNCTION_CORS,
      "Content-Type": "application/json",
      ...headers,
    },
  });
}
