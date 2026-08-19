import type { PgwpPhase } from "@/lib/pgwp-display"

export const PGWP_THEME = {
	heroCard:
		"relative overflow-visible rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-indigo-50/40 p-6 shadow-sm sm:p-8",
	heroIcon:
		"flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-900/10 text-indigo-900",
	heroNumber:
		"font-display text-6xl font-bold tabular-nums tracking-tight text-indigo-950 sm:text-7xl",
	heroLabel: "mt-1 text-base font-medium text-indigo-900/80 sm:text-lg",
	heroExpiry: "text-sm text-indigo-900/60",
	heroMessage:
		"mt-5 max-w-xl text-sm leading-relaxed text-indigo-950/75 sm:text-[0.9375rem]",
	watermark:
		"pointer-events-none absolute bottom-4 left-4 flex items-center gap-1.5 opacity-40",
	mascotWrap:
		"relative flex shrink-0 items-end justify-center self-stretch",
	watermarkText: "text-xs font-semibold tracking-tight text-indigo-900",
	compactCard:
		"mb-6 flex flex-col gap-3 rounded-xl border border-indigo-200/70 bg-indigo-50/40 p-4 sm:flex-row sm:items-center sm:justify-between",
	compactTitle: "text-sm font-semibold text-indigo-950",
	compactMeta: "text-sm text-indigo-900/70",
	pillBase:
		"inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
	pillUnset:
		"border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100/80",
} as const

export const PGWP_PHASE_STYLES: Record<
	PgwpPhase,
	{ heroAccent: string; pill: string; compactBorder: string }
> = {
	healthy: {
		heroAccent: "text-indigo-950",
		pill: "border-indigo-200/80 bg-indigo-50 text-indigo-900 hover:bg-indigo-100/80",
		compactBorder: "border-indigo-200/70 bg-indigo-50/40",
	},
	focus: {
		heroAccent: "text-indigo-950",
		pill: "border-indigo-300/80 bg-indigo-100/60 text-indigo-950 hover:bg-indigo-100",
		compactBorder: "border-indigo-300/70 bg-indigo-50/60",
	},
	urgent: {
		heroAccent: "text-amber-950",
		pill: "border-amber-300/80 bg-amber-50 text-amber-950 hover:bg-amber-100/80",
		compactBorder: "border-amber-300/70 bg-amber-50/50",
	},
	critical: {
		heroAccent: "text-red-900",
		pill: "border-red-300/80 bg-red-50 text-red-900 hover:bg-red-100/80",
		compactBorder: "border-red-300/70 bg-red-50/60",
	},
	expired: {
		heroAccent: "text-neutral-800",
		pill: "border-neutral-300 bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80",
		compactBorder: "border-neutral-300/70 bg-neutral-50/80",
	},
}
