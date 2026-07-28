
export function ScoreGauge({ score, issues }: { score: number; issues: number }) {
	const radius = 54
	const circumference = 2 * Math.PI * radius
	const progress = Math.min(100, Math.max(0, score)) / 100
	const offset = circumference * (1 - progress)

	return (
		<div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 text-center">
			<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
				Resume Score
			</p>
			<div className="relative mx-auto mt-3 size-32">
				<svg viewBox="0 0 128 128" className="size-full -rotate-90">
					<circle
						cx="64"
						cy="64"
						r={radius}
						fill="none"
						stroke="#e5e7eb"
						strokeWidth="10"
					/>
					<circle
						cx="64"
						cy="64"
						r={radius}
						fill="none"
						stroke="currentColor"
						strokeWidth="10"
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						className="text-primary transition-[stroke-dashoffset] duration-500"
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<p className="font-display text-3xl font-semibold tabular-nums text-neutral-900">
						{score}
					</p>
					<p className="text-[11px] text-neutral-500">/ 100</p>
				</div>
			</div>
			<p className="mt-2 text-sm text-neutral-600">
				{issues} issue{issues === 1 ? "" : "s"} found
			</p>
		</div>
	)
}