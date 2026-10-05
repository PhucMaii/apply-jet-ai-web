import { invokeEdgeFunction } from "@/lib/edge-function"
import { JOBS_COPY } from "@/lib/jobs-copy"

const EDGE_FUNCTION_NAME = "increment-job-clicks" as const
const SESSION_STORAGE_KEY = "applyjet:job-apply-clicks" as const

type IncrementJobClicksResponse = {
	jobId?: number
	clicks?: number
	error?: string
}

function readClickedIds(): Set<number> {
	if (typeof sessionStorage === "undefined") return new Set()
	try {
		const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
		if (!raw) return new Set()
		const parsed = JSON.parse(raw) as unknown
		if (!Array.isArray(parsed)) return new Set()
		return new Set(
			parsed
				.map((value) => Number(value))
				.filter((value) => Number.isFinite(value) && value > 0),
		)
	} catch {
		return new Set()
	}
}

function writeClickedIds(ids: Set<number>) {
	if (typeof sessionStorage === "undefined") return
	try {
		sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify([...ids]))
	} catch (error) {
		console.error("Something went wrong saving job click session:", error)
	}
}

export function hasTrackedJobApplyClick(jobId: number): boolean {
	return readClickedIds().has(jobId)
}

function markTrackedJobApplyClick(jobId: number) {
	const ids = readClickedIds()
	ids.add(jobId)
	writeClickedIds(ids)
}

/**
 * LinkedIn-style ranges — never show the exact count.
 * Returns null when there is not enough activity to mention yet.
 */
export function formatJobClicksLabel(
	clicks: number | null | undefined,
): string | null {
	const count = typeof clicks === "number" && Number.isFinite(clicks) ? clicks : 0
	if (count <= 0) return null
	if (count < 25) return JOBS_COPY.clicksFewerThan25
	if (count < 50) return JOBS_COPY.clicksFewerThan50
	if (count < 100) return JOBS_COPY.clicksFewerThan100
	if (count < 200) return JOBS_COPY.clicksOver100
	if (count < 500) return JOBS_COPY.clicksOver200
	return JOBS_COPY.clicksOver500
}

/**
 * Fire-and-forget Apply click. Dedupes once per job per browser session.
 * Returns the new server click total when a new click was recorded.
 */
export async function trackJobApplyClick(
	jobId: number,
): Promise<number | null> {
	if (!Number.isFinite(jobId) || jobId <= 0) return null
	if (hasTrackedJobApplyClick(jobId)) return null

	markTrackedJobApplyClick(jobId)

	const result = await invokeEdgeFunction<IncrementJobClicksResponse>(
		EDGE_FUNCTION_NAME,
		{ jobId },
	)

	if (!result.ok) {
		console.error("Something went wrong tracking job click:", result.message)
		return null
	}

	if (result.data?.error) {
		console.error(
			"Something went wrong tracking job click:",
			result.data.error,
		)
		return null
	}

	const clicks = result.data?.clicks
	return typeof clicks === "number" && Number.isFinite(clicks) ? clicks : null
}
