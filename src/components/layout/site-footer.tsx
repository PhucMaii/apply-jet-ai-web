import { Link, useLocation } from "react-router-dom"
import { BrandLogo } from "@/components/brand/brand-logo"
import { MapleLeafIcon } from "@/components/brand/maple-leaf-icon"
import { APP_NAME, ROUTES, LINKS, blogCategoryPath } from "@/lib/constants"
import { BLOG_CATEGORY_SLUG } from "@/lib/blog"
import { useLandingCopy } from "@/context/landing-copy-context"
import { FEATURES } from "@/lib/features"
import { getMarketingBasePath } from "@/lib/marketing-routes"
import { LANDING_SECTION_ID } from "@/lib/landing/landing-section"

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
	const { footer, marketingNav } = useLandingCopy()
	const basePath = getMarketingBasePath(pathname)
	const hasPricingNav = marketingNav.some(
		(item) => item.hash === LANDING_SECTION_ID.howItWorks,
	)

	const productLinks: FooterItem[] = [
		{ label: "How it works", to: `${basePath}#${LANDING_SECTION_ID.howItWorks}` },
		...(FEATURES.pgwp
			? [
					{
						label: footer.productLinks.pgwp.label,
						to: `${basePath}#${footer.productLinks.pgwp.hash}`,
					} satisfies FooterItem,
				]
			: []),
		{
			label: footer.productLinks.features.label,
			to: `${basePath}#${footer.productLinks.features.hash}`,
		},
		{
			label: footer.productLinks.wording.label,
			to: `${basePath}#${footer.productLinks.wording.hash}`,
		},
		{
			label: footer.productLinks.faq.label,
			to: `${basePath}#${footer.productLinks.faq.hash}`,
		},
	]

	if (hasPricingNav) {
		productLinks.push({
			label: "Pricing",
			to: `${basePath}#${LANDING_SECTION_ID.pricing}`,
		})
	}

	const columns: { title: string; links: FooterItem[] }[] = [
		{
			title: "Product",
			links: productLinks,
		},
		{
			title: "Resources",
			links: [
				{ label: "Blog", to: ROUTES.blog },
				{
					label: "ATS Resume",
					to: blogCategoryPath(BLOG_CATEGORY_SLUG.atsResume),
				},
				...(FEATURES.pgwp
					? [
							{
								label: "PGWP Guide",
								to: blogCategoryPath(BLOG_CATEGORY_SLUG.pgwpGuide),
							} satisfies FooterItem,
						]
					: []),
				{
					label: "Tool Comparison",
					to: blogCategoryPath(BLOG_CATEGORY_SLUG.toolComparison),
				},
			],
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
		<footer className="border-t border-hairline bg-surface">
			<div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
				<div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
					<div>
						<div className="flex items-center gap-3">
							<BrandLogo size="md" />
							<p className="font-display text-lg font-semibold tracking-tight text-ink">
								{APP_NAME}
							</p>
						</div>
						<p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
							{footer.tagline}
						</p>
					</div>
					<div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
					<span className="inline-flex items-center gap-1.5 text-muted-foreground/80">
						{FEATURES.pgwp ? <MapleLeafIcon className="size-4" /> : null}
						{footer.copyrightNote}
					</span>
				</div>
			</div>
		</footer>
	)
}
