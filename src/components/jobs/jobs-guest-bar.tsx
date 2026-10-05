import { Link, useLocation } from "react-router-dom"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Button } from "@/components/ui/button"
import { APP_NAME, ROUTES } from "@/lib/constants"
import { JOBS_COPY } from "@/lib/jobs-copy"

export function JobsGuestBar() {
	const { pathname } = useLocation()

	return (
		<header className="sticky top-0 z-30 border-b border-hairline bg-surface/95 backdrop-blur">
			<div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
				<Link
					to={ROUTES.home}
					className="flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
				>
					<BrandLogo size="sm" />
					<span className="truncate font-display text-[15px] font-semibold tracking-tight text-ink">
						{APP_NAME}
					</span>
				</Link>
				<div className="flex shrink-0 items-center gap-1.5">
					<Button variant="ghost" size="sm" asChild>
						<Link to={ROUTES.login} state={{ from: pathname }}>
							{JOBS_COPY.logIn}
						</Link>
					</Button>
					<Button size="sm" asChild>
						<Link to={ROUTES.signup} state={{ from: pathname }}>
							{JOBS_COPY.signUp}
						</Link>
					</Button>
				</div>
			</div>
		</header>
	)
}
