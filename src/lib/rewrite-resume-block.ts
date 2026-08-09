import { env } from "@/lib/env"
import { supabase } from "@/lib/supabase"
import type { RewriteResumeBlockResult } from "@/types/rewrite-resume-block"

export async function invokeRewriteResumeBlock(input: {
	blockId: string
	appResumeId: string
	jdText: string
	userId: string
}): Promise<RewriteResumeBlockResult> {
	const { data, error } = await supabase.functions.invoke(
		"rewrite-resume-block",
		{
			body: {
				blockId: input.blockId,
				appResumeId: input.appResumeId,
				jdText: input.jdText,
				userId: input.userId,
			},
			headers: {
				"X-Secret-Key": env.xsecretkey,
			},
		},
	)

	if (error) {
		const errorMsg = await error.context?.json() as { error: string } || { error: "Failed to rewrite resume block." }
		console.log("error", error)
		console.log("errorMsg", errorMsg)
		console.error("Something went wrong invoking rewrite-resume-block:", errorMsg)
		throw new Error(errorMsg.error || "Failed to rewrite resume block.")
	} else {
		console.log("data", data)
	}

	if (!data || typeof data !== "object") {
		throw new Error("Empty rewrite response.")
	}

	if ("error" in data && data.error) {
		throw new Error(
			typeof data.error === "string"
				? data.error
				: "Rewrite request failed.",
		)
	}

	const result = data as RewriteResumeBlockResult
	if (
		!result.blockId ||
		!result.content_json ||
		typeof result.content_json !== "object"
	) {
		throw new Error("Malformed rewrite response.")
	}

	return result
}
