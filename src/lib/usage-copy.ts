import type { UsageMetricKey } from "@/types/user-usage"

export const USAGE_COPY = {
	pageTitle: "Usage",
	pageDescription:
		"Track how much of your plan allowance you have used.",
	freePlanHint:
		"Starter includes limited AI generations, cover letters, and downloads. Buy a one-time pack for more credits, or upgrade to Pro for unlimited access.",
	proPlanHint:
		"Your Pro plan includes unlimited generations, downloads, and HR contact search.",
	unlimited: "Unlimited",
	remaining: "remaining",
	used: "used",
	noUsageDataTitle: "Usage data unavailable",
	noUsageDataDescription:
		"We could not load your usage yet. Try refreshing the page or contact support if this persists.",
	upgradeTitle: "Need more generations?",
	upgradeDescription:
		"Upgrade to Pro for unlimited access, or buy a one-time credit pack from Billing.",
	upgradeCta: "Upgrade to Pro",
	loading: "Loading usage…",
} as const

export const USAGE_METRIC_COPY: Record<
	UsageMetricKey,
	{ label: string; description: string }
> = {
	aiGenerations: {
		label: "AI generations",
		description: "AI rewrites and tailored content generations.",
	},
	coverLetters: {
		label: "Cover letters",
		description: "Personalized cover letters for your applications.",
	},
	filesDownload: {
		label: "Resume downloads",
		description: "PDF exports of tailored resumes.",
	},
	findHr: {
		label: "HR contacts",
		description: "Searches for hiring contacts for a role.",
	},
}
