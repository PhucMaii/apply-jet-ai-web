import { Link } from "react-router-dom"
import { Globe, LayoutList, LogOut, Puzzle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { APP_NAME, BRAND_LOGO_SRC, LINKS, ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface ProfilePageHeaderProps {
	userEmail: string | undefined
	accountInitials: string
	onSignOut: () => void | Promise<void>
}

export function ProfilePageHeader({
	userEmail,
	accountInitials,
	onSignOut,
}: ProfilePageHeaderProps) {
	return (
		<header className={DASHBOARD_THEME.header}>
			<div className={DASHBOARD_THEME.headerInnerProfile}>
				<div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex min-w-0 gap-4">
						<div
							className={DASHBOARD_THEME.avatar}
							aria-hidden
						>
							{accountInitials}
						</div>
						<div className="min-w-0">
							<div className="mb-1 flex flex-wrap items-center gap-2">
								<span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-neutral-200">
									<img
										src={BRAND_LOGO_SRC}
										alt=""
										width={32}
										height={32}
										className="size-8 object-contain object-center"
										decoding="async"
									/>
								</span>
								<p className={DASHBOARD_THEME.brandLabel}>{APP_NAME}</p>
							</div>
							<h1 className={DASHBOARD_THEME.titleLg}>Your profile</h1>
							<p className={cn("mt-1 max-w-md", DASHBOARD_THEME.body)}>
								Fine-tune autofill, resume, and billing in one workspace—
								everything saves where you expect it.
							</p>
							<p className={cn("mt-2", DASHBOARD_THEME.email)}>
								{userEmail ?? "Signed in"}
							</p>
						</div>
					</div>
					<nav
						className="flex flex-wrap gap-2 sm:justify-end"
						aria-label="Account navigation"
					>
						<Button variant="outline" size="sm" className="gap-2" asChild>
							<Link to={ROUTES.applications}>
								<LayoutList className="size-4 shrink-0 opacity-80" aria-hidden />
								Applications
							</Link>
						</Button>
						<Button variant="outline" size="sm" className="gap-2" asChild>
							<Link to={ROUTES.home}>
								<Globe className="size-4 shrink-0 opacity-80" aria-hidden />
								Marketing
							</Link>
						</Button>
						<Button variant="outline" size="sm" className="gap-2" asChild>
							<a
								href={LINKS.extensionDownload}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Puzzle className="size-4 shrink-0 opacity-80" aria-hidden />
								Extension
							</a>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="gap-2"
							onClick={() => void onSignOut()}
						>
							<LogOut className="size-4" aria-hidden />
							Log out
						</Button>
					</nav>
				</div>
			</div>
		</header>
	)
}
