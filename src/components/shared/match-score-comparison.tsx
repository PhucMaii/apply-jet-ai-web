import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MatchScoreComparisonProps {
	oldScore: number
	newScore: number
	heading?: string
	className?: string
	children?: ReactNode
}

const SCORE_HEADING = "Match score vs job description"
const SCORE_BEFORE = "Before"
const SCORE_AFTER = "After"

export function MatchScoreComparison({
	oldScore,
	newScore,
	heading = SCORE_HEADING,
	className,
	children,
}: MatchScoreComparisonProps) {
	const clampedOld = Math.min(100, Math.max(0, oldScore))
	const clampedNew = Math.min(100, Math.max(0, newScore))

	return (
		<div
			className={cn(
				"flex w-full flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4",
				className,
			)}
			role="region"
			aria-label={heading}
		>
			<p className="text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
				{heading}
			</p>
			<div className="grid w-full grid-cols-1 items-center gap-2 min-[480px]:grid-cols-[1fr_auto_1fr]">
				<div className="flex min-w-0 flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-[#9b5555]">
					<div className="flex items-center gap-2">
						<span className="inline-flex size-7 items-center justify-center rounded-full bg-[#9b5555]/10">
							<TrendingDown className="size-4" aria-hidden />
						</span>
						<span className="text-xs font-semibold uppercase tracking-wide">
							{SCORE_BEFORE}
						</span>
					</div>
					<span className="font-display text-3xl font-semibold tabular-nums leading-none sm:text-4xl">
						{clampedOld}
						<span className="ml-0.5 text-sm font-semibold opacity-70">
							%
						</span>
					</span>
					<div
						className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200"
						aria-hidden
					>
						<span
							className="block h-full rounded-full bg-[#b97878]"
							style={{ width: `${clampedOld}%` }}
						/>
					</div>
				</div>

				<span
					className="mx-auto flex size-8 items-center justify-center rounded-full bg-white text-neutral-400 min-[480px]:mx-0"
					aria-hidden
				>
					<ArrowRight className="size-5 rotate-90 min-[480px]:rotate-0" />
				</span>

				<div className="flex min-w-0 flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-[#4f765e]">
					<div className="flex items-center gap-2">
						<span className="inline-flex size-7 items-center justify-center rounded-full bg-[#4f765e]/10">
							<TrendingUp className="size-4" aria-hidden />
						</span>
						<span className="text-xs font-semibold uppercase tracking-wide">
							{SCORE_AFTER}
						</span>
					</div>
					<span className="font-display text-3xl font-semibold tabular-nums leading-none sm:text-4xl">
						{clampedNew}
						<span className="ml-0.5 text-sm font-semibold opacity-70">
							%
						</span>
					</span>
					<div
						className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200"
						aria-hidden
					>
						<span
							className="block h-full rounded-full bg-[#6d927b]"
							style={{ width: `${clampedNew}%` }}
						/>
					</div>
				</div>
			</div>
			{children}
		</div>
	)
}

// eslint-disable-next-line react-refresh/only-export-components
export function getMatchScores(
	oldScore: number | null | undefined,
	newScore: number | null | undefined,
): { oldScore: number; newScore: number } | null {
	if (
		typeof oldScore !== "number" ||
		!Number.isFinite(oldScore) ||
		typeof newScore !== "number" ||
		!Number.isFinite(newScore)
	) {
		return null
	}

	return { oldScore, newScore }
}
