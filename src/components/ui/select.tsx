import { forwardRef, type SelectHTMLAttributes } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption<TValue extends string = string> {
	value: TValue
	label: string
}

export interface SelectProps
	extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
	options: readonly SelectOption[]
	size?: "sm" | "md"
	wrapperClassName?: string
}

const SELECT_SIZE_CLASS = {
	sm: "h-9 pl-3 pr-8 text-sm",
	md: "h-11 pl-3 pr-9 text-sm",
} as const

/**
 * Native select styled to match `Input`. Native keeps full keyboard,
 * screen-reader, and mobile picker support for free.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ options, size = "md", className, wrapperClassName, ...props }, ref) => (
		<div className={cn("relative inline-flex", wrapperClassName)}>
			<select
				ref={ref}
				className={cn(
					"w-full cursor-pointer appearance-none rounded-md border",
					"border-hairline-strong bg-surface font-medium text-ink",
					"transition-[border-color,box-shadow] hover:border-ink-subtle/60",
					"focus-visible:border-brand focus-visible:outline-none",
					"focus-visible:ring-4 focus-visible:ring-brand/12",
					"disabled:cursor-not-allowed disabled:opacity-50",
					SELECT_SIZE_CLASS[size],
					className,
				)}
				{...props}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<ChevronDown
				className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink-subtle"
				aria-hidden
			/>
		</div>
	),
)
Select.displayName = "Select"
