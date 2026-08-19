import { useState, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PGWP_COPY } from "@/lib/pgwp-copy"
import { isValidDateInput, toDateInputValue } from "@/lib/pgwp-display"
import { cn } from "@/lib/utils"

interface PgwpDateFieldProps {
	initialValue?: string | null
	onSave: (date: string) => Promise<void>
	isSaving: boolean
	submitLabel?: string
	className?: string
	onCancel?: () => void
}

export function PgwpDateField({
	initialValue,
	onSave,
	isSaving,
	submitLabel = PGWP_COPY.emptyCta,
	className,
	onCancel,
}: PgwpDateFieldProps) {
	const [value, setValue] = useState(
		initialValue ? toDateInputValue(initialValue) : "",
	)
	const [validationError, setValidationError] = useState<string | null>(null)

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()
		if (!isValidDateInput(value)) {
			setValidationError("Enter a valid expiry date.")
			return
		}
		setValidationError(null)
		await onSave(value)
	}

	return (
		<form
			onSubmit={(event) => void handleSubmit(event)}
			className={cn("flex flex-col gap-3 sm:flex-row sm:items-end", className)}
		>
			<div className="min-w-0 flex-1 space-y-1.5">
				<Label htmlFor="pgwp-expiry-date" className="text-sm text-indigo-950/80">
					PGWP expiry date
				</Label>
				<Input
					id="pgwp-expiry-date"
					type="date"
					value={value}
					onChange={(event) => {
						setValue(event.target.value)
						setValidationError(null)
					}}
					className="border-indigo-200/80 bg-white"
					required
				/>
				{validationError ? (
					<p className="text-xs text-red-600" role="alert">
						{validationError}
					</p>
				) : (
					<p className="text-xs text-indigo-900/50">{PGWP_COPY.emptyHint}</p>
				)}
			</div>
			<div className="flex shrink-0 gap-2">
				{onCancel ? (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onCancel}
						disabled={isSaving}
					>
						{PGWP_COPY.cancelEdit}
					</Button>
				) : null}
				<Button type="submit" size="sm" disabled={isSaving} className="gap-1.5">
					{isSaving ? (
						<>
							<Loader2 className="size-3.5 animate-spin" aria-hidden />
							{PGWP_COPY.saving}
						</>
					) : (
						submitLabel
					)}
				</Button>
			</div>
		</form>
	)
}
