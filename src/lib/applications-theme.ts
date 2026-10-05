import { DASHBOARD_THEME } from "@/lib/dashboard-theme"

/** Light theme tokens for the applications dashboard. */
export const APPLICATIONS_THEME = {
	...DASHBOARD_THEME,
	select:
		"h-9 rounded-md border border-hairline-strong bg-surface px-2 text-sm text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/12",
} as const
