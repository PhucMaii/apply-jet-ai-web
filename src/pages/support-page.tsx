import { Link } from "react-router-dom"
import {
	BookOpen,
	CreditCard,
	LifeBuoy,
	Mail,
	Shield,
} from "lucide-react"
import { MarketingPageShell } from "@/components/layout/marketing-page-shell"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"
import { APP_NAME, LINKS, ROUTES, SUPPORT_EMAIL } from "@/lib/constants"
import { cn } from "@/lib/utils"

const SUPPORT_CARDS = [
	{
		key: "email",
		title: "Email the team",
		description:
			"Billing questions, bugs, or feature ideas—send a message and we will get back as soon as we can.",
		email: SUPPORT_EMAIL,
		icon: Mail,
		ctaLabel: "Open email",
		href: LINKS.contactMail,
		external: true,
	},
	{
		key: "account",
		title: "Profile & applications",
		description:
			"Manage your autofill profile, resume, skills, and saved applications from your dashboard.",
		icon: BookOpen,
		ctaLabel: "Go to profile",
		to: ROUTES.profile,
		external: false,
	},
	{
		key: "billing",
		title: "Plan & billing",
		description:
			"Upgrade, manage payment methods, or open the Stripe customer portal from your profile billing tab.",
		icon: CreditCard,
		ctaLabel: "Open billing",
		to: ROUTES.profile,
		external: false,
		billingHint: true,
	},
	{
		key: "legal",
		title: "Privacy & terms",
		description:
			"How we handle data and the rules for using the product—always good to skim before you apply at scale.",
		icon: Shield,
		ctaLabel: "Privacy",
		to: ROUTES.privacy,
		secondaryTo: ROUTES.terms,
		secondaryLabel: "Terms",
		external: false,
	},
] as const

export function SupportPage() {
	return (
		<MarketingPageShell className="flex flex-col">
			<SiteHeader />
			<main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
				<div
					className={cn(
						"rounded-xl border border-landing-border bg-landing-paper p-6",
						"shadow-[0_1px_3px_rgba(26,26,46,0.06),0_12px_40px_-12px_rgba(26,26,46,0.08)]",
						"sm:p-8",
					)}
				>
					<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
						<div className="flex gap-4">
							<span
								className={cn(
									"flex size-14 shrink-0 items-center justify-center rounded-xl",
									"border border-landing-border bg-landing-sand text-landing-primary",
								)}
							>
								<LifeBuoy className="size-7" aria-hidden />
							</span>
							<div>
								<p className="text-sm font-medium text-landing-primary">
									Help center
								</p>
								<h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-landing-ink sm:text-4xl">
									Support
								</h1>
								<p className="mt-3 max-w-xl text-sm leading-relaxed text-landing-muted sm:text-base">
									We built {APP_NAME} to cut friction on real job applications.
									If something breaks or feels confusing, use the options below—
									we read every message.
								</p>
							</div>
						</div>
						<Button
							variant="secondary"
							surface="light"
							className="shrink-0 gap-2 self-start"
							asChild
						>
							<a href={LINKS.contactMail}>
								<Mail className="size-4" aria-hidden />
								Contact us
							</a>
						</Button>
					</div>
				</div>

				<div className="mt-10 grid gap-4 sm:grid-cols-2">
					{SUPPORT_CARDS.map((item) => {
						const Icon = item.icon
						return (
							<article
								key={item.key}
								className={cn(
									"rounded-xl border border-landing-border bg-landing-paper p-5",
									"shadow-[0_1px_2px_rgba(26,26,46,0.04)]",
									"transition-[transform,box-shadow,border-color] duration-300 ease-out",
									"hover:-translate-y-0.5 hover:border-landing-primary/25",
									"hover:shadow-[0_12px_40px_-16px_rgba(26,26,46,0.14)]",
									"sm:p-6",
								)}
							>
								<div className="flex items-start gap-3">
									<span
										className={cn(
											"flex size-10 shrink-0 items-center justify-center rounded-lg",
											"border border-landing-border bg-landing-sand text-landing-ink",
										)}
									>
										<Icon className="size-5" aria-hidden />
									</span>
									<div className="min-w-0">
										<h2 className="font-display text-lg font-medium text-landing-ink">
											{item.title}
										</h2>
										<p className="mt-1.5 text-sm leading-relaxed text-landing-muted">
											{item.description}
											{"email" in item && item.email ? (
												<a
													href={item.href}
													className="mt-3 block text-base font-semibold text-landing-primary underline-offset-4 hover:underline"
												>
													{item.email}
												</a>
											) : null}
											{"billingHint" in item && item.billingHint ? (
												<span className="mt-2 block text-xs text-landing-muted">
													Tip: open{" "}
													<Link
														to={ROUTES.profile}
														className="font-medium text-landing-primary underline-offset-4 hover:underline"
													>
														Profile
													</Link>
													, then switch to the Billing tab.
												</span>
											) : null}
										</p>
									</div>
								</div>

								<div className="mt-5 flex flex-wrap gap-2">
									{"href" in item && item.external ? (
										<Button size="sm" variant="secondary" surface="light" asChild>
											<a href={item.href}>{item.ctaLabel}</a>
										</Button>
									) : null}
									{"to" in item && !item.external ? (
										<>
											<Button size="sm" variant="secondary" surface="light" asChild>
												<Link to={item.to}>{item.ctaLabel}</Link>
											</Button>
											{"secondaryTo" in item && item.secondaryTo ? (
												<Button size="sm" variant="ghost" surface="light" asChild>
													<Link to={item.secondaryTo}>
														{item.secondaryLabel}
													</Link>
												</Button>
											) : null}
										</>
									) : null}
								</div>
							</article>
						)
					})}
				</div>

				<p className="mt-10 text-center text-xs leading-relaxed text-landing-muted">
					Response times vary; include your account email and what you were doing
					when the issue happened so we can reproduce it faster.
				</p>
			</main>
			<SiteFooter />
		</MarketingPageShell>
	)
}
