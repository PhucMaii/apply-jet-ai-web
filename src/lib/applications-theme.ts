import { DASHBOARD_THEME } from "@/lib/dashboard-theme"

/** Light theme tokens for the applications dashboard. */
export const APPLICATIONS_THEME = {
	...DASHBOARD_THEME,
	tableWrap:
		"overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm",
	tableScroll: "overflow-x-auto thin-scrollbar",
	table: "w-full min-w-[720px] border-collapse text-left text-sm",
	thead: "border-b border-neutral-200 bg-neutral-50",
	th: "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-600",
	td: "px-4 py-3 align-middle text-neutral-900",
	row: "border-b border-neutral-100 transition-colors hover:bg-neutral-50/80",
	rowExpanded: "bg-neutral-50/50",
	detailCell: "border-b border-neutral-100 bg-neutral-50/40 px-4 py-4",
	empty: "rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm",
	emptyFilter:
		"rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-6 py-10 text-center",
	select:
		"h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
	iconButton:
		"inline-flex size-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-50",
	applicationCardGrid:
		"grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
	applicationCard:
		"flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:p-5",
	applicationCardAvatar:
		"flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-sm font-semibold tracking-wide text-neutral-700 ring-1 ring-neutral-200/80",
	applicationCardTitle:
		"truncate font-display text-base font-semibold text-neutral-900 sm:text-lg",
	applicationCardCompany: "mt-0.5 truncate text-sm text-neutral-500",
	filterChip:
		"inline-flex items-center rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-50",
	filterChipActive:
		"border-primary/30 bg-primary/5 text-neutral-900",
} as const
