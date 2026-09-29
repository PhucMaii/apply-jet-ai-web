import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand/brand-logo"
import { APP_NAME, HERO_OFFER_IMAGE_SRC, ROUTES } from "@/lib/constants"
import { JOBS_COPY } from "@/lib/jobs-copy"

const SIGNUP_VISUAL_ALT =
	"Happy professional celebrating after receiving a job offer"

interface JobsSignupModalProps {
	isOpen: boolean
	onClose: () => void
	returnTo?: string
}

export function JobsSignupModal({
	isOpen,
	onClose,
	returnTo = ROUTES.jobs,
}: JobsSignupModalProps) {
	const reduceMotion = useReducedMotion()

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="-m-6 overflow-hidden">
				<div className="relative overflow-hidden bg-neutral-950">
					<div
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(59,130,246,0.35),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(14,165,233,0.2),transparent_50%)]"
						aria-hidden
					/>
					<motion.img
						src={HERO_OFFER_IMAGE_SRC}
						alt={SIGNUP_VISUAL_ALT}
						width={960}
						height={720}
						loading="eager"
						decoding="async"
						className="relative mx-auto block h-44 w-full object-cover object-[center_20%] sm:h-52"
						initial={reduceMotion ? false : { opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
					/>
					<div
						className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent"
						aria-hidden
					/>
				</div>

				<div className="relative px-6 pb-6 pt-1">
					<div className="mb-3 flex items-center gap-2">
						<BrandLogo size="sm" className="size-7 rounded-md" />
						<span className="font-display text-sm font-semibold tracking-tight text-neutral-800">
							{APP_NAME}
						</span>
					</div>

					<h2 className="font-display text-xl font-semibold tracking-tight text-neutral-900">
						{JOBS_COPY.signupTitle}
					</h2>
					<p className="mt-2 text-sm leading-relaxed text-neutral-600">
						{JOBS_COPY.signupMessage}
					</p>

					<div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
						<Button variant="outline" className="w-full sm:w-auto" asChild>
							<Link
								to={ROUTES.login}
								state={{ from: returnTo }}
								onClick={onClose}
							>
								{JOBS_COPY.signupLogin}
							</Link>
						</Button>
						<Button className="w-full sm:w-auto" asChild>
							<Link
								to={ROUTES.signup}
								state={{ from: returnTo }}
								onClick={onClose}
							>
								{JOBS_COPY.signupCta}
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	)
}
