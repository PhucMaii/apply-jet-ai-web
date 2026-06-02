export const PAGE_HEADER_THEME = {
	root: "border-b border-neutral-200 bg-white",
	inner: "mx-auto max-w-6xl px-4 sm:px-6",
	toolbar:
		"flex h-14 items-center justify-between gap-3 border-b border-neutral-100 sm:h-16",
	brand: "flex min-w-0 items-center gap-2.5",
	brandLogo:
		"flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-neutral-200",
	brandName:
		"truncate font-display text-base font-semibold tracking-tight text-neutral-900",
	desktopNav: "hidden items-center gap-0.5 md:flex",
	navLink:
		"inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900",
	navLinkActive:
		"bg-neutral-100 text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900",
	toolbarActions: "flex shrink-0 items-center gap-2 sm:gap-3",
	userChip:
		"hidden items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 py-1 pl-1 pr-3 sm:flex",
	userAvatar:
		"flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
	userEmail: "max-w-[160px] truncate text-xs font-medium text-neutral-700 lg:max-w-[220px]",
	menuButton: "inline-flex md:hidden",
	hero: "py-6 sm:py-8",
	heroRow: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
	heroText: "min-w-0",
	title:
		"font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl",
	description: "mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600",
	metaRow: "mt-3 flex flex-wrap items-center gap-2",
	metaEmail: "truncate text-sm font-medium text-neutral-700",
	mobileNav:
		"mt-4 flex gap-2 overflow-x-auto pb-1 thin-scrollbar md:hidden",
	mobileNavLink:
		"inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50",
	mobileNavLinkActive:
		"border-primary/30 bg-primary/5 text-primary hover:border-primary/30 hover:bg-primary/5",
	menuPanel:
		"absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg",
	menuItem:
		"flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50",
	menuItemDanger: "text-red-600 hover:bg-red-50 hover:text-red-700",
	menuDivider: "my-1 border-t border-neutral-100",
} as const
