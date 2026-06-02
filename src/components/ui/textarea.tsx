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
						"flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm text-foreground shadow-inner transition-colors",
						"border-neutral-300 bg-white text-neutral-900 shadow-sm placeholder:text-neutral-400 focus-visible:ring-primary/40 focus-visible:ring-offset-white",
						"placeholder:text-neutral-400",
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
