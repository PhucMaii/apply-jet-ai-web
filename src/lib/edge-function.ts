import { supabase } from "@/lib/supabase"
import { env } from "@/lib/env"

export type EdgeInvokeResult<T> =
	| { ok: true; data: T }
	| { ok: false; message: string }

/**
 * Invokes a Supabase Edge Function with the caller's JWT when logged in.
 */
export async function invokeEdgeFunction<T = unknown>(
	functionName: string,
	body?: Record<string, unknown>,
): Promise<EdgeInvokeResult<T>> {
	if (!env.isSupabaseConfigured) {
		return {
			ok: false,
			message: "Supabase is not configured. Check your environment variables.",
		}
	}

	console.log("body", {body, env: env.xsecretkey})
	try {
		const { data } = await supabase.functions.invoke<T>(functionName, {
			body: body ?? {},
			headers: {
				"X-Secret-Key": env.xsecretkey,
			}
		})

		console.log("data", data)

		return { ok: true, data: data as T }
	} catch (err) {
		console.error("Something went wrong invoking edge function:", err)
		return {
			ok: false,
			message:
				err instanceof Error ? err.message : "Unexpected edge function error.",
		}
	}
}

export function getExampleEdgeFunctionName() {
	return env.edgeFunctionExampleName
}
