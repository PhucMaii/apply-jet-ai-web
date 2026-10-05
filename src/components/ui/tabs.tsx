/* eslint-disable react-refresh/only-export-components -- thin Radix wrappers */
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { forwardRef, type ElementRef, type ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<
	ElementRef<typeof TabsPrimitive.List>,
	ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn(
			"inline-flex h-10 items-center justify-center gap-1 rounded-lg bg-surface-sunken p-1 text-ink-muted",
			className,
		)}
		{...props}
	/>
))
TabsList.displayName = TabsPrimitive.List.displayName

export const TabsTrigger = forwardRef<
	ElementRef<typeof TabsPrimitive.Trigger>,
	ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			"inline-flex min-w-[5.5rem] items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
			"hover:text-ink",
			"data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-card",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
			className,
		)}
		{...props}
	/>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

export const TabsContent = forwardRef<
	ElementRef<typeof TabsPrimitive.Content>,
	ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			"mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
			className,
		)}
		{...props}
	/>
))
TabsContent.displayName = TabsPrimitive.Content.displayName
