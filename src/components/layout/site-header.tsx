import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { APP_NAME, BRAND_LOGO_SRC, ROUTES } from "@/lib/constants"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const nav = [
	{ href: `${ROUTES.home}#how-it-works`, label: "How it works" },
	{ href: `${ROUTES.home}#demo`, label: "Demo" },
	{ href: `${ROUTES.home}#pricing`, label: "Pricing" },
] as const

export function SiteHeader() {
	const { pathname } = useLocation()
	const { user } = useAuth()
	const isMarketing = pathname === ROUTES.home

	return (
		<header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
				<Link
					to={ROUTES.home}
					className="group flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-foreground"
				>
					<span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-white/20">
						<img
							src={BRAND_LOGO_SRC}
							alt=""
							width={40}
							height={40}
							className="size-10 object-contain object-center"
							decoding="async"
						/>
						<motion.span
							className="pointer-events-none absolute inset-0 rounded-xl bg-primary/15 opacity-0 transition-opacity group-hover:opacity-100"
							layoutId="logo-glow"
							aria-hidden
						/>
					</span>
					<span className="min-w-0">{APP_NAME}</span>
				</Link>

				{isMarketing ? (
					<nav
						className="hidden items-center gap-1 md:flex"
						aria-label="Primary"
					>
						{nav.map((item) => (
							<a
								key={item.href}
								href={item.href}
								className={cn(
									"rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors",
									"hover:bg-muted/60 hover:text-foreground",
								)}
							>
								{item.label}
							</a>
						))}
					</nav>
				) : null}

				<div className="flex items-center gap-2">
					<Button variant="ghost" surface="dark" size="sm" className="hidden sm:inline-flex" asChild>
						<Link to={ROUTES.support}>Support</Link>
					</Button>
					{/* <Button variant="ghost" surface="dark" size="sm" asChild>
						<a
							href={LINKS.extensionDownload}
							target="_blank"
							rel="noopener noreferrer"
						>
							Get extension
						</a>
					</Button> */}
					{user ? (
						<>
							<Button variant="ghost" surface="dark" size="sm" asChild>
								<Link to={ROUTES.profile}>Profile</Link>
							</Button>
							<Button surface="dark" size="sm" asChild>
								<Link to={ROUTES.applications}>Applications</Link>
							</Button>
						</>
					) : (
						<>
							<Button variant="secondary" surface="dark" size="sm" asChild>
								<Link to={ROUTES.login}>Log in</Link>
							</Button>
							<Button surface="dark" size="sm" className="hidden sm:inline-flex" asChild>
								<Link to={ROUTES.signup}>Get started</Link>
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	)
}
