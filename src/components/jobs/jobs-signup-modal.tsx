import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand/brand-logo"
import { APP_NAME, HERO_OFFER_IMAGE_SRC, ROUTES } from "@/lib/constants"
import { JOBS_COPY } from "@/lib/jobs-copy"

const SIGNUP_VISUAL_ALT =
	"Happy professional celebrating after receiving a job offer"
const SIGNUP_TITLE_ID = "jobs-signup-title"

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
		<Modal isOpen={isOpen} onClose={onClose} labelledBy={SIGNUP_TITLE_ID}>
			<div className="flex items-center gap-2 pr-8">
				<BrandLogo size="sm" className="size-7 rounded-md" />
				<span className="font-display text-sm font-semibold tracking-tight text-ink">
					{APP_NAME}
				</span>
			</div>

			<motion.img
				src={HERO_OFFER_IMAGE_SRC}
				alt={SIGNUP_VISUAL_ALT}
				width={960}
				height={720}
				loading="eager"
				decoding="async"
				className="h-40 w-full rounded-lg object-cover object-[center_20%] sm:h-44"
				initial={reduceMotion ? false : { opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
			/>

			<div>
				<h2
					id={SIGNUP_TITLE_ID}
					className="font-display text-xl font-semibold tracking-tight text-ink"
				>
					{JOBS_COPY.signupTitle}
				</h2>
				<p className="mt-2 text-sm leading-relaxed text-ink-muted">
					{JOBS_COPY.signupMessage}
				</p>
			</div>

			<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
				<Button variant="outline" className="w-full sm:w-auto" asChild>
					<Link to={ROUTES.login} state={{ from: returnTo }} onClick={onClose}>
						{JOBS_COPY.signupLogin}
					</Link>
				</Button>
				<Button className="w-full sm:w-auto" asChild>
					<Link to={ROUTES.signup} state={{ from: returnTo }} onClick={onClose}>
						{JOBS_COPY.signupCta}
					</Link>
				</Button>
			</div>
		</Modal>
	)
}
