import { USAGE_METRIC_COPY } from "@/lib/usage-copy"
import type {
	UsageMetricKey,
	UsageMetricStatus,
	UsageMetricView,
	UserUsageRow,
} from "@/types/user-usage"

interface UsageMetricSource {
	key: UsageMetricKey
	used: number
	limit: number
}

function clampPercent(value: number): number {
	return Math.min(100, Math.max(0, value))
}

function getMetricStatus(percentUsed: number): UsageMetricStatus {
	if (percentUsed >= 100) return "exhausted"
	if (percentUsed >= 80) return "warning"
	return "ok"
}

function buildMetricView(
	source: UsageMetricSource,
	isPro: boolean,
): UsageMetricView {
	const copy = USAGE_METRIC_COPY[source.key]
	const used = Math.max(0, source.used)

	if (isPro) {
		return {
			key: source.key,
			label: copy.label,
			description: copy.description,
			used,
			limit: null,
			remaining: null,
			percentUsed: null,
			status: "ok",
			isUnlimited: true,
		}
	}

	const limit = Math.max(0, source.limit)
	const remaining = Math.max(0, limit - used)
	const percentUsed = limit === 0 ? 100 : clampPercent((used / limit) * 100)

	return {
		key: source.key,
		label: copy.label,
		description: copy.description,
		used,
		limit,
		remaining,
		percentUsed,
		status: getMetricStatus(percentUsed),
		isUnlimited: false,
	}
}

function readMetricSources(usage: UserUsageRow): UsageMetricSource[] {
	return [
		{
			key: "resumeGenerations",
			used: usage.resume_generations_used ?? 0,
			limit: usage.resume_generations_limit ?? 0,
		},
		{
			key: "coverLetters",
			used: usage.cover_letters_used ?? 0,
			limit: usage.cover_letters_limit ?? 0,
		},
		{
			key: "extractText",
			used: usage.extract_text_used ?? 0,
			limit: usage.extract_text_limit ?? 0,
		},
		{
			key: "applicationAnswers",
			used: usage.application_answers_used ?? 0,
			limit: usage.application_answers_limit ?? 0,
		},
	]
}

export function buildUsageMetrics(
	usage: UserUsageRow | null,
	isPro: boolean,
): UsageMetricView[] {
	if (!usage) return []

	return readMetricSources(usage).map((source) =>
		buildMetricView(source, isPro),
	)
}

export function getExhaustedMetricCount(metrics: UsageMetricView[]): number {
	return metrics.filter((metric) => metric.status === "exhausted").length
}

export function getLowRemainingMetricCount(metrics: UsageMetricView[]): number {
	return metrics.filter((metric) => metric.status === "warning").length
}
