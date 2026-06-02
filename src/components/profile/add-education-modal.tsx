import { useEffect } from 'react'
import Modal from '../ui/modal'
import EducationForm from './eductation-form'
import type { AsyncResultMsg } from '@/types/types'
import type { UserEducationRow } from '@/types/database'
import { useAuth } from '@/context/auth-context'
import { useForm } from 'react-hook-form'
import { emptyEducation } from '@/lib/profile-defaults'
import toast from 'react-hot-toast'
import Divider from '../ui/divider'
import { CheckIcon, Loader2Icon, XIcon } from 'lucide-react'
import { Button } from '../ui/button'

interface AddEducationModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (newEducation: UserEducationRow) => Promise<AsyncResultMsg>
}

export default function AddEducationModal({
    isOpen,
    onClose,
    onAdd,
}: AddEducationModalProps) {
    const { user } = useAuth()

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserEducationRow>({
        defaultValues: emptyEducation(user?.id ?? ""),
        mode: "onTouched",
    })

    useEffect(() => {
        if (isOpen) {
            reset(emptyEducation(user?.id ?? ""))
        }
    }, [reset, user?.id, isOpen])

    const handleValidSubmit = async (data: UserEducationRow) => {
        const result = await onAdd(data)
        if (result.success) {
            toast.success(result.message)
            reset(emptyEducation(user?.id ?? ""))
            onClose()
        }
    }

    const handleInvalidSubmit = () => {
        toast.error("Please fill in all required fields")
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form
                className="flex flex-col gap-4"
                noValidate
                onSubmit={handleSubmit(handleValidSubmit, handleInvalidSubmit)}
            >
                <h3 className="font-bold text-lg">Add education</h3>
                <Divider />
                <EducationForm
                    register={register}
                    errors={errors}
                />

                <div className="flex items-center justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        <XIcon className="size-4" aria-hidden />
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : <CheckIcon className="size-4" aria-hidden />}
                        Add
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
