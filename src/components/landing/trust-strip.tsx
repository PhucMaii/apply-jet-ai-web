import { Check } from "lucide-react"
import { useLandingCopy } from "@/context/landing-copy-context"

export function TrustStrip() {
	const { trustStrip } = useLandingCopy()

	return (
		<section aria-label="Highlights" className="border-y border-hairline bg-surface">
			<ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 sm:px-6 lg:justify-between lg:px-8">
				{trustStrip.map((label) => (
					<li
						key={label}
						className="flex items-center gap-2 text-sm font-medium text-ink-muted"
					>
						<Check className="size-4 shrink-0 text-emerald-600" aria-hidden />
						{label}
					</li>
				))}
			</ul>
		</section>
	)
}
