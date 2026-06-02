import { Link } from "react-router-dom"
import { LogOut, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"
import { APP_NAME, BRAND_LOGO_SRC, LINKS, ROUTES } from "@/lib/constants"

interface ApplicationsPageHeaderProps {
	userEmail: string | undefined
	onSignOut: () => void | Promise<void>
}

export function ApplicationsPageHeader({
	userEmail,
	onSignOut,
}: ApplicationsPageHeaderProps) {
	return (
		<header className={APPLICATIONS_THEME.header}>
			<div className={APPLICATIONS_THEME.headerInner}>
				<div>
					<div className="mb-2 flex items-center gap-2">
						<span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-neutral-200">
							<img
								src={BRAND_LOGO_SRC}
								alt=""
								width={36}
								height={36}
								className="size-9 object-contain object-center"
								decoding="async"
							/>
						</span>
						<p className={APPLICATIONS_THEME.brandLabel}>{APP_NAME}</p>
					</div>
					<h1 className={APPLICATIONS_THEME.title}>Applications</h1>
					<p className={APPLICATIONS_THEME.subtitle}>
						{userEmail ?? "Signed in"}
					</p>
				</div>
				<nav className="flex flex-wrap gap-2" aria-label="Account navigation">
					<Button size="sm" className="gap-1.5" asChild>
						<Link to={ROUTES.applicationCreate}>
							<Plus className="size-4" aria-hidden />
							New application
						</Link>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<Link to={ROUTES.profile}>Profile</Link>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<Link to={ROUTES.home}>Marketing site</Link>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<a
							href={LINKS.extensionDownload}
							target="_blank"
							rel="noopener noreferrer"
						>
							Extension
						</a>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="gap-1.5"
						onClick={() => void onSignOut()}
					>
						<LogOut className="size-4" aria-hidden />
						Log out
					</Button>
				</nav>
			</div>
		</header>
	)
}
