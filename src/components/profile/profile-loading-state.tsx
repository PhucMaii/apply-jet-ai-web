import { Loader2 } from "lucide-react"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"

export function ProfileLoadingState() {
	return (
		<div
			className={DASHBOARD_THEME.loadingPanel}
			aria-busy="true"
		>
			<div className={DASHBOARD_THEME.loadingIconWrap}>
				<Loader2 className="size-7 animate-spin" aria-hidden />
			</div>
			<div className="text-center">
				<p className="text-sm font-medium text-neutral-900">
					Loading your workspace
				</p>
				<p className={`mt-1 text-xs ${DASHBOARD_THEME.muted}`}>
					Almost there…
				</p>
			</div>
		</div>
	)
}
