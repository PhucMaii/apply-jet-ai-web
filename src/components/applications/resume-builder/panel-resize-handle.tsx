import { useRef, type KeyboardEvent, type PointerEvent } from "react"
import { cn } from "@/lib/utils"

interface PanelResizeHandleProps {
	onResize: (deltaX: number) => void
	className?: string
	label?: string
}

export function PanelResizeHandle({
	onResize,
	className,
	label = "Resize panel",
}: PanelResizeHandleProps) {
	const isDraggingRef = useRef(false)
	const lastXRef = useRef(0)

	function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
		isDraggingRef.current = true
		lastXRef.current = event.clientX
		event.currentTarget.setPointerCapture(event.pointerId)
		document.body.style.cursor = "col-resize"
		document.body.style.userSelect = "none"
	}

	function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
		if (!isDraggingRef.current) return
		const deltaX = event.clientX - lastXRef.current
		lastXRef.current = event.clientX
		if (deltaX !== 0) onResize(deltaX)
	}

	function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
		isDraggingRef.current = false
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId)
		}
		document.body.style.cursor = ""
		document.body.style.userSelect = ""
	}

	function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		const step = event.shiftKey ? 24 : 12
		if (event.key === "ArrowLeft") {
			event.preventDefault()
			onResize(-step)
		}
		if (event.key === "ArrowRight") {
			event.preventDefault()
			onResize(step)
		}
	}

	return (
		<div
			role="separator"
			aria-orientation="vertical"
			aria-label={label}
			tabIndex={0}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerCancel={handlePointerUp}
			onKeyDown={handleKeyDown}
			className={cn(
				"group relative hidden w-1.5 shrink-0 cursor-col-resize bg-neutral-200/90",
				"transition-colors hover:bg-primary/35 focus-visible:bg-primary/35",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
				"xl:block",
				className,
			)}
		>
			<span
				aria-hidden
				className="absolute inset-y-0 -left-1.5 -right-1.5"
			/>
			<span
				aria-hidden
				className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-400/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
			/>
		</div>
	)
}
