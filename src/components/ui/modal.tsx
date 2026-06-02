import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { X } from 'lucide-react'
import React from 'react'

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
                    <button onClick={onClose} className="absolute top-4 right-4 hover:text-neutral-500">
                        <X className="size-4" aria-hidden />
                    </button>
                    <div className="flex flex-col gap-4 p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
