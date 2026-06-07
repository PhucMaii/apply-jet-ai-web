import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	type ReactNode,
} from "react"
import { useLocation, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { WelcomeModal } from "@/components/onboarding/welcome-modal"
import { useOnboardingState } from "@/hooks/use-onboarding-state"
import { useOnboardingTour } from "@/hooks/use-onboarding-tour"
import {
	hasUploadedResume,
	useUserResume,
} from "@/hooks/use-user-resume"
import {
	getNextStep,
	getReviewSectionForStep,
	logOnboarding,
} from "@/lib/onboarding/index"
import { ONBOARDING_COMPLETE_COPY } from "@/lib/onboarding/copy"
import { ROUTES } from "@/lib/constants"
import {
	ONBOARDING_STEP,
	ONBOARDING_TOUR_STATUS,
	parseOnboardingStep,
	type OnboardingStepId,
	type OnboardingTourStatus,
} from "@/lib/onboarding/types"

interface OnboardingContextValue {
	currentStep: OnboardingStepId | null
	isTourActive: boolean
	isWelcomeOpen: boolean
	isLoading: boolean
	activeProfileSection: string | null
	notifyResumeUploaded: () => void
	notifyAutofillComplete: () => void
	notifyResumeGenerated: () => void
	startGuidedTour: () => Promise<void>
	skipOnboarding: () => Promise<void>
	advanceStep: () => Promise<void>
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

function isApplicationDetailPath(pathname: string): boolean {
	return /^\/applications\/[^/]+$/.test(pathname)
}

function resolveTourStatus(
	raw: OnboardingTourStatus | null | undefined,
): OnboardingTourStatus {
	if (!raw) return ONBOARDING_TOUR_STATUS.idle
	return raw
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
	const { pathname } = useLocation()
	const navigate = useNavigate()
	const {
		state,
		isLoading,
		isUpdating,
		activateGuidedTour,
		skipOnboarding: skipOnboardingMutation,
		setStep,
		completeOnboarding,
	} = useOnboardingState()
	const { resume, isLoading: isResumeLoading } = useUserResume()

	const tourStatus = resolveTourStatus(state?.onboarding_tour_status)

	const isWelcomeOpen =
		!isLoading &&
		tourStatus === ONBOARDING_TOUR_STATUS.pending &&
		pathname === ROUTES.profile

	const isTourActive = tourStatus === ONBOARDING_TOUR_STATUS.active

	const currentStep = isTourActive
		? parseOnboardingStep(state?.onboarding_current_step) ??
			ONBOARDING_STEP.uploadResume
		: isWelcomeOpen
			? ONBOARDING_STEP.welcome
			: null

	const activeProfileSection = currentStep
		? getReviewSectionForStep(currentStep)
		: null

	useEffect(() => {
		if (isLoading) return
		if (
			tourStatus === ONBOARDING_TOUR_STATUS.pending &&
			pathname !== ROUTES.profile
		) {
			navigate(ROUTES.profile, { replace: true })
		}
	}, [isLoading, tourStatus, pathname, navigate])

	const persistStep = useCallback(
		async (step: OnboardingStepId) => {
			logOnboarding("Advancing to step", step)
			await setStep(step)
		},
		[setStep],
	)

	const advanceStep = useCallback(async () => {
		if (!currentStep) return
		const next = getNextStep(currentStep)
		if (!next) return

		if (next === ONBOARDING_STEP.completed) {
			await completeOnboarding()
			toast.success(ONBOARDING_COMPLETE_COPY.title)
			return
		}

		await persistStep(next)
	}, [completeOnboarding, currentStep, persistStep])

	useEffect(() => {
		if (!isTourActive || currentStep !== ONBOARDING_STEP.uploadResume) return
		if (isResumeLoading) return
		if (!hasUploadedResume(resume)) return

		logOnboarding("Resume already uploaded, skipping upload step")
		void advanceStep()
	}, [advanceStep, currentStep, isResumeLoading, isTourActive, resume])

	const startGuidedTour = useCallback(async () => {
		await activateGuidedTour(ONBOARDING_STEP.uploadResume)
	}, [activateGuidedTour])

	const skipOnboarding = useCallback(async () => {
		await skipOnboardingMutation()
	}, [skipOnboardingMutation])

	const notifyResumeUploaded = useCallback(() => {
		if (!isTourActive || currentStep !== ONBOARDING_STEP.uploadResume) return
		void advanceStep()
	}, [advanceStep, currentStep, isTourActive])

	const notifyAutofillComplete = useCallback(() => {
		if (!isTourActive || currentStep !== ONBOARDING_STEP.autofillProfile) return
		void advanceStep()
	}, [advanceStep, currentStep, isTourActive])

	const notifyResumeGenerated = useCallback(() => {
		if (!isTourActive || currentStep !== ONBOARDING_STEP.generateResume) return
		void completeOnboarding().then(() => {
			toast.success(ONBOARDING_COMPLETE_COPY.title)
		})
	}, [completeOnboarding, currentStep, isTourActive])

	useEffect(() => {
		if (!isTourActive || !currentStep) return

		if (
			currentStep === ONBOARDING_STEP.navigateApplications &&
			pathname === ROUTES.applications
		) {
			void persistStep(ONBOARDING_STEP.createApplication)
			return
		}

		if (
			currentStep === ONBOARDING_STEP.createApplication &&
			isApplicationDetailPath(pathname)
		) {
			void persistStep(ONBOARDING_STEP.generateResume)
		}
	}, [currentStep, isTourActive, pathname, persistStep])

	useOnboardingTour({
		currentStep,
		isTourActive,
		pathname,
		onManualAdvance: () => {
			void advanceStep()
		},
	})

	const value = useMemo<OnboardingContextValue>(
		() => ({
			currentStep,
			isTourActive,
			isWelcomeOpen,
			isLoading: isLoading || isUpdating,
			activeProfileSection,
			notifyResumeUploaded,
			notifyAutofillComplete,
			notifyResumeGenerated,
			startGuidedTour,
			skipOnboarding,
			advanceStep,
		}),
		[
			currentStep,
			isTourActive,
			isWelcomeOpen,
			isLoading,
			isUpdating,
			activeProfileSection,
			notifyResumeUploaded,
			notifyAutofillComplete,
			notifyResumeGenerated,
			startGuidedTour,
			skipOnboarding,
			advanceStep,
		],
	)

	return (
		<OnboardingContext.Provider value={value}>
			<WelcomeModal />
			{children}
		</OnboardingContext.Provider>
	)
}

/* eslint-disable react-refresh/only-export-components -- paired hook + provider */
export function useOnboarding() {
	const ctx = useContext(OnboardingContext)
	if (!ctx) {
		throw new Error("useOnboarding must be used within OnboardingProvider")
	}
	return ctx
}
