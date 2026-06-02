import Modal from './modal'
import { Button } from './button'
import { CheckIcon, Loader2Icon, XIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<any>
    title: string
    message: string
    successMessage?: string
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, successMessage }: ConfirmModalProps) {
    const [isConfirming, setIsConfirming] = useState(false)
    const handleConfirm = async () => {
        setIsConfirming(true)
        try {
            await onConfirm()
            toast.success(successMessage ?? "Confirmed successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to confirm")
        }
        setIsConfirming(false)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div>
                <h1 className="text-lg font-bold">{title}</h1>
                <p className="text-sm text-gray-800">{message}</p>

                <div className="flex mt-4 gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        <XIcon className="size-4" aria-hidden />
                        Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleConfirm}>
                        {isConfirming ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : <CheckIcon className="size-4" aria-hidden />}
                        Confirm
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
