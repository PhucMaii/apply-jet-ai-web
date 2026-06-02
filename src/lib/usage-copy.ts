import type { UsageMetricKey } from "@/types/user-usage"

export const USAGE_COPY = {
	pageTitle: "Usage",
	pageDescription:
		"Track how much of your plan allowance you have used this billing period.",
	freePlanHint:
		"Free plan includes weekly limits on AI generations. Upgrade to Pro for unlimited access.",
	proPlanHint:
		"Your Pro plan includes unlimited generations across all features below.",
	unlimited: "Unlimited",
	remaining: "remaining",
	used: "used",
	noUsageDataTitle: "Usage data unavailable",
	noUsageDataDescription:
		"We could not load your usage yet. Try refreshing the page or contact support if this persists.",
	upgradeTitle: "Need more generations?",
	upgradeDescription:
		"Upgrade to Pro for unlimited tailored resumes, cover letters, and more.",
	upgradeCta: "Upgrade to Pro",
	loading: "Loading usage…",
} as const

export const USAGE_METRIC_COPY: Record<
	UsageMetricKey,
	{ label: string; description: string }
> = {
	resumeGenerations: {
		label: "Tailored resumes",
		description: "AI-generated resumes tailored to job descriptions.",
	},
	coverLetters: {
		label: "Cover letters",
		description: "Personalized cover letters for your applications.",
	},
	extractText: {
		label: "Resume parsing",
		description: "Extracting text from uploaded resume files.",
	},
	applicationAnswers: {
		label: "Application answers",
		description: "Long-form answers and application field assistance.",
	},
}
