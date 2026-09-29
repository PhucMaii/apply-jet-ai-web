import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { X } from "lucide-react"

interface ModalProps {
	children: React.ReactNode
	isOpen: boolean
	onClose: () => void
}

export default function Modal({ children, isOpen, onClose }: ModalProps) {
	if (!isOpen) return null

	return (
		<div className={DASHBOARD_THEME.modal}>
			<div className={DASHBOARD_THEME.modalBackdrop} />
			<div className={DASHBOARD_THEME.modalContentWrapper}>
				<div className={DASHBOARD_THEME.modalContent}>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="absolute right-3 top-3 z-20 inline-flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 hover:text-neutral-900"
					>
						<X className="size-4" aria-hidden />
					</button>
					<div className="flex flex-col gap-4 p-6">{children}</div>
				</div>
			</div>
		</div>
	)
}
