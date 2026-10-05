import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingSignupLink } from "@/components/landing/landing-signup-link"
import { useLandingCopy } from "@/context/landing-copy-context"
import { ROUTES } from "@/lib/constants"

export function FinalCta() {
	const { finalCta } = useLandingCopy()

	return (
		<section className="px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
			<div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-brand px-6 py-14 text-center sm:px-12 sm:py-20">
				<h2 className="mx-auto max-w-2xl font-display text-3xl font-medium tracking-tight text-white text-balance sm:text-4xl">
					{finalCta.title}
				</h2>
				<p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/80 text-pretty">
					{finalCta.description}
				</p>
				<div className="mt-9 flex flex-col items-center gap-4">
					<Button
						size="lg"
						className="bg-white text-brand-ink hover:bg-brand-soft focus-visible:ring-white/60 focus-visible:ring-offset-brand"
						asChild
					>
						<LandingSignupLink location="final_cta" label={finalCta.primaryCta}>
							{finalCta.primaryCta}
							<ArrowRight aria-hidden />
						</LandingSignupLink>
					</Button>
					<Link
						to={ROUTES.login}
						className="rounded text-sm text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
					>
						{finalCta.loginLink}
					</Link>
				</div>
			</div>
		</section>
	)
}
