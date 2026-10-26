import { env } from "@/lib/env"
import { supabase } from "@/lib/supabase"
import type { RewriteResumeBlockResult } from "@/types/rewrite-resume-block"

export async function invokeRewriteResumeBlock(input: {
	blockId: string
	appResumeId: string
	jdText: string
	userId: string
	/** Persist rewritten content to the block (jobs tailor). Studio omits this. */
	apply?: boolean
}): Promise<RewriteResumeBlockResult> {
	const { data, error } = await supabase.functions.invoke(
		"rewrite-resume-block",
		{
			body: {
				blockId: input.blockId,
				appResumeId: input.appResumeId,
				jdText: input.jdText,
				userId: input.userId,
				apply: input.apply === true,
			},
			headers: {
				"X-Secret-Key": env.xsecretkey,
			},
		},
	)

	if (error) {
		const errorMsg =
			(await error.context?.json()) as { error: string } || {
				error: "Failed to rewrite resume block.",
			}
		console.error(
			"Something went wrong invoking rewrite-resume-block:",
			errorMsg,
		)
		throw new Error(errorMsg.error || "Failed to rewrite resume block.")
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
