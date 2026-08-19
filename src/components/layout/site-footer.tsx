import { Link, useLocation } from "react-router-dom"
import { BrandLogo } from "@/components/brand/brand-logo"
import { APP_NAME, ROUTES, LINKS } from "@/lib/constants"
import { useLandingCopy } from "@/context/landing-copy-context"

type FooterItem =
	| { label: string; to: string }
	| { label: string; href: string }

function FooterLink({ item }: { item: FooterItem }) {
	if ("to" in item) {
		return (
			<Link
				to={item.to}
				className="text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				{item.label}
			</Link>
		)
	}
	return (
		<a
			href={item.href}
			className="text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			{item.label}
		</a>
	)
}

export function SiteFooter() {
	const { pathname } = useLocation()
	const { footer } = useLandingCopy()
	const isAdsLanding = pathname === ROUTES.adsLanding
	const basePath = isAdsLanding ? ROUTES.adsLanding : ROUTES.home

	const productLinks: FooterItem[] = [
		{ label: "How it works", to: `${basePath}#how-it-works` },
		{
			label: footer.productLinks.features.label,
			to: footer.productLinks.features.to,
		},
		{
			label: footer.productLinks.wording.label,
			to: footer.productLinks.wording.to,
		},
	]

	if (!isAdsLanding) {
		productLinks.push({ label: "Pricing", to: `${ROUTES.home}#pricing` })
	}

	const columns: { title: string; links: FooterItem[] }[] = [
		{
			title: "Product",
			links: productLinks,
		},
		{
			title: "Account",
			links: [
				{ label: "Sign up", to: ROUTES.signup },
				{ label: "Log in", to: ROUTES.login },
				{ label: "Applications", to: ROUTES.applications },
			],
		},
		{
			title: "Legal",
			links: [
				{ label: "Support", to: ROUTES.support },
				{ label: "Privacy", to: ROUTES.privacy },
				{ label: "Terms", to: ROUTES.terms },
				{ label: "Contact", href: LINKS.contactMail },
			],
		},
	]

	return (
		<footer className="border-t border-border/80 bg-muted/20">
			<div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
				<div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
					<div>
						<div className="flex items-center gap-3">
							<BrandLogo size="lg" />
							<p className="font-display text-xl font-bold tracking-tight">
								{APP_NAME}
							</p>
						</div>
						<p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
							{footer.tagline}
						</p>
					</div>
					<div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
						{columns.map((col) => (
							<div key={col.title}>
								<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									{col.title}
								</p>
								<ul className="mt-4 flex flex-col gap-2.5">
									{col.links.map((item) => (
										<li key={item.label}>
											<FooterLink item={item} />
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
				<div className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
					<span>
						© {new Date().getFullYear()} {APP_NAME}. All rights reserved.
					</span>
					<span className="text-muted-foreground/80">
						{footer.copyrightNote}
					</span>
				</div>
			</div>
		</footer>
	)
}
