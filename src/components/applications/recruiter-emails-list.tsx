import { ExternalLink, Mail } from "lucide-react"
import {
	formatRecruiterEmailType,
	normalizeOptionalString,
	RECRUITER_EMAIL_DISPLAY,
	toExternalHref,
} from "@/lib/recruiter-email-display"
import type { RecruiterEmail } from "@/types/application-detail"
import { cn } from "@/lib/utils"

interface RecruiterEmailsListProps {
	emails: RecruiterEmail[]
	className?: string
}

interface RecruiterEmailListItemProps {
	email: RecruiterEmail
}

export function RecruiterEmailsList({
	emails,
	className,
}: RecruiterEmailsListProps) {
	if (emails.length === 0) return null

	return (
		<div className={cn("space-y-3", className)}>
			<p className="text-sm font-semibold text-neutral-900">
				{RECRUITER_EMAIL_DISPLAY.sectionTitle(emails.length)}
			</p>
			<ul
				className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white"
				aria-label="Recruiter email contacts"
			>
				{emails.map((item) => (
					<RecruiterEmailListItem key={item.id} email={item} />
				))}
			</ul>
		</div>
	)
}

function RecruiterEmailListItem({ email }: RecruiterEmailListItemProps) {
	const sourceHref = toExternalHref(email.source_url)
	const typeLabel = formatRecruiterEmailType(email.type)
	const sourceName = normalizeOptionalString(email.source)

	return (
		<li className="flex gap-3 p-4">
			<span
				className={cn(
					"flex size-9 shrink-0 items-center justify-center",
					"rounded-lg bg-neutral-100 text-primary ring-1 ring-neutral-200/80",
				)}
				aria-hidden
			>
				<Mail className="size-4" />
			</span>

			<div className="min-w-0 flex-1 space-y-2">
				<div className="flex flex-wrap items-center gap-2">
					<span
						className="text-sm font-medium text-primary"
					>
						{email.email ? email.email : email.source_url}
					</span>
					<span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
						{typeLabel}
					</span>
				</div>

				{(sourceName || sourceHref) ? (
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
						{sourceName ? (
							<span>
								<span className="font-medium text-neutral-600">
									{RECRUITER_EMAIL_DISPLAY.sourceLabel}:
								</span>{" "}
								{sourceName}
							</span>
						) : null}
						{sourceHref ? (
							<a
								href={sourceHref}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
							>
								{RECRUITER_EMAIL_DISPLAY.viewSource}
								<ExternalLink className="size-3" aria-hidden />
							</a>
						) : null}
					</div>
				) : null}
			</div>
		</li>
	)
}
