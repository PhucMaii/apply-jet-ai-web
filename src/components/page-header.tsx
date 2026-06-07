import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import {
	LayoutList,
	LogOut,
	Menu,
	Plus,
	UserRound,
	X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlanBadge } from "@/components/layout/plan-badge"
import { useUserSubscription } from "@/hooks/use-user-subscription"
import { PAGE_HEADER_COPY } from "@/lib/page-header-copy"
import { PAGE_HEADER_THEME } from "@/lib/page-header-theme"
import { APP_NAME, BRAND_LOGO_SRC, ROUTES } from "@/lib/constants"
import { TOUR_TARGET } from "@/lib/onboarding/selectors"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
	title: string
	description?: string
	userEmail: string | undefined
	accountInitials: string
	onSignOut: () => void | Promise<void>
}

interface NavItem {
	label: string
	href: string
	icon: LucideIcon
	isActive: (pathname: string) => boolean
}

const MAIN_NAV: NavItem[] = [
	{
		label: PAGE_HEADER_COPY.applications,
		href: ROUTES.applications,
		icon: LayoutList,
		isActive: (pathname) =>
			pathname === ROUTES.applications ||
			pathname.startsWith(`${ROUTES.applications}/`),
	},
	{
		label: PAGE_HEADER_COPY.profile,
		href: ROUTES.profile,
		icon: UserRound,
		isActive: (pathname) => pathname === ROUTES.profile,
	},
]

function NavLink({
	item,
	className,
	onClick,
	tourTarget,
}: {
	item: NavItem
	className?: string
	onClick?: () => void
	tourTarget?: string
}) {
	const Icon = item.icon
	const linkClass = cn(PAGE_HEADER_THEME.navLink, className)

	return (
		<Link
			to={item.href}
			className={linkClass}
			onClick={onClick}
			data-tour={tourTarget}
		>
			<Icon className="size-4 shrink-0 opacity-70" aria-hidden />
			{item.label}
		</Link>
	)
}

function MobileNavPill({
	item,
	isActive,
	tourTarget,
}: {
	item: NavItem
	isActive: boolean
	tourTarget?: string
}) {
	const Icon = item.icon
	const className = cn(
		PAGE_HEADER_THEME.mobileNavLink,
		isActive && PAGE_HEADER_THEME.mobileNavLinkActive,
	)

	return (
		<Link to={item.href} className={className} data-tour={tourTarget}>
			<Icon className="size-3.5 shrink-0" aria-hidden />
			{item.label}
		</Link>
	)
}

