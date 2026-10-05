import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { LogOut, Plus } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { PlanBadge } from "@/components/layout/plan-badge"
import { ResumeUploadBanner } from "@/components/layout/resume-upload-banner"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context"
import { useUserSubscription } from "@/hooks/use-user-subscription"
import { APP_NAV_ITEMS, APP_SHELL_COPY, type AppNavItem } from "@/lib/app-nav"
import { APP_NAME, ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

type AppLayoutVariant = "page" | "workspace"

interface AppLayoutProps {
	children: ReactNode
	/**
	 * `page` — scrolling page with full sidebar and mobile bottom nav.
	 * `workspace` — fixed-height editor: collapsed sidebar, no bottom nav.
	 */
	variant?: AppLayoutVariant
}

function getInitials(email: string | undefined): string {
	return (email?.split("@")[0]?.slice(0, 2) || "?").toUpperCase()
}

function AccountMenu({
	email,
	isCompact,
	onSignOut,
}: {
	email: string | undefined
	isCompact: boolean
	onSignOut: () => void
}) {
	const initials = getInitials(email)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					"flex min-w-0 items-center gap-2.5 rounded-lg p-1.5 text-left",
					"transition-colors hover:bg-surface-sunken",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
					!isCompact && "w-full",
				)}
				aria-label={APP_SHELL_COPY.accountMenu}
			>
				<span
					className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white"
					aria-hidden
				>
					{initials}
				</span>
				{!isCompact ? (
					<span className="hidden min-w-0 flex-1 truncate text-sm font-medium text-ink lg:block">
						{email}
					</span>
				) : null}
			</DropdownMenuTrigger>
			<DropdownMenuContent side="top" align="start" className="w-60">
				<DropdownMenuLabel>{APP_SHELL_COPY.signedInAs}</DropdownMenuLabel>
				<p className="truncate px-2.5 pb-2 text-sm font-medium text-ink">
					{email}
				</p>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={onSignOut}>
					<LogOut aria-hidden />
					{APP_SHELL_COPY.logOut}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

function SidebarLink({
	item,
	isActive,
	isCollapsed,
}: {
	item: AppNavItem
	isActive: boolean
	isCollapsed: boolean
}) {
	const Icon = item.icon

	return (
		<Link
			to={item.href}
			aria-current={isActive ? "page" : undefined}
			title={item.label}
			className={cn(
				"group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium",
				"transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
				isActive
					? "bg-brand-soft text-brand-ink"
					: "text-ink-muted hover:bg-surface-sunken hover:text-ink",
				isCollapsed ? "justify-center px-0" : "lg:justify-start max-lg:justify-center max-lg:px-0",
			)}
		>
			<Icon
				className={cn(
					"size-[18px] shrink-0",
					isActive ? "text-brand" : "text-ink-subtle group-hover:text-ink-muted",
				)}
				aria-hidden
			/>
			<span className={cn(isCollapsed ? "sr-only" : "max-lg:sr-only")}>
				{item.label}
			</span>
		</Link>
	)
}

export function AppLayout({ children, variant = "page" }: AppLayoutProps) {
	const location = useLocation()
	const { user, signOut } = useAuth()
	const { plan, isLoading: isLoadingPlan } = useUserSubscription()
	const isWorkspace = variant === "workspace"
	const email = user?.email

	const handleSignOut = () => {
		void signOut()
	}

	return (
		<div
			className={cn(
				"app-theme flex",
				isWorkspace ? "h-dvh overflow-hidden" : "min-h-dvh",
			)}
		>
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-white"
			>
				{APP_SHELL_COPY.skipToContent}
			</a>

			<aside
				className={cn(
					"sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-hairline bg-surface md:flex",
					isWorkspace ? "w-[72px]" : "w-[72px] lg:w-60",
				)}
			>
				<div
					className={cn(
						"flex h-16 items-center gap-2.5 px-4",
						isWorkspace ? "justify-center" : "max-lg:justify-center",
					)}
				>
					<Link
						to={ROUTES.home}
						className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
						aria-label={APP_SHELL_COPY.home}
					>
						<BrandLogo size="sm" />
						{!isWorkspace ? (
							<span className="hidden truncate font-display text-[15px] font-semibold tracking-tight text-ink lg:block">
								{APP_NAME}
							</span>
						) : null}
					</Link>
				</div>

				<div className="px-3 pb-3">
					<Button
						asChild
						size="sm"
						className={cn(
							"w-full",
							isWorkspace ? "px-0" : "max-lg:px-0",
						)}
					>
						<Link
							to={ROUTES.applicationCreate}
							title={APP_SHELL_COPY.newApplication}
						>
							<Plus aria-hidden />
							<span className={cn(isWorkspace ? "sr-only" : "max-lg:sr-only")}>
								{APP_SHELL_COPY.newApplication}
							</span>
						</Link>
					</Button>
				</div>

				<nav
					aria-label={APP_SHELL_COPY.primaryNav}
					className="flex flex-1 flex-col gap-0.5 px-3"
				>
					{APP_NAV_ITEMS.map((item) => (
						<SidebarLink
							key={item.key}
							item={item}
							isActive={item.isActive(location)}
							isCollapsed={isWorkspace}
						/>
					))}
				</nav>

				<div className="space-y-2 border-t border-hairline p-3">
					{!isWorkspace && !isLoadingPlan ? (
						<div className="hidden px-1.5 lg:block">
							<PlanBadge plan={plan} />
						</div>
					) : null}
					<AccountMenu
						email={email}
						isCompact={isWorkspace}
						onSignOut={handleSignOut}
					/>
				</div>
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-hairline bg-surface/95 px-4 backdrop-blur md:hidden">
					<Link
						to={ROUTES.home}
						className="flex items-center gap-2"
						aria-label={APP_SHELL_COPY.home}
					>
						<BrandLogo size="sm" className="size-8" />
						<span className="font-display text-[15px] font-semibold tracking-tight text-ink">
							{APP_NAME}
						</span>
					</Link>
					<div className="flex items-center gap-1.5">
						<Button asChild size="icon-sm" aria-label={APP_SHELL_COPY.newApplication}>
							<Link to={ROUTES.applicationCreate}>
								<Plus aria-hidden />
							</Link>
						</Button>
						<AccountMenu
							email={email}
							isCompact
							onSignOut={handleSignOut}
						/>
					</div>
				</header>

				<ResumeUploadBanner />

				<main
					id="main-content"
					tabIndex={-1}
					className={cn(
						"min-w-0 flex-1 focus:outline-none",
						isWorkspace
							? "flex min-h-0 flex-col"
							: "pb-[calc(env(safe-area-inset-bottom)+4.5rem)] md:pb-0",
					)}
				>
					{children}
				</main>
			</div>

			{!isWorkspace ? (
				<nav
					aria-label={APP_SHELL_COPY.primaryNav}
					className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-hairline bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
				>
					{APP_NAV_ITEMS.map((item) => {
						const Icon = item.icon
						const isActive = item.isActive(location)
						return (
							<Link
								key={item.key}
								to={item.href}
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40",
									isActive ? "text-brand" : "text-ink-subtle",
								)}
							>
								<Icon className="size-5" aria-hidden />
								{item.shortLabel}
							</Link>
						)
					})}
				</nav>
			) : null}
		</div>
	)
}
