/* eslint-disable react-refresh/only-export-components -- thin Radix wrappers */
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu"
import { Check } from "lucide-react"
import {
	forwardRef,
	type ComponentPropsWithoutRef,
	type ElementRef,
} from "react"
import { cn } from "@/lib/utils"

export const DropdownMenu = DropdownPrimitive.Root
export const DropdownMenuTrigger = DropdownPrimitive.Trigger
export const DropdownMenuRadioGroup = DropdownPrimitive.RadioGroup

const MENU_ITEM_CLASS = cn(
	"relative flex min-h-9 cursor-pointer select-none items-center gap-2.5",
	"rounded-md px-2.5 text-sm text-ink outline-none",
	"transition-colors data-[highlighted]:bg-surface-sunken",
	"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
	"[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-ink-subtle",
)

export const DropdownMenuContent = forwardRef<
	ElementRef<typeof DropdownPrimitive.Content>,
	ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(({ className, sideOffset = 6, align = "start", ...props }, ref) => (
	<DropdownPrimitive.Portal>
		<DropdownPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			align={align}
			className={cn(
				"z-50 min-w-[11rem] overflow-hidden rounded-lg border border-hairline",
				"bg-surface p-1 shadow-pop",
				className,
			)}
			{...props}
		/>
	</DropdownPrimitive.Portal>
))
DropdownMenuContent.displayName = "DropdownMenuContent"

export const DropdownMenuItem = forwardRef<
	ElementRef<typeof DropdownPrimitive.Item>,
	ComponentPropsWithoutRef<typeof DropdownPrimitive.Item> & {
		isDestructive?: boolean
	}
>(({ className, isDestructive = false, ...props }, ref) => (
	<DropdownPrimitive.Item
		ref={ref}
		className={cn(
			MENU_ITEM_CLASS,
			isDestructive &&
				"text-rose-700 data-[highlighted]:bg-rose-50 [&_svg]:text-rose-600",
			className,
		)}
		{...props}
	/>
))
DropdownMenuItem.displayName = "DropdownMenuItem"

export const DropdownMenuRadioItem = forwardRef<
	ElementRef<typeof DropdownPrimitive.RadioItem>,
	ComponentPropsWithoutRef<typeof DropdownPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
	<DropdownPrimitive.RadioItem
		ref={ref}
		className={cn(MENU_ITEM_CLASS, "pr-8", className)}
		{...props}
	>
		{children}
		<DropdownPrimitive.ItemIndicator className="absolute right-2.5">
			<Check className="text-brand" aria-hidden />
		</DropdownPrimitive.ItemIndicator>
	</DropdownPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

export const DropdownMenuLabel = forwardRef<
	ElementRef<typeof DropdownPrimitive.Label>,
	ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>
>(({ className, ...props }, ref) => (
	<DropdownPrimitive.Label
		ref={ref}
		className={cn(
			"px-2.5 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle",
			className,
		)}
		{...props}
	/>
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

export const DropdownMenuSeparator = forwardRef<
	ElementRef<typeof DropdownPrimitive.Separator>,
	ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<DropdownPrimitive.Separator
		ref={ref}
		className={cn("-mx-1 my-1 h-px bg-hairline", className)}
		{...props}
	/>
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"
