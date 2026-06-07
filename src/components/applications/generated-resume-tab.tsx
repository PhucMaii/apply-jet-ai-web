import { useState } from 'react'
import { Button } from '../ui/button'
import { GeneratedDocumentPreview } from './document-preview'
import { toast } from 'react-hot-toast'
import { downloadFromUrl, downloadTextContent, invokeGenerateResume } from '@/lib/application-generation'
import { useAuth } from '@/context/auth-context'
import { useOnboarding } from '@/context/onboarding-context'
import { TOUR_TARGET } from '@/lib/onboarding/selectors'
import { Loader2, Sparkles } from 'lucide-react'
import { EmptyDocumentHint } from './empty-document'
import { useGeneratedResume } from '../../../hooks/useGeneratedResume'
import type { ApplicationDetailForm, GeneratedDocumentRow } from '@/types/application-detail'
import { useProfilePage } from '@/hooks/use-profile-page'
import { isAllowToGenerateResume } from './helpers'

interface GeneratedResumeTabProps {
    generatedResume: GeneratedDocumentRow | null
    resumeText: string
    form: ApplicationDetailForm
    refetchApplication: () => void
}

export default function GeneratedResumeTab({
    generatedResume,
    resumeText,
    form,
    refetchApplication
}: GeneratedResumeTabProps) {
    const { user } = useAuth()
    const { notifyResumeGenerated } = useOnboarding()
    const { getResumeDownloadUrl } = useGeneratedResume()
    const { userProfile } = useProfilePage()

    const [generatingResume, setGeneratingResume] = useState(false)
    const [downloadingResume, setDownloadingResume] = useState(false)

    async function handleGenerateResume() {
        if (!user) return
        if (!isAllowToGenerateResume(userProfile)) {
            toast.error("You need to have at least one education and one work experience or project to generate a resume")
            return
        }
        setGeneratingResume(true)
        try {
            const result = await invokeGenerateResume({
                resumeText: resumeText ?? "",
                jdText: form.jobDescription.trim(),
                targetRole: form.jobTitle,
                userId: user.id,
                jobUrl: form.jobUrl,
                applicationId: form.id,
            })
            if (!result.ok) {
                toast.error(result.message ?? "Something went wrong generating resume")
                return
            }
            if (result.data && "error" in result.data && result.data.error) {
                toast.error(result.data.error ?? "Something went wrong generating resume")
                return
            }
            toast.success("Resume generated successfully")
            notifyResumeGenerated()
            await refetchApplication()
        } catch (err) {
            console.error("Something went wrong generating resume:", err)
            toast.error(err instanceof Error ? err.message : "Resume generation failed.")
        } finally {
            setGeneratingResume(false)
        }
    }

    async function handleDownloadResume() {
        if (!generatedResume) return
        setDownloadingResume(true)
        try {
            if (generatedResume.file_url) {
                const filename = `${form.companyName}-resume.pdf`
                const url = await getResumeDownloadUrl(generatedResume.id, filename)
                await downloadFromUrl(url, filename)
                return
            }
            downloadTextContent(
                generatedResume.content,
                `${form.companyName}-resume.txt`,
            )

            toast.success("Resume downloaded successfully")
        } catch (err) {
            console.error("Something went wrong downloading resume:", err)
            if (generatedResume.content) {
                downloadTextContent(
                    generatedResume.content,
                    `${form.companyName}-resume.txt`,
                )
            } else {
                toast.error(
                    err instanceof Error ? err.message : "Download failed.",
                )
            }
        } finally {
            setDownloadingResume(false)
        }
    }

    return (
        <>
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4">
                <p className="text-sm leading-relaxed text-neutral-600">
                    Generate a tailored resume aligned to this job description.
                    Save application details first so the latest description is
                    used.
                </p>
            </div>

            {!generatedResume ? <Button
                type="button"
                size="lg"
                className="w-full gap-2 sm:w-auto"
                disabled={generatingResume}
                data-tour={TOUR_TARGET.generateResume}
                onClick={() => void handleGenerateResume()}
            >
                {generatingResume ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                    <Sparkles className="size-4" aria-hidden />
                )}
                Generate tailored resume
            </Button> : null}

            {generatedResume ? (
                <GeneratedDocumentPreview
                    title="Generated resume"
                    content={generatedResume.content}
                    createdAt={generatedResume.created_at}
                    downloading={downloadingResume}
                    onDownload={() => void handleDownloadResume()}
                />
            ) : (
                <EmptyDocumentHint label="No resume generated yet for this application." />
            )}
        </>
    )
}
