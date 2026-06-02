import type { UserLinkRow } from '@/types/database'
import { PROFILE_SURFACE } from '@/lib/profile-surface'
import { cn, stableFormSnapshot } from '@/lib/utils'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import type { AsyncResultMsg } from '@/types/types'
import { debounce } from 'lodash'
import LinkForm from './link-form'
import ConfirmModal from '../ui/confirm-modal'

export default function LinkAdditionalRow({
    row,
    index,
    onDeleteLink,
    onSave,
}: {
    row: UserLinkRow
    index: number
    onDeleteLink: (linkId: string) => void
    onSave: (data: UserLinkRow) => Promise<AsyncResultMsg>
}) {
    const [isOpenConfirmRemove, setIsOpenConfirmRemove] = useState(false)
    
    const isHydratedRef = useRef(false)

    const { control, register, handleSubmit, formState: { isDirty } } = useForm<UserLinkRow>({
        defaultValues: row,
        mode: "onTouched",
    })

    useEffect(() => {
        if (!isHydratedRef.current) {
            const id = setTimeout(() => {
                isHydratedRef.current = true
            }, 0)
            return () => clearTimeout(id)
        }
    }, [row, isDirty])

    const watchedValues = useWatch({ control })
    const lastSavedSnapshot = useRef<string>("")
    const isSavingRef = useRef(false)

    const runSave = useCallback(async () => {
        if (isSavingRef.current) {
            return
        }
        isSavingRef.current = true

        try {
            await handleSubmit(async (data) => {
                const snapshot = stableFormSnapshot(data)
                await onSave(data)
                toast.success("Link saved")
                lastSavedSnapshot.current = snapshot
            })()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save link")
        } finally {
            isSavingRef.current = false
        }
    }, [handleSubmit, onSave])

    const debouncedSave = useMemo(() => {
        return debounce(() => {
            void runSave()
        }, 1000)
    }, [runSave])

    useEffect(() => {
        return () => {
            debouncedSave.flush()
            debouncedSave.cancel()
        }
    }, [debouncedSave])

    useEffect(() => {
        if (!isDirty || !isHydratedRef.current) {
            lastSavedSnapshot.current = ""
            return
        }

        const snapshot = stableFormSnapshot(watchedValues)
        if (snapshot === lastSavedSnapshot.current) {
            return
        }
        debouncedSave()
    }, [debouncedSave, watchedValues, isDirty])

    const handleDeleteLink = async () => {
        await onDeleteLink(row.id)
        setIsOpenConfirmRemove(false)
    }

    return (
        <div
            key={`${row.id}-${index}`}
            className={cn(
                "grid gap-4 sm:grid-cols-[1fr_180px_auto]",
                PROFILE_SURFACE.itemPanel,
            )}
        >
            <LinkForm register={register} />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setIsOpenConfirmRemove(true)}
            >
                <Trash2 className="size-4" aria-hidden />
                <span className="sr-only">Remove link</span>
            </Button>

            <ConfirmModal 
                isOpen={isOpenConfirmRemove}
                onClose={() => setIsOpenConfirmRemove(false)}
                onConfirm={handleDeleteLink}
                title="Remove link"
                message="Are you sure you want to remove this link? This action cannot be undone."
                successMessage="Link removed successfully"
            />
        </div>
    )
}