export function PageHeader({
	title,
	description,
	userEmail,
	accountInitials,
	onSignOut,
}: PageHeaderProps) {
	const { pathname } = useLocation()
	const { plan, isLoading: isLoadingPlan } = useUserSubscription()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isMenuOpen) return

		const handlePointerDown = (event: MouseEvent) => {
			if (!menuRef.current?.contains(event.target as Node)) {
				setIsMenuOpen(false)
			}
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsMenuOpen(false)
			}
		}

		document.addEventListener("mousedown", handlePointerDown)
		window.addEventListener("keydown", handleKeyDown)

		return () => {
			document.removeEventListener("mousedown", handlePointerDown)
			window.removeEventListener("keydown", handleKeyDown)
		}
	}, [isMenuOpen])

	const closeMenu = () => setIsMenuOpen(false)

	return (
		<header className={PAGE_HEADER_THEME.root}>
			<div className={PAGE_HEADER_THEME.inner}>
				<div className={PAGE_HEADER_THEME.toolbar}>
					<Link to={ROUTES.home} className={PAGE_HEADER_THEME.brand}>
						<span className={PAGE_HEADER_THEME.brandLogo}>
							<img
								src={BRAND_LOGO_SRC}
								alt=""
								width={36}
								height={36}
								className="size-9 object-contain object-center"
								decoding="async"
							/>
						</span>
						<span className={PAGE_HEADER_THEME.brandName}>{APP_NAME}</span>
					</Link>

					<nav
						className={PAGE_HEADER_THEME.desktopNav}
						aria-label="Main navigation"
					>
						{MAIN_NAV.map((item) => (
							<NavLink
								key={item.href}
								item={item}
								tourTarget={
									item.href === ROUTES.applications
										? TOUR_TARGET.navApplications
										: undefined
								}
								className={
									item.isActive(pathname)
										? PAGE_HEADER_THEME.navLinkActive
										: undefined
								}
							/>
						))}
					</nav>

					<div className={PAGE_HEADER_THEME.toolbarActions}>
						{!isLoadingPlan ? <PlanBadge plan={plan} /> : null}

						<div className={PAGE_HEADER_THEME.userChip}>
							<span
								className={PAGE_HEADER_THEME.userAvatar}
								aria-hidden
							>
								{accountInitials}
							</span>
							<span className={PAGE_HEADER_THEME.userEmail}>
								{userEmail ?? PAGE_HEADER_COPY.signedInFallback}
							</span>
						</div>

						<Button
							size="sm"
							className="hidden gap-1.5 sm:inline-flex"
							asChild
						>
							<Link
								to={ROUTES.applicationCreate}
								data-tour={TOUR_TARGET.newApplication}
							>
								<Plus className="size-4" aria-hidden />
								<span className="hidden lg:inline">
									{PAGE_HEADER_COPY.newApplication}
								</span>
								<span className="lg:hidden">New</span>
							</Link>
						</Button>

						<div className="relative md:hidden" ref={menuRef}>
							<Button
								type="button"
								variant="outline"
								size="icon"
								className={PAGE_HEADER_THEME.menuButton}
								onClick={() => setIsMenuOpen((open) => !open)}
								aria-expanded={isMenuOpen}
								aria-haspopup="menu"
								aria-label={isMenuOpen ? "Close menu" : "Open menu"}
							>
								{isMenuOpen ? (
									<X className="size-4" aria-hidden />
								) : (
									<Menu className="size-4" aria-hidden />
								)}
							</Button>

							{isMenuOpen ? (
								<div
									className={PAGE_HEADER_THEME.menuPanel}
									role="menu"
								>
									<Link
										to={ROUTES.applicationCreate}
										className={PAGE_HEADER_THEME.menuItem}
										role="menuitem"
										data-tour={TOUR_TARGET.newApplication}
										onClick={closeMenu}
									>
										<Plus className="size-4 shrink-0" aria-hidden />
										{PAGE_HEADER_COPY.newApplication}
									</Link>
									<div className={PAGE_HEADER_THEME.menuDivider} />
									{MAIN_NAV.map((item) => {
										const Icon = item.icon
										return (
											<Link
												key={item.href}
												to={item.href}
												className={cn(
													PAGE_HEADER_THEME.menuItem,
													item.isActive(pathname) &&
														"bg-neutral-50 text-neutral-900",
												)}
												role="menuitem"
												data-tour={
													item.href === ROUTES.applications
														? TOUR_TARGET.navApplications
														: undefined
												}
												onClick={closeMenu}
											>
												<Icon className="size-4 shrink-0" aria-hidden />
												{item.label}
											</Link>
										)
									})}
									<div className={PAGE_HEADER_THEME.menuDivider} />
									<button
										type="button"
										className={cn(
											PAGE_HEADER_THEME.menuItem,
											PAGE_HEADER_THEME.menuItemDanger,
										)}
										role="menuitem"
										onClick={() => {
											closeMenu()
											void onSignOut()
										}}
									>
										<LogOut className="size-4 shrink-0" aria-hidden />
										{PAGE_HEADER_COPY.logOut}
									</button>
								</div>
							) : null}
						</div>

						<Button
							variant="ghost"
							size="icon"
							className="hidden text-neutral-500 hover:text-neutral-900 md:inline-flex"
							onClick={() => void onSignOut()}
							aria-label={PAGE_HEADER_COPY.logOut}
						>
							<LogOut className="size-4" aria-hidden />
						</Button>
					</div>
				</div>

				<div className={PAGE_HEADER_THEME.hero}>
					<div className={PAGE_HEADER_THEME.heroRow}>
						<div className={PAGE_HEADER_THEME.heroText}>
							<h1 className={PAGE_HEADER_THEME.title}>{title}</h1>
							{description ? (
								<p className={PAGE_HEADER_THEME.description}>
									{description}
								</p>
							) : null}
							<p className={cn(PAGE_HEADER_THEME.metaEmail, "mt-2 sm:hidden")}>
								{userEmail ?? PAGE_HEADER_COPY.signedInFallback}
							</p>
						</div>

						<Button
							size="lg"
							className="w-full shrink-0 gap-2 sm:hidden"
							asChild
						>
							<Link
								to={ROUTES.applicationCreate}
								data-tour={TOUR_TARGET.newApplication}
							>
								<Plus className="size-4" aria-hidden />
								{PAGE_HEADER_COPY.newApplication}
							</Link>
						</Button>
					</div>

					<nav
						className={PAGE_HEADER_THEME.mobileNav}
						aria-label="Quick navigation"
					>
						{MAIN_NAV.map((item) => (
							<MobileNavPill
								key={item.href}
								item={item}
								isActive={item.isActive(pathname)}
								tourTarget={
									item.href === ROUTES.applications
										? TOUR_TARGET.navApplications
										: undefined
								}
							/>
						))}
					</nav>
				</div>
			</div>
		</header>
	)
}
