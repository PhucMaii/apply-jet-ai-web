import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Modal from "@/components/ui/modal"
import { useOnboarding } from "@/context/onboarding-context"
import { ONBOARDING_WELCOME_COPY } from "@/lib/onboarding/copy"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { cn } from "@/lib/utils"

export function WelcomeModal() {
	const {
		isWelcomeOpen,
		isLoading,
		startGuidedTour,
		skipOnboarding,
	} = useOnboarding()

	async function handleStartTour() {
		try {
			await startGuidedTour()
		} catch (error) {
			console.error("Something went wrong starting guided tour:", error)
		}
	}

	async function handleSkip() {
		try {
			await skipOnboarding()
		} catch (error) {
			console.error("Something went wrong skipping onboarding:", error)
		}
	}

	return (
		<Modal
			isOpen={isWelcomeOpen && !isLoading}
			onClose={() => void handleSkip()}
		>
			<p className="text-xs font-semibold uppercase tracking-wide text-primary">
				{ONBOARDING_WELCOME_COPY.eyebrow}
			</p>
			<h2
				className={cn(
					"mt-2 font-display text-xl font-bold text-neutral-900 sm:text-2xl",
				)}
			>
				{ONBOARDING_WELCOME_COPY.title}
			</h2>
			<p className={cn("mt-3 text-sm leading-relaxed", DASHBOARD_THEME.body)}>
				{ONBOARDING_WELCOME_COPY.description}
			</p>
			<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="secondary"
					disabled={isLoading}
					onClick={() => void handleSkip()}
				>
					{ONBOARDING_WELCOME_COPY.skip}
				</Button>
				<Button
					type="button"
					disabled={isLoading}
					onClick={() => void handleStartTour()}
				>
					{isLoading ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					{ONBOARDING_WELCOME_COPY.startTour}
				</Button>
			</div>
		</Modal>
	)
}
