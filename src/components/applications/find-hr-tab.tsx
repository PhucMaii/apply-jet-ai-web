import React, { useState } from 'react'
import { SUBTITLE_RECRUITER_EMAILS } from './constant'
import { Button } from '../ui/button'
import { invokeFindHRContacts } from '@/lib/application-generation'
import { useAuth } from '@/context/auth-context'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { UserSearch } from 'lucide-react'
import { RecruiterEmailsList } from './recruiter-emails-list'
import type { ApplicationDetailForm, RecruiterEmail } from '@/types/application-detail'

interface FindHRTabProps {
    recruiterEmails: RecruiterEmail[]
    form: ApplicationDetailForm
    refetchApplication: () => void
}

export default function FindHRTab({
    recruiterEmails,
    form,
    refetchApplication
}: FindHRTabProps) {
    const { user } = useAuth()
    const [findingHRContacts, setFindingHRContacts] = useState(false)

    async function handleFindHRContacts() {
        if (!user || !form) return
        setFindingHRContacts(true)
        try {
            const result = await invokeFindHRContacts({
                userId: user.id,
                companyName: form.companyName.trim(),
                applicationId: form.id.trim(),
                jobTitle: form.jobTitle.trim(),
                jobUrl: form.jobUrl,
                jobDescription: form.jobDescription.trim(),
            })
            if (!result.ok) {
                toast.error(result.msg)
                return
            }

            await refetchApplication()
            toast.success(result.msg)
        } catch (err) {
            console.error("Something went wrong finding HR contacts:", err)
            toast.error(
                err instanceof Error
                    ? err.message
                    : "HR contacts finding failed.",
            )
        } finally {
            setFindingHRContacts(false)
        }
    }
    return (
        <>
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4">
                <div className="flex gap-2 items-center">
                    {SUBTITLE_RECRUITER_EMAILS[recruiterEmails.length === 0 ? "false" : "true"].icon as React.ReactNode}
                    <p className="text-sm font-semibold text-neutral-900">
                        {SUBTITLE_RECRUITER_EMAILS[recruiterEmails.length === 0 ? "false" : "true"].title}
                    </p>

                </div>
                <p className="text-sm leading-relaxed text-neutral-600">
                    {SUBTITLE_RECRUITER_EMAILS[recruiterEmails.length === 0 ? "false" : "true"].description}
                </p>
            </div>

            {recruiterEmails.length === 0 ? (
                <Button
                    type="button"
                    size="lg"
                    className="w-full gap-2 sm:w-auto"
                    disabled={findingHRContacts}
                    onClick={() => void handleFindHRContacts()}
                >
                    {findingHRContacts ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                        <UserSearch className="size-4" aria-hidden />
                    )}
                    Find HR contacts
                </Button>
            ) : null}

            <RecruiterEmailsList emails={recruiterEmails} />
        </>
    )
}
