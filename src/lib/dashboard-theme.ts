/**
 * Shared light theme for signed-in dashboard pages (applications, profile).
 * Built on the product tokens in `index.css` (ink, hairline, surface, brand).
 */
export const DASHBOARD_THEME = {
	page: "min-h-screen bg-canvas text-ink",
	header: "border-b border-hairline bg-surface",
	headerInner:
		"mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6",
	headerInnerProfile:
		"mx-auto max-w-6xl px-4 py-8 sm:px-6",
	main: "mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6",
	brandLabel: "text-xs font-semibold uppercase tracking-[0.14em] text-brand",
	title: "font-display text-2xl font-semibold text-ink",
	titleLg: "font-display text-3xl font-semibold tracking-tight text-ink",
	subtitle: "text-sm text-ink-muted",
	body: "text-sm leading-relaxed text-ink-muted",
	email: "truncate text-sm font-medium text-ink",
	link: "font-medium text-brand underline-offset-4 hover:underline",
	muted: "text-ink-muted",
	error:
		"flex gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700",
	noticeSuccess:
		"flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800",
	noticeInfo:
		"flex gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800",
	noticeWarning:
		"flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900",
	loadingPanel:
		"flex flex-col items-center justify-center gap-4 rounded-xl border border-hairline bg-surface py-24",
	loadingIconWrap:
		"flex size-14 items-center justify-center rounded-xl bg-brand-soft text-brand",
	avatar:
		"flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand text-lg font-bold tracking-tight text-white",
	navButton:
		"border-hairline-strong bg-surface text-ink hover:bg-surface-sunken",
	navButtonGhost:
		"text-ink-muted hover:bg-surface-sunken hover:text-ink",
	mainTabsList:
		"grid h-11 w-full gap-1 rounded-lg bg-surface-sunken p-1",
	mainTabsListTwo:
		"max-w-md grid-cols-2",
	mainTabsTrigger:
		"gap-2 rounded-md text-sm text-ink-muted transition-colors data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-card",
	sectionTabsList:
		"mb-6 flex h-auto w-full flex-wrap items-stretch justify-start gap-1.5 rounded-lg bg-surface-sunken p-1.5",
	sectionTabsTrigger:
		"min-w-0 gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-ink-muted transition-colors data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-card",
	contentPanel:
		"rounded-xl border border-hairline bg-surface p-4 shadow-card sm:p-6",
	card: "border-hairline bg-surface shadow-card",
	cardDescription: "text-ink-muted",
	cardIconWrap: "rounded-lg bg-brand-soft text-brand",
	billingIconWrap: "rounded-lg bg-brand-soft text-brand",
	code: "rounded bg-surface-sunken px-1 py-0.5 text-xs text-ink",
} as const
