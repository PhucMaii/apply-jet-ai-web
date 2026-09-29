import { APPLICATIONS_THEME } from "@/lib/applications-theme"

/** Theme tokens for the authenticated jobs feed. */
export const JOBS_THEME = {
	...APPLICATIONS_THEME,
	filters:
		"space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm",
	filterField: "space-y-1.5",
	filterLabel:
		"text-xs font-semibold uppercase tracking-wide text-neutral-500",
	board:
		"grid min-h-[70vh] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]",
	listPane:
		"flex max-h-[70vh] flex-col border-neutral-200 lg:border-r",
	listScroll: "flex-1 overflow-y-auto thin-scrollbar",
	listItem:
		"w-full border-b border-neutral-100 px-4 py-3.5 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30",
	listItemActive: "bg-primary/[0.06] hover:bg-primary/[0.08]",
	detailPane: "flex max-h-[70vh] min-h-[50vh] flex-col bg-white",
	detailScroll: "flex-1 overflow-y-auto thin-scrollbar p-5 sm:p-6",
	detailHeader:
		"shrink-0 border-b border-neutral-100 px-5 py-4 sm:px-6",
	companyMark:
		"flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-semibold tracking-wide text-neutral-700",
	metaRow:
		"mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-neutral-500",
	metaDot: "text-neutral-300",
	badge:
		"inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium capitalize text-neutral-600",
	postedFresh:
		"inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800",
	descMissing:
		"inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900",
	prose: [
		"job-description text-sm leading-relaxed text-neutral-700",
		"[&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-neutral-900",
		"[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-neutral-900",
		"[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-neutral-900",
		"[&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
		"[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5",
		"[&_li]:leading-relaxed [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline",
		"[&_strong]:font-semibold [&_strong]:text-neutral-900",
	].join(" "),
} as const
