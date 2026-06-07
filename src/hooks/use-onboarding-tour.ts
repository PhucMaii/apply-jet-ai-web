import { useCallback, useEffect, useRef } from "react"
import { driver, type Driver } from "driver.js"
import "driver.js/dist/driver.css"
import "@/styles/onboarding-tour.css"
import {
	ONBOARDING_TOUR_STEPS,
	getReviewSectionForStep,
	resolveCreateApplicationTarget,
} from "@/lib/onboarding/steps"
import { logOnboarding } from "@/lib/onboarding/index"
import {
	ONBOARDING_STEP,
	type OnboardingStepId,
} from "@/lib/onboarding/types"

interface UseOnboardingTourOptions {
	currentStep: OnboardingStepId | null
	isTourActive: boolean
	pathname: string
	onManualAdvance: () => void
}

function waitForElement(
	selector: string,
	timeoutMs = 4000,
): Promise<Element | null> {
	return new Promise((resolve) => {
		const existing = document.querySelector(selector)
		if (existing) {
			resolve(existing)
			return
		}

		const observer = new MutationObserver(() => {
			const el = document.querySelector(selector)
			if (el) {
				observer.disconnect()
				resolve(el)
			}
		})

		observer.observe(document.body, { childList: true, subtree: true })

		window.setTimeout(() => {
			observer.disconnect()
			resolve(document.querySelector(selector))
		}, timeoutMs)
	})
}

export function useOnboardingTour({
	currentStep,
	isTourActive,
	pathname,
	onManualAdvance,
}: UseOnboardingTourOptions) {
	const driverRef = useRef<Driver | null>(null)
	const onManualAdvanceRef = useRef(onManualAdvance)
	const showGenerationRef = useRef(0)

	useEffect(() => {
		onManualAdvanceRef.current = onManualAdvance
	}, [onManualAdvance])

	const destroyTour = useCallback(() => {
		driverRef.current?.destroy()
		driverRef.current = null
	}, [])

	useEffect(() => {
		if (!isTourActive || !currentStep) {
			destroyTour()
			return
		}

		if (
			currentStep === ONBOARDING_STEP.welcome ||
			currentStep === ONBOARDING_STEP.completed
		) {
			destroyTour()
			return
		}

		const generation = ++showGenerationRef.current
		let cancelled = false

		async function showStep() {
			const stepToShow = currentStep!
			const definition = ONBOARDING_TOUR_STEPS[stepToShow]
			if (!definition) {
				logOnboarding("No tour definition for step", stepToShow)
				return
			}

			let selector = definition.target
			if (stepToShow === ONBOARDING_STEP.createApplication) {
				selector = resolveCreateApplicationTarget(pathname)
			}

			const element = await waitForElement(selector)
			if (cancelled || generation !== showGenerationRef.current) return

			if (!element) {
				logOnboarding("Tour target not found", { stepToShow, selector })
				return
			}

			destroyTour()

			const reviewSection = getReviewSectionForStep(stepToShow)
			if (reviewSection) {
				element.scrollIntoView({ behavior: "smooth", block: "nearest" })
			}

			if (cancelled || generation !== showGenerationRef.current) return

			const driverObj = driver({
				overlayColor: "rgba(15, 23, 42, 0.55)",
				stagePadding: 10,
				stageRadius: 12,
				allowClose: false,
				popoverClass: "applyjet-tour-popover",
				onDestroyed: () => {
					if (driverRef.current === driverObj) {
						driverRef.current = null
					}
				},
			})

			driverRef.current = driverObj

			driverObj.highlight({
				element: selector,
				popover: {
					title: definition.title,
					description: definition.description,
					showButtons: definition.showNextButton ? ["next"] : [],
					onNextClick: () => {
						driverObj.destroy()
						onManualAdvanceRef.current()
					},
				},
			})

			logOnboarding("Showing tour step", { stepToShow, selector })
		}

		void showStep()

		return () => {
			cancelled = true
			destroyTour()
		}
	}, [currentStep, isTourActive, pathname, destroyTour])

	return { destroyTour }
}
