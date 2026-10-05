import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUpRight, ExternalLink, MoreHorizontal, Trash2 } from "lucide-react"
import ConfirmModal from "@/components/ui/confirm-modal"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { APPLICATION_DELETE_COPY } from "@/lib/application-delete-copy"
import { APPLICATIONS_COPY } from "@/lib/applications-copy"
import { applicationDetailPath } from "@/lib/constants"
import type { ApplicationWithDocuments } from "@/types/database"
import { cn } from "@/lib/utils"

interface ApplicationRowActionsProps {
	app: ApplicationWithDocuments
	jobTitle: string
	companyName: string
	onDelete: (applicationId: string) => Promise<{
		success: boolean
		message: string
	}>
	className?: string
}

export function ApplicationRowActions({
	app,
	jobTitle,
	companyName,
	onDelete,
	className,
}: ApplicationRowActionsProps) {
	const navigate = useNavigate()
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)

	const handleConfirmDelete = async () => {
		const result = await onDelete(app.id)
		if (!result.success) throw new Error(result.message)
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					aria-label={APPLICATIONS_COPY.moreActions(jobTitle)}
					onClick={(event) => event.stopPropagation()}
					onKeyDown={(event) => event.stopPropagation()}
					className={cn(
						"inline-flex size-8 items-center justify-center rounded-md text-ink-subtle transition-colors",
						"hover:bg-surface-sunken hover:text-ink",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
						"data-[state=open]:bg-surface-sunken data-[state=open]:text-ink",
						className,
					)}
				>
					<MoreHorizontal className="size-4" aria-hidden />
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					onClick={(event) => event.stopPropagation()}
					onKeyDown={(event) => event.stopPropagation()}
				>
					<DropdownMenuItem onSelect={() => navigate(applicationDetailPath(app.id))}>
						<ArrowUpRight aria-hidden />
						{APPLICATIONS_COPY.open}
					</DropdownMenuItem>
					{app.job_url ? (
						<DropdownMenuItem asChild>
							<a href={app.job_url} target="_blank" rel="noopener noreferrer">
								<ExternalLink aria-hidden />
								{APPLICATIONS_COPY.viewPosting}
							</a>
						</DropdownMenuItem>
					) : null}
					<DropdownMenuSeparator />
					<DropdownMenuItem isDestructive onSelect={() => setIsConfirmOpen(true)}>
						<Trash2 aria-hidden />
						{APPLICATION_DELETE_COPY.buttonLabelShort}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<span
				className="contents"
				onClick={(event) => event.stopPropagation()}
				onKeyDown={(event) => event.stopPropagation()}
			>
				<ConfirmModal
					isOpen={isConfirmOpen}
					onClose={() => setIsConfirmOpen(false)}
					onConfirm={handleConfirmDelete}
					title={APPLICATION_DELETE_COPY.modalTitle}
					message={APPLICATION_DELETE_COPY.modalMessage(jobTitle, companyName)}
					successMessage={APPLICATION_DELETE_COPY.successMessage}
				/>
			</span>
		</>
	)
}
