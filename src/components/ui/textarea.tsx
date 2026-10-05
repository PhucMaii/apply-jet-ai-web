import { forwardRef, useId, type TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { INPUT_ERROR } from "./input"

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>
& {
	error?: string
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, error, id, ...props }, ref) => {
		const generatedErrorId = useId()
		const errorId = id ? `${id}-error` : generatedErrorId
		const hasError = Boolean(error)

		return (
			<div className="w-full">
				<textarea
					id={id}
					className={cn(
						"flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm transition-[border-color,box-shadow]",
						"border-hairline-strong bg-surface text-ink placeholder:text-ink-subtle",
						"hover:border-ink-subtle/60",
						"focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/12",
						"disabled:cursor-not-allowed disabled:opacity-50",
						hasError && INPUT_ERROR.field,
						className,
					)}
					ref={ref}
					aria-invalid={hasError}
					aria-describedby={hasError ? errorId : undefined}
					{...props}
				/>
				{hasError ? (
					<p id={errorId} className={INPUT_ERROR.message} role="alert">
						{error}
					</p>
				) : null}
			</div>
		)
	}
)
