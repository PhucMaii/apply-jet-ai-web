import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, Trash2 } from "lucide-react"
import ConfirmModal from "@/components/ui/confirm-modal"
import { Button } from "@/components/ui/button"
import { APPLICATION_DELETE_COPY } from "@/lib/application-delete-copy"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface DeleteApplicationControlProps {
	applicationId: string
	jobTitle: string
	companyName: string
	isDeleting?: boolean
	onDelete: (applicationId: string) => Promise<{
		success: boolean
		message: string
	}>
	/** After delete on the detail page, navigate back to the list. */
	redirectOnSuccess?: boolean
	/** Compact icon control for table rows. */
	variant?: "table" | "detail"
	className?: string
}

export function DeleteApplicationControl({
	applicationId,
	jobTitle,
	companyName,
	isDeleting = false,
	onDelete,
	redirectOnSuccess = false,
	variant = "table",
	className,
}: DeleteApplicationControlProps) {
	const navigate = useNavigate()
	const [isOpen, setIsOpen] = useState(false)

	const displayTitle = jobTitle?.trim() || "this role"
	const displayCompany = companyName?.trim() || "this company"

	const handleConfirm = async () => {
		const result = await onDelete(applicationId)
		if (!result.success) {
			throw new Error(result.message)
		}
		if (redirectOnSuccess) {
			navigate(ROUTES.applications)
		}
	}

	return (
		<>
			{variant === "table" ? (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className={cn(
						"h-8 gap-1 px-2 text-neutral-500 hover:text-destructive",
						className,
					)}
					disabled={isDeleting}
					aria-label={APPLICATION_DELETE_COPY.buttonLabelShort}
					onClick={() => setIsOpen(true)}
				>
					{isDeleting ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : (
						<Trash2 className="size-4" aria-hidden />
					)}
					<span className="hidden sm:inline">
						{APPLICATION_DELETE_COPY.buttonLabel}
					</span>
				</Button>
			) : (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className={cn(
						APPLICATIONS_THEME.muted,
						"gap-1.5 text-neutral-500 underline-offset-4 hover:bg-destructive/5 hover:text-destructive",
						className,
					)}
					disabled={isDeleting}
					onClick={() => setIsOpen(true)}
				>
					{isDeleting ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : (
						<Trash2 className="size-4" aria-hidden />
					)}
					{APPLICATION_DELETE_COPY.buttonLabelShort}
				</Button>
			)}

			<ConfirmModal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				onConfirm={handleConfirm}
				title={APPLICATION_DELETE_COPY.modalTitle}
				message={APPLICATION_DELETE_COPY.modalMessage(
					displayTitle,
					displayCompany,
				)}
				successMessage={APPLICATION_DELETE_COPY.successMessage}
			/>
		</>
	)
}
