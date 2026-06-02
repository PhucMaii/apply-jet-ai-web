import type { UserWorkExperienceRow } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Trash2, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROFILE_SURFACE } from '@/lib/profile-surface'
import toast from 'react-hot-toast'
import type { AsyncResultMsg } from '@/types/types'
import WorkExperienceForm from './work-experience-form'
import { useForm } from 'react-hook-form'
import ConfirmModal from '../ui/confirm-modal'
import { useState } from 'react'

export function WorkExperienceRowEditor({
    row,
    onRemove,
    onSave,
}: {
    row: UserWorkExperienceRow
    index: number
    onRemove: (experienceId: string) => Promise<AsyncResultMsg>
    onSave: (experienceId: string, patch: Partial<UserWorkExperienceRow>) => Promise<AsyncResultMsg>
}) {
    const [isOpenConfirmRemove, setIsOpenConfirmRemove] = useState(false)

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<UserWorkExperienceRow>({
        defaultValues: row,
        mode: "onTouched",
    })

    const handleValidSave = async (data: UserWorkExperienceRow) => {
        const result = await onSave(row.id, data)
        if (result.success) {
            toast.success(result.message)
            return
        }
        toast.error(result.message)
    }

    const handleInvalidSave = () => {
        toast.error("Please fill in all required fields")
    }

    const handleSave = () => {
        void handleSubmit(handleValidSave, handleInvalidSave)()
    }

    return (
        <div className={cn("space-y-4", PROFILE_SURFACE.itemPanel)}>
            <WorkExperienceForm
                register={register}
                watch={watch}
                errors={errors}
            />

            <div className="flex gap-2 items-center justify-end">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "gap-2 text-destructive hover:text-destructive",
                    )}
                    onClick={() => setIsOpenConfirmRemove(true)}
                >
                    <Trash2 className="size-4" aria-hidden />
                    Remove
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={handleSave}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
                    Save
                </Button>
            </div>

            <ConfirmModal 
                isOpen={isOpenConfirmRemove} 
                onClose={() => setIsOpenConfirmRemove(false)} 
                onConfirm={() => onRemove(row.id)} 
                title="Remove work experience" 
                message="Are you sure you want to remove this work experience? This action cannot be undone." 
                successMessage="Work experience removed successfully"
            />
        </div>
    )
}
