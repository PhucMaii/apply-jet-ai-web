import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { LandingSignupLink } from "@/components/landing/landing-signup-link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useLandingCopy } from "@/context/landing-copy-context"
import { APP_NAME, ROUTES } from "@/lib/constants"
import { getMarketingBasePath } from "@/lib/marketing-routes"
import { cn } from "@/lib/utils"

const SITE_HEADER_COPY = {
	jobs: "Jobs",
	blog: "Blog",
	support: "Support",
	logIn: "Log in",
	openApp: "Open app",
	openMenu: "Open menu",
	closeMenu: "Close menu",
} as const

const NAV_LINK_CLASS =
	"rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"

export function SiteHeader() {
	const { pathname } = useLocation()
	const { user } = useAuth()
	const { hero, marketingNav } = useLandingCopy()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const basePath = getMarketingBasePath(pathname)

	const sectionLinks = marketingNav.map((item) => ({
		href: `${basePath}#${item.hash}`,
		label: item.label,
	}))

	useEffect(() => {
		if (!isMenuOpen) return
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsMenuOpen(false)
		}
		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [isMenuOpen])

	const closeMenu = () => setIsMenuOpen(false)

	return (
		<header className="sticky top-0 z-50 border-b border-hairline bg-canvas/90 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				<Link
					to={basePath}
					className="flex items-center gap-2.5 rounded-lg font-display text-lg font-semibold tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
				>
					<BrandLogo size="sm" />
					<span>{APP_NAME}</span>
				</Link>

				<nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
					{sectionLinks.map((item) => (
						<a key={item.href} href={item.href} className={NAV_LINK_CLASS}>
							{item.label}
						</a>
					))}
				</nav>

				<div className="flex items-center gap-1.5">
					<Link to={ROUTES.jobs} className={cn(NAV_LINK_CLASS, "hidden sm:inline-flex")}>
						{SITE_HEADER_COPY.jobs}
					</Link>
					{user ? (
						<Button size="sm" asChild>
							<Link to={ROUTES.applications}>{SITE_HEADER_COPY.openApp}</Link>
						</Button>
					) : (
						<>
							<Link to={ROUTES.login} className={cn(NAV_LINK_CLASS, "hidden sm:inline-flex")}>
								{SITE_HEADER_COPY.logIn}
							</Link>
							<Button size="sm" asChild>
								<LandingSignupLink location="header" label={hero.primaryCta}>
									{hero.primaryCta}
								</LandingSignupLink>
							</Button>
						</>
					)}
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						className="lg:hidden"
						aria-expanded={isMenuOpen}
						aria-controls="site-mobile-menu"
						aria-label={isMenuOpen ? SITE_HEADER_COPY.closeMenu : SITE_HEADER_COPY.openMenu}
						onClick={() => setIsMenuOpen((open) => !open)}
					>
						{isMenuOpen ? <X aria-hidden /> : <Menu aria-hidden />}
					</Button>
				</div>
			</div>

			{isMenuOpen ? (
				<nav
					id="site-mobile-menu"
					aria-label="Mobile"
					className="border-t border-hairline bg-surface px-4 py-3 sm:px-6 lg:hidden"
				>
					<ul className="flex flex-col" onClick={closeMenu}>
						{sectionLinks.map((item) => (
							<li key={item.href}>
								<a href={item.href} className="block rounded-md px-2 py-3 text-base font-medium text-ink hover:bg-surface-sunken">
									{item.label}
								</a>
							</li>
						))}
						<li className="mt-2 border-t border-hairline pt-2">
							<Link to={ROUTES.jobs} className="block rounded-md px-2 py-3 text-base font-medium text-ink hover:bg-surface-sunken">
								{SITE_HEADER_COPY.jobs}
							</Link>
						</li>
						<li>
							<Link to={ROUTES.blog} className="block rounded-md px-2 py-3 text-base font-medium text-ink hover:bg-surface-sunken">
								{SITE_HEADER_COPY.blog}
							</Link>
						</li>
						<li>
							<Link to={ROUTES.support} className="block rounded-md px-2 py-3 text-base font-medium text-ink hover:bg-surface-sunken">
								{SITE_HEADER_COPY.support}
							</Link>
						</li>
						{!user ? (
							<li>
								<Link to={ROUTES.login} className="block rounded-md px-2 py-3 text-base font-medium text-ink hover:bg-surface-sunken">
									{SITE_HEADER_COPY.logIn}
								</Link>
							</li>
						) : null}
					</ul>
				</nav>
			) : null}
		</header>
	)
}
