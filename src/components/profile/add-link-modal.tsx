import { useEffect } from 'react'
import Modal from '../ui/modal'
import LinkForm from './link-form'
import Divider from '../ui/divider'
import { useForm } from 'react-hook-form'
import type { UserLinkRow } from '@/types/database'
import { Button } from '../ui/button'
import { CheckIcon, Loader2Icon, XIcon } from 'lucide-react'
import type { AsyncResultMsg } from '@/types/types'
import { toast } from 'react-hot-toast'

interface AddLinkModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (data: UserLinkRow) => Promise<AsyncResultMsg>
}

export default function AddLinkModal({
    isOpen,
    onClose,
    onAdd,
}: AddLinkModalProps) {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<UserLinkRow>({
        defaultValues: { url: "", link_type: "" },
        mode: "onTouched",
    })

    useEffect(() => {
        if (isOpen) {
            reset({ url: "", link_type: "" })
        }
    }, [reset, isOpen])

    const handleValidSubmit = async (data: UserLinkRow) => {
        const result = await onAdd(data)
        if (result.success) {
            toast.success(result.message)
            reset({ url: "", link_type: "" })
            onClose()
            return
        }
        toast.error(result.message)
    }

    const handleInvalidSubmit = () => {
        toast.error("Please fill in all required fields")
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="font-bold text-lg">Add link</h3>
            <Divider />
            <form
                className="flex flex-col gap-4"
                noValidate
                onSubmit={handleSubmit(handleValidSubmit, handleInvalidSubmit)}
            >
                <LinkForm register={register} />
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
