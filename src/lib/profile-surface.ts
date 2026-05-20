/** Reusable surface styles for profile form sections (light dashboard). */
export const PROFILE_SURFACE = {
	card: "border-neutral-200 bg-white shadow-sm",
	itemPanel: "rounded-lg border border-neutral-200 bg-neutral-50 p-4",
	infoBox: "rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm",
	fieldLabel: "text-neutral-700",
	fieldInput:
		"border-neutral-300 bg-white text-neutral-900 shadow-sm placeholder:text-neutral-400 focus-visible:ring-primary/40 focus-visible:ring-offset-white",
	fieldTextarea:
		"min-h-[120px] border-neutral-300 bg-white text-neutral-900 shadow-sm placeholder:text-neutral-400 focus-visible:ring-primary/40 focus-visible:ring-offset-white",
	infoBoxTitle: "font-medium text-neutral-900",
	infoBoxText: "text-neutral-600",
	sectionIcon: "size-4 text-primary",
	select:
		"flex h-11 w-full cursor-pointer rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
	skillChip:
		"border border-neutral-200 bg-neutral-50 px-2.5 py-1.5",
	skillBadge:
		"rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700",
} as const
