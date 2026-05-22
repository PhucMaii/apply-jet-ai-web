/**
 * Shared light theme for signed-in dashboard pages (applications, profile).
 * White background, dark text, primary accents on actions and links.
 */
export const DASHBOARD_THEME = {
	page: "min-h-screen bg-white text-neutral-900",
	header: "border-b border-neutral-200 bg-white",
	headerInner:
		"mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6",
	headerInnerProfile:
		"mx-auto max-w-6xl px-4 py-8 sm:px-6",
	main: "mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6",
	brandLabel: "text-xs font-semibold uppercase tracking-wide text-primary",
	title: "font-display text-2xl font-bold text-neutral-900",
	titleLg: "font-display text-3xl font-bold tracking-tight text-neutral-900",
	subtitle: "text-sm text-neutral-500",
	body: "text-sm leading-relaxed text-neutral-600",
	email: "truncate text-sm font-medium text-neutral-800",
	link: "font-medium text-primary underline-offset-4 hover:underline",
	muted: "text-neutral-500",
	error:
		"flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
	noticeSuccess:
		"flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800",
	noticeInfo:
		"flex gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800",
	noticeWarning:
		"flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900",
	loadingPanel:
		"flex flex-col items-center justify-center gap-4 rounded-2xl border border-neutral-200 bg-white py-24 shadow-sm",
	loadingIconWrap:
		"flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20",
	avatar:
		"flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold tracking-tight text-primary-foreground shadow-sm",
	navButton:
		"border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
	navButtonGhost:
		"text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
	mainTabsList:
		"grid h-12 w-full gap-1 rounded-xl border border-neutral-200 bg-neutral-100 p-1",
	mainTabsListTwo:
		"max-w-md grid-cols-2",
	mainTabsListThree:
		"max-w-2xl grid-cols-3",
	mainTabsTrigger:
		"gap-2 rounded-lg text-sm text-neutral-600 transition-all data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm",
	sectionTabsList:
		"mb-6 flex h-auto w-full flex-wrap items-stretch justify-start gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 p-1.5",
	sectionTabsTrigger:
		"min-w-0 gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-600 transition-all data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm",
	contentPanel:
		"rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6",
	card: "border-neutral-200 bg-white shadow-sm",
	cardDescription: "text-neutral-600",
	cardIconWrap: "rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20",
	billingIconWrap: "rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20",
	code: "rounded bg-neutral-100 px-1 py-0.5 text-xs text-neutral-800",
} as const
