/** Light theme styles for the profile resume upload section. */
export const RESUME_SECTION_THEME = {
	section: "overflow-hidden rounded-xl border border-hairline bg-surface shadow-card",
	sectionHeader: "flex items-center gap-3 border-b border-hairline px-5 py-4",
	iconWrap: "flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand",
	title: "text-sm font-semibold text-ink",
	subtitle: "text-xs text-ink-muted",
	body: "p-5",
	error:
		"mb-4 flex items-start justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700",
	errorDismiss: "shrink-0 font-medium text-rose-700 hover:text-rose-900",
	uploadZone: {
		base: "w-full rounded-xl border-2 border-dashed px-4 py-10 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
		idle: "border-hairline-strong bg-surface-sunken/50 hover:border-brand/50 hover:bg-brand-soft/50",
		active: "border-brand bg-brand-soft",
		disabled: "pointer-events-none opacity-70",
	},
	uploadIcon:
		"flex size-12 items-center justify-center rounded-xl bg-surface text-brand shadow-card",
	uploadTitle: "text-sm font-medium text-ink",
	uploadHint: "text-xs text-ink-subtle",
	cancelButton:
		"mt-3 w-full rounded-lg border border-hairline-strong bg-surface py-2 text-xs font-medium text-ink hover:bg-surface-sunken",
	fileCard: "flex items-start gap-3 rounded-lg border border-hairline bg-surface-sunken/50 p-3",
	fileIcon: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft",
	fileTitle: "truncate text-sm font-medium text-ink",
	fileMeta: "mt-0.5 text-xs text-ink-subtle",
	primaryButton:
		"inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover",
	secondaryButton:
		"inline-flex h-9 items-center gap-2 rounded-lg border border-hairline-strong bg-surface px-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-sunken",
	autofillPanel:
		"mt-5 border-t border-hairline pt-5",
	autofillButton:
		"flex w-full items-center gap-3 rounded-lg border border-hairline bg-surface px-4 py-3 text-left transition-colors duration-200 hover:border-brand/40 hover:bg-brand-soft/40 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
	autofillIcon: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand",
	autofillTitle: "block text-sm font-semibold text-ink",
	autofillHint: "mt-0.5 block text-xs text-ink-muted",
	skeleton: "skeleton-shimmer rounded",
} as const
