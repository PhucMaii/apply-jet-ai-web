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
	const aiUsed =
		usage.ai_generations_used ?? usage.resume_generations_used ?? 0
	const aiLimit =
		usage.ai_generations_limit ?? usage.resume_generations_limit ?? 0

	return [
		{
			key: "aiGenerations",
			used: aiUsed,
			limit: aiLimit,
		},
		{
			key: "coverLetters",
			used: usage.cover_letters_used ?? 0,
			limit: usage.cover_letters_limit ?? 0,
		},
		{
			key: "filesDownload",
			used: usage.files_download_used ?? 0,
			limit: usage.files_download_limit ?? 0,
		},
		{
			key: "findHr",
			used: usage.find_hr_used ?? usage.find_hr_usage ?? 0,
			limit: usage.find_hr_limit ?? 0,
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
