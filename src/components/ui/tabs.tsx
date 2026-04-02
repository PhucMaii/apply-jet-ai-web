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
			"inline-flex h-11 items-center justify-center gap-1 rounded-lg bg-muted/50 p-1 text-muted-foreground",
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
			"inline-flex min-w-[5.5rem] items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all",
			"data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
			"mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
			className,
		)}
		{...props}
	/>
))
TabsContent.displayName = TabsPrimitive.Content.displayName
