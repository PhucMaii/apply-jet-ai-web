import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Info,
} from "lucide-react"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import {
	NOTICE_VARIANT,
	type ProfileNotice,
} from "@/lib/profile-notice"
import { cn } from "@/lib/utils"

interface ProfilePageAlertsProps {
	error: string | null
	notice: ProfileNotice | null
}

export function ProfilePageAlerts({ error, notice }: ProfilePageAlertsProps) {
	return (
		<>
			{error ? (
				<div className={DASHBOARD_THEME.error} role="alert">
					<AlertCircle
						className="mt-0.5 size-5 shrink-0 text-red-600"
						aria-hidden
					/>
					<p className="min-w-0 leading-relaxed">{error}</p>
				</div>
			) : null}
			{notice ? (
				<div
					className={cn(
						notice.variant === NOTICE_VARIANT.success &&
							DASHBOARD_THEME.noticeSuccess,
						notice.variant === NOTICE_VARIANT.info &&
							DASHBOARD_THEME.noticeInfo,
						notice.variant === NOTICE_VARIANT.warning &&
							DASHBOARD_THEME.noticeWarning,
					)}
					role="status"
					aria-live="polite"
				>
					{notice.variant === NOTICE_VARIANT.success ? (
						<CheckCircle2
							className="mt-0.5 size-5 shrink-0 text-emerald-600"
							aria-hidden
						/>
					) : notice.variant === NOTICE_VARIANT.warning ? (
						<AlertTriangle
							className="mt-0.5 size-5 shrink-0 text-amber-600"
							aria-hidden
						/>
					) : (
						<Info
							className="mt-0.5 size-5 shrink-0 text-sky-600"
							aria-hidden
						/>
					)}
					<p className="min-w-0 leading-relaxed">{notice.text}</p>
				</div>
			) : null}
		</>
	)
}
