/** Layout classes for the jobs split view. */
export const JOBS_THEME = {
	board: [
		"flex min-h-[28rem] flex-col rounded-xl",
		"border border-hairline bg-surface shadow-card lg:overflow-hidden",
		"lg:h-[calc(100dvh-18rem)] lg:min-h-[32rem] lg:flex-row",
	].join(" "),
	listPane: [
		"flex min-h-0 w-full flex-col",
		"lg:w-[22.5rem] lg:shrink-0 lg:border-r lg:border-hairline xl:w-96",
	].join(" "),
	listScroll: "lg:min-h-0 lg:flex-1 lg:overflow-y-auto",
	detailPane: "flex min-h-0 min-w-0 flex-1 flex-col bg-surface",
	detailScroll: "px-5 py-5 sm:px-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto",
	prose: [
		"job-description text-sm leading-relaxed text-ink-muted",
		"[&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-ink",
		"[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink",
		"[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-ink",
		"[&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
		"[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5",
		"[&_li]:leading-relaxed [&_a]:font-medium [&_a]:text-brand",
		"[&_a]:underline-offset-2 hover:[&_a]:underline",
		"[&_strong]:font-semibold [&_strong]:text-ink",
	].join(" "),
} as const
