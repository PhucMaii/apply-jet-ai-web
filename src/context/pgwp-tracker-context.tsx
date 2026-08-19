import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	type ReactNode,
} from "react"
import { useAuth } from "@/context/auth-context"
import {
	usePgwpTrackerQuery,
	usePgwpTrackerSave,
} from "@/hooks/use-pgwp-tracker-query"
import {
	formatDaysRemaining,
	formatHeroDaysLabel,
	formatHeroDaysValue,
	formatPgwpExpiry,
	getDaysRemaining,
	getPgwpPhase,
} from "@/lib/pgwp-display"
import { PGWP_PHASE_MESSAGE } from "@/lib/pgwp-copy"
import type { PgwpPhase } from "@/lib/pgwp-display"
import type { PgwpTrackerRow } from "@/types/database"

interface PgwpTrackerContextValue {
	tracker: PgwpTrackerRow | null
	isLoading: boolean
	isSaving: boolean
	error: string | null
	daysRemaining: number | null
	phase: PgwpPhase | null
	expiryLabel: string | null
	daysLabel: string | null
	heroDaysValue: string | null
	heroDaysLabel: string | null
	message: string | null
	isConfigured: boolean
	isExpired: boolean
	saveExpiryDate: (date: string) => Promise<void>
}

const PgwpTrackerContext = createContext<PgwpTrackerContextValue | null>(null)

export function PgwpTrackerProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth()
	const {
		data: tracker = null,
		isLoading,
		error: queryError,
	} = usePgwpTrackerQuery(user?.id)
	const saveMutation = usePgwpTrackerSave(user?.id)

	const derived = useMemo(() => {
		if (!tracker?.pgwp_expired_at) {
			return {
				daysRemaining: null,
				phase: null,
				expiryLabel: null,
				daysLabel: null,
				heroDaysValue: null,
				heroDaysLabel: null,
				message: null,
				isConfigured: false,
				isExpired: false,
			}
		}

		const daysRemaining = getDaysRemaining(tracker.pgwp_expired_at)
		const phase = getPgwpPhase(daysRemaining)

		return {
			daysRemaining,
			phase,
			expiryLabel: formatPgwpExpiry(tracker.pgwp_expired_at),
			daysLabel: formatDaysRemaining(daysRemaining),
			heroDaysValue: formatHeroDaysValue(daysRemaining),
			heroDaysLabel: formatHeroDaysLabel(daysRemaining),
			message: PGWP_PHASE_MESSAGE[phase],
			isConfigured: true,
			isExpired: daysRemaining <= 0,
		}
	}, [tracker])

	const saveExpiryDate = useCallback(
		async (date: string) => {
			await saveMutation.mutateAsync(date)
		},
		[saveMutation],
	)

	const error =
		queryError instanceof Error
			? queryError.message
			: saveMutation.error instanceof Error
				? saveMutation.error.message
				: null

	const value = useMemo<PgwpTrackerContextValue>(
		() => ({
			tracker,
			isLoading,
			isSaving: saveMutation.isPending,
			error,
			daysRemaining: derived.daysRemaining,
			phase: derived.phase,
			expiryLabel: derived.expiryLabel,
			daysLabel: derived.daysLabel,
			heroDaysValue: derived.heroDaysValue,
			heroDaysLabel: derived.heroDaysLabel,
			message: derived.message,
			isConfigured: derived.isConfigured,
			isExpired: derived.isExpired,
			saveExpiryDate,
		}),
		[tracker, isLoading, saveMutation.isPending, error, derived, saveExpiryDate],
	)

	return (
		<PgwpTrackerContext.Provider value={value}>
			{children}
		</PgwpTrackerContext.Provider>
	)
}

export function usePgwpTracker(): PgwpTrackerContextValue {
	const context = useContext(PgwpTrackerContext)
	if (!context) {
		throw new Error("usePgwpTracker must be used within PgwpTrackerProvider")
	}
	return context
}
