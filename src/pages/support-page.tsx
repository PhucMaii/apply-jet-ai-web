import { Link } from "react-router-dom"
import {
	BookOpen,
	Chrome,
	CreditCard,
	LifeBuoy,
	Mail,
	Shield,
} from "lucide-react"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { APP_NAME, LINKS, ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

const SUPPORT_CARDS = [
	{
		key: "email",
		title: "Email the team",
		description:
			"Billing questions, bugs, or feature ideas—send a message and we will get back as soon as we can.",
		icon: Mail,
		ctaLabel: "Open email",
		href: LINKS.contactMail,
		external: true,
	},
	{
		key: "extension",
		title: "Chrome extension",
		description:
			"Install or update the extension, and make sure you are signed into the same account as on the web app.",
		icon: Chrome,
		ctaLabel: "Get extension",
		href: LINKS.extensionDownload,
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
		<div className="relative z-10 flex min-h-screen flex-col">
			<SiteHeader />
			<main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
				<div
					className={cn(
						"rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10",
						"via-card/40 to-accent/5 p-6 shadow-glow-sm backdrop-blur-sm sm:p-8",
					)}
				>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="flex gap-4">
							<span
								className={cn(
									"flex size-14 shrink-0 items-center justify-center rounded-2xl",
									"bg-primary/15 text-primary ring-1 ring-primary/25",
								)}
							>
								<LifeBuoy className="size-7" aria-hidden />
							</span>
							<div>
								<h1 className="font-display text-3xl font-bold tracking-tight">
									Support
								</h1>
								<p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
									We built {APP_NAME} to cut friction on real job applications.
									If something breaks or feels confusing, use the options below—
									we read every message.
								</p>
							</div>
						</div>
						<Button variant="secondary" className="shrink-0 gap-2 self-start" asChild>
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
							<Card
								key={item.key}
								className={cn(
									"border-border/70 bg-card/50 backdrop-blur-sm",
									"transition-shadow duration-200 hover:shadow-glow-sm",
								)}
							>
								<CardHeader className="space-y-3">
									<div className="flex items-start gap-3">
										<span
											className={cn(
												"flex size-10 shrink-0 items-center justify-center rounded-xl",
												"bg-muted/50 text-info ring-1 ring-border/60",
											)}
										>
											<Icon className="size-5" aria-hidden />
										</span>
										<div className="min-w-0">
											<CardTitle className="font-display text-lg">
												{item.title}
											</CardTitle>
											<CardDescription className="mt-1.5 leading-relaxed">
												{item.description}
												{"billingHint" in item && item.billingHint ? (
													<span className="mt-2 block text-xs text-muted-foreground">
														Tip: open{" "}
														<Link
															to={ROUTES.profile}
															className="font-medium text-primary underline-offset-4 hover:underline"
														>
															Profile
														</Link>
														, then switch to the Billing tab.
													</span>
												) : null}
											</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent className="flex flex-wrap gap-2 pt-0">
									{"href" in item && item.external ? (
										<Button size="sm" variant="secondary" asChild>
											<a href={item.href}>{item.ctaLabel}</a>
										</Button>
									) : null}
									{"to" in item && !item.external ? (
										<>
											<Button size="sm" variant="secondary" asChild>
												<Link to={item.to}>{item.ctaLabel}</Link>
											</Button>
											{"secondaryTo" in item && item.secondaryTo ? (
												<Button size="sm" variant="ghost" asChild>
													<Link to={item.secondaryTo}>
														{item.secondaryLabel}
													</Link>
												</Button>
											) : null}
										</>
									) : null}
								</CardContent>
							</Card>
						)
					})}
				</div>

				<p className="mt-10 text-center text-xs text-muted-foreground">
					Response times vary; include your account email and what you were doing
					when the issue happened so we can reproduce it faster.
				</p>
			</main>
			<SiteFooter />
		</div>
	)
}
