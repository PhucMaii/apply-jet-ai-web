import { forwardRef, useId, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

// eslint-disable-next-line react-refresh/only-export-components
export const INPUT_ERROR = {
	field:
		"border-red-500 focus-visible:ring-red-500/40 focus-visible:ring-offset-white",
	message: "mt-1.5 text-sm text-red-600",
} as const

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, type = "text", error, id, ...props }, ref) => {
		const generatedErrorId = useId()
		const errorId = id ? `${id}-error` : generatedErrorId
		const hasError = Boolean(error)

		return (
			<div className="w-full">
				<input
					id={id}
					type={type}
					className={cn(
						"flex h-11 w-full rounded-md border px-3 py-2 text-sm text-foreground shadow-inner transition-colors",
						"placeholder:text-muted-foreground",
						"border-neutral-300 bg-white text-neutral-900 shadow-sm placeholder:text-neutral-400 focus-visible:ring-primary/40 focus-visible:ring-offset-white",
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
	},
)
Input.displayName = "Input"
