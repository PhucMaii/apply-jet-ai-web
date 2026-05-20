/** Light theme styles for the profile resume upload section. */
export const RESUME_SECTION_THEME = {
	section: "mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm",
	sectionHeader: "flex items-center gap-3 border-b border-neutral-200 px-4 py-3",
	iconWrap: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
	title: "text-sm font-semibold text-neutral-900",
	subtitle: "text-xs text-neutral-500",
	body: "p-4",
	error:
		"mb-4 flex items-start justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700",
	errorDismiss: "shrink-0 text-red-600 hover:text-red-800",
	uploadZone: {
		base: "w-full rounded-xl border-2 border-dashed px-4 py-8 transition-all duration-200",
		idle: "border-neutral-300 bg-neutral-50 hover:border-primary/50 hover:bg-primary/5",
		active: "border-primary bg-primary/10",
		disabled: "pointer-events-none opacity-70",
	},
	uploadIcon:
		"flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/10 text-primary",
	uploadTitle: "text-sm font-medium text-neutral-900",
	uploadHint: "text-xs text-neutral-500",
	cancelButton:
		"mt-3 w-full rounded-lg border border-neutral-300 bg-white py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50",
	fileCard: "flex items-start gap-3 rounded-lg bg-neutral-50 p-3",
	fileIcon: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10",
	fileTitle: "truncate text-sm font-medium text-neutral-900",
	fileMeta: "mt-0.5 text-xs text-neutral-500",
	primaryButton:
		"inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90",
	secondaryButton:
		"inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50",
	autofillPanel:
		"mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4",
	autofillButton:
		"flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-white px-4 py-3 text-left transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50",
	autofillIcon: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary",
	autofillTitle: "block text-sm font-semibold text-neutral-900",
	autofillHint: "mt-0.5 block text-xs text-neutral-500",
	skeleton: "animate-pulse rounded bg-neutral-200",
} as const
