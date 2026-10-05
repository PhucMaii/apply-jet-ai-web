import { useEffect, useRef, type ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
	children: ReactNode
	isOpen: boolean
	onClose: () => void
	/** Accessible name — pass the id of the heading inside the modal. */
	labelledBy?: string
	size?: "md" | "lg"
}

const MODAL_SIZE_CLASS = {
	md: "sm:max-w-lg",
	lg: "sm:max-w-xl",
} as const

export default function Modal({
	children,
	isOpen,
	onClose,
	labelledBy,
	size = "md",
}: ModalProps) {
	const panelRef = useRef<HTMLDivElement>(null)
	const onCloseRef = useRef(onClose)

	useEffect(() => {
		onCloseRef.current = onClose
	}, [onClose])

	useEffect(() => {
		if (!isOpen) return

		const previouslyFocused = document.activeElement as HTMLElement | null
		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = "hidden"

		const firstField = panelRef.current?.querySelector<HTMLElement>(
			"input, textarea, select, [data-autofocus]",
		)
		;(firstField ?? panelRef.current)?.focus()

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onCloseRef.current()
		}
		window.addEventListener("keydown", handleKeyDown)

		return () => {
			window.removeEventListener("keydown", handleKeyDown)
			document.body.style.overflow = previousOverflow
			previouslyFocused?.focus()
		}
	}, [isOpen])

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div
				className="fixed inset-0 bg-ink/50 backdrop-blur-[2px]"
				onClick={onClose}
				aria-hidden
			/>
			<div className="pointer-events-none flex min-h-full items-end justify-center p-0 sm:items-center sm:p-6">
				<div
					ref={panelRef}
					role="dialog"
					aria-modal="true"
					aria-labelledby={labelledBy}
					tabIndex={-1}
					className={cn(
						"pointer-events-auto relative w-full overflow-hidden bg-surface text-left text-ink shadow-pop focus:outline-none",
						"rounded-t-2xl sm:rounded-xl",
						MODAL_SIZE_CLASS[size],
					)}
				>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="absolute top-3 right-3 z-20 inline-flex size-8 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
					>
						<X className="size-4" aria-hidden />
					</button>
					<div className="flex flex-col gap-4 p-6">{children}</div>
				</div>
			</div>
		</div>
	)
}
