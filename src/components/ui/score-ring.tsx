import { cn } from "@/lib/utils"

interface ScoreRingProps {
	/** 0–100. `null` renders an empty ring with a dash. */
	value: number | null
	size?: number
	strokeWidth?: number
	/** Visually hidden label prefix, e.g. "ATS score". */
	label?: string
	className?: string
	valueClassName?: string
}

const SCORE_TONE = [
	{ min: 75, stroke: "stroke-emerald-500", text: "text-emerald-700" },
	{ min: 50, stroke: "stroke-amber-500", text: "text-amber-700" },
	{ min: 0, stroke: "stroke-rose-500", text: "text-rose-700" },
] as const

function getScoreTone(value: number) {
	return SCORE_TONE.find((tone) => value >= tone.min) ?? SCORE_TONE[2]
}

export function ScoreRing({
	value,
	size = 36,
	strokeWidth = 3.5,
	label = "Match score",
	className,
	valueClassName,
}: ScoreRingProps) {
	const radius = (size - strokeWidth) / 2
	const circumference = 2 * Math.PI * radius
	const hasValue = value !== null && Number.isFinite(value)
	const clamped = hasValue ? Math.min(100, Math.max(0, Math.round(value))) : 0
	const tone = hasValue ? getScoreTone(clamped) : null

	return (
		<span
			className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
			style={{ width: size, height: size }}
			role="img"
			aria-label={hasValue ? `${label}: ${clamped} out of 100` : `${label}: not scored yet`}
		>
			<svg width={size} height={size} className="-rotate-90" aria-hidden>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					strokeWidth={strokeWidth}
					className="stroke-hairline"
				/>
				{hasValue ? (
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={circumference * (1 - clamped / 100)}
						className={cn(
							tone?.stroke,
							"transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none",
						)}
					/>
				) : null}
			</svg>
			<span
				className={cn(
					"absolute text-[11px] font-semibold tabular-nums",
					tone ? tone.text : "text-ink-subtle",
					valueClassName,
				)}
				aria-hidden
			>
				{hasValue ? clamped : "—"}
			</span>
		</span>
	)
}
