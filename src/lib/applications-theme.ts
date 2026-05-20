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
	select:
		"h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
	iconButton:
		"inline-flex size-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-50",
} as const
