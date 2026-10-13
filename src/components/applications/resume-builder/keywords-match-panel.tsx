import { useMemo } from "react"
import { Check, Loader2, Plus, Sparkles } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import type { ExtractedKeyword } from "@/lib/atsScoring"
import {
	ADDABLE_KEYWORD_CATEGORIES,
	normalizeSkillName,
} from "@/lib/keyword-skills"
import { cn } from "@/lib/utils"

const KEYWORD_CATEGORY_LABEL = {
	hard_skill: "Skill",
	tool: "Tool",
	soft_skill: "Soft skill",
	certification: "Cert",
	responsibility: "Role",
} as const satisfies Record<ExtractedKeyword["category"], string>

interface KeywordsMatchPanelProps {
	missingKeywords: ExtractedKeyword[]
	addedTerms: Set<string>
	pendingTerm: string | null
	isReady: boolean
	onAddKeyword: (keyword: ExtractedKeyword) => void
}

export function KeywordsMatchPanel({
	missingKeywords,
	addedTerms,
	pendingTerm,
	isReady,
	onAddKeyword,
}: KeywordsMatchPanelProps) {
	const reduceMotion = useReducedMotion()

	const actionableKeywords = useMemo(() => {
		return missingKeywords
			.filter((keyword) => ADDABLE_KEYWORD_CATEGORIES.has(keyword.category))
			.slice(0, 16)
	}, [missingKeywords])

	if (!isReady) {
		return (
			<p className="text-sm text-neutral-500">
				Keyword insights appear once scoring finishes.
			</p>
		)
	}

	if (actionableKeywords.length === 0) {
		return (
			<div className="flex items-start gap-2 rounded-lg bg-emerald-50/80 px-3 py-2.5 text-sm text-emerald-800">
				<Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
				<p>
					Strong keyword coverage for this job description. Keep refining
					bullets if you want an even tighter match.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-3">
			<div className="space-y-1">
				<p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
					Missing · tap to add ({actionableKeywords.length})
				</p>
				<p className="text-xs leading-relaxed text-neutral-500">
					Adds the keyword to your resume Skills section and saves it to
					your profile for future applications.
				</p>
			</div>

			<ul className="flex flex-wrap gap-1.5" aria-label="Missing keywords">
				{actionableKeywords.map((keyword) => {
					const key = normalizeSkillName(keyword.term)
					const isAdded = addedTerms.has(key)
					const isPending = pendingTerm === key

					return (
						<li key={`${keyword.term}-${keyword.category}`}>
							<motion.button
								type="button"
								disabled={isAdded || isPending}
								onClick={() => onAddKeyword(keyword)}
								aria-label={
									isAdded
										? `${keyword.term} added to resume`
										: `Add ${keyword.term} to resume and profile`
								}
								initial={false}
								animate={
									reduceMotion
										? undefined
										: isAdded
											? { scale: [1, 1.06, 1] }
											: { scale: 1 }
								}
								transition={{ duration: 0.28, ease: "easeOut" }}
								className={cn(
									"group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-1",
									isAdded
										? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-800"
										: isPending
											? "cursor-wait border-amber-200 bg-amber-50 text-amber-800"
											: "border-amber-200/80 bg-amber-50 text-amber-950 hover:border-brand/40 hover:bg-brand/5 hover:text-brand",
								)}
							>
								{isPending ? (
									<Loader2
										className="size-3.5 shrink-0 animate-spin"
										aria-hidden
									/>
								) : isAdded ? (
									<Check
										className="size-3.5 shrink-0 text-emerald-600"
										aria-hidden
									/>
								) : (
									<Plus
										className="size-3.5 shrink-0 text-amber-700 transition-colors group-hover:text-brand"
										aria-hidden
									/>
								)}
								<span>{keyword.term}</span>
								<span
									className={cn(
										"rounded px-1 py-px text-[9px] font-semibold uppercase tracking-wide",
										isAdded
											? "bg-emerald-100/80 text-emerald-700"
											: "bg-amber-100/80 text-amber-700",
									)}
								>
									{KEYWORD_CATEGORY_LABEL[keyword.category]}
								</span>
							</motion.button>
						</li>
					)
				})}
			</ul>
		</div>
	)
}
