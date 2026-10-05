import type { MouseEvent } from "react"
import { ChevronDown, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	APPLICATION_STATUSES,
	APPLICATION_STATUS_META,
	type ApplicationStatus,
	isApplicationStatus,
} from "@/lib/application-status"
import { cn } from "@/lib/utils"

interface ApplicationStatusMenuProps {
	status: ApplicationStatus
	onChange: (status: ApplicationStatus) => void
	ariaLabel: string
	isUpdating?: boolean
	className?: string
}

function stopPropagation(event: MouseEvent) {
	event.stopPropagation()
}

export function ApplicationStatusMenu({
	status,
	onChange,
	ariaLabel,
	isUpdating = false,
	className,
}: ApplicationStatusMenuProps) {
	const meta = APPLICATION_STATUS_META[status]

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label={`${ariaLabel}. Current: ${meta.label}`}
				onClick={stopPropagation}
				onKeyDown={(event) => event.stopPropagation()}
				className={cn(
					"group inline-flex items-center rounded-full",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1",
					className,
				)}
			>
				<Badge tone={meta.tone} hasDot className="pr-1.5 transition-[filter] group-hover:brightness-95">
					{meta.label}
					{isUpdating ? (
						<Loader2 className="size-3 animate-spin" aria-hidden />
					) : (
						<ChevronDown className="size-3 opacity-60" aria-hidden />
					)}
				</Badge>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				onClick={stopPropagation}
				onKeyDown={(event) => event.stopPropagation()}
			>
				<DropdownMenuLabel>Move to</DropdownMenuLabel>
				<DropdownMenuRadioGroup
					value={status}
					onValueChange={(value) => {
						if (isApplicationStatus(value) && value !== status) onChange(value)
					}}
				>
					{APPLICATION_STATUSES.map((option) => (
						<DropdownMenuRadioItem key={option} value={option}>
							<span
								className={cn(
									"size-2 shrink-0 rounded-full",
									APPLICATION_STATUS_META[option].dotClass,
								)}
								aria-hidden
							/>
							{APPLICATION_STATUS_META[option].label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
