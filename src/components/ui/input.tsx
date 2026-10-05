import { forwardRef, useId, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

// eslint-disable-next-line react-refresh/only-export-components
export const INPUT_ERROR = {
	field:
		"border-rose-500 hover:border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/15",
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
						"flex h-11 w-full rounded-md border px-3 py-2 text-sm transition-[border-color,box-shadow]",
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
	},
)
Input.displayName = "Input"
