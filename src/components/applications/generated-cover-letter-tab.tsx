import { downloadFromUrl, downloadTextContent, invokeGenerateCoverLetter } from '@/lib/application-generation'
import { COVER_LETTER_TONE_META, COVER_LETTER_TONES, type CoverLetterTone } from '@/lib/cover-letter-tone'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/auth-context'
import type { ApplicationDetailForm, GeneratedDocumentRow } from '@/types/application-detail'
import { useGeneratedCoverLetter } from '../../../hooks/useGeneratedCoverLetter'
import { Label } from '@radix-ui/react-label'
import { PROFILE_SURFACE } from '@/lib/profile-surface'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Loader2, Sparkles } from 'lucide-react'
import { GeneratedDocumentPreview } from './document-preview'
import { EmptyDocumentHint } from './empty-document'

interface GeneratedCoverLetterTabProps {
    form: ApplicationDetailForm
    generatedCoverLetter: GeneratedDocumentRow | null
    refetchApplication: () => void
    resumeText: string
}
function GeneratedCoverLetterTab({ 
    form,
    generatedCoverLetter,
    refetchApplication,
    resumeText,
}: GeneratedCoverLetterTabProps) {
    const { user } = useAuth()
    const { getCoverLetterDownloadUrl } = useGeneratedCoverLetter()

    const [tone, setTone] = useState<CoverLetterTone>("Professional")
    const [coverCompany, setCoverCompany] = useState(form.companyName)
    const [coverJobTitle, setCoverJobTitle] = useState(form.jobTitle)
    const [hiringManager, setHiringManager] = useState("")
    const [generatingCover, setGeneratingCover] = useState(false)
    const [downloadingCover, setDownloadingCover] = useState(false)

    async function handleGenerateCoverLetter() {
        if (!user) return
        setGeneratingCover(true)
        try {
            await invokeGenerateCoverLetter({
                resumeText: resumeText ?? "",
                jdText: form.jobDescription.trim(),
                userId: user.id,
                jobUrl: form.jobUrl,
                companyName: coverCompany.trim(),
                roleTitle: coverJobTitle.trim(),
                hiringManager: hiringManager.trim() ?? undefined,
                tone: tone,
                applicationId: form.id,
            })
            toast.success("Cover letter generated successfully")
            await refetchApplication()
        } catch (err) {
            console.error("Something went wrong generating cover letter:", err)
        } finally {
            setGeneratingCover(false)
        }
    }


    async function handleDownloadCover() {
        if (!generatedCoverLetter) return
        setDownloadingCover(true)
        try {
            if (generatedCoverLetter.file_url) {
                const filename = `${form.companyName}-cover-letter.pdf`
                const url = await getCoverLetterDownloadUrl(generatedCoverLetter.id, filename)
                await downloadFromUrl(url, filename)
                return
            }
            downloadTextContent(
                generatedCoverLetter.content,
                `${form.companyName}-cover-letter.txt`,
            )
        } catch (err) {
            console.error("Something went wrong downloading cover letter:", err)
            if (generatedCoverLetter.content) {
                downloadTextContent(
                    generatedCoverLetter.content,
                    `${form.companyName}-cover-letter.txt`,
                )
            } else {
                toast.error(
                    err instanceof Error ? err.message : "Download failed.",
                )
            }
        } finally {
            setDownloadingCover(false)
        }
    }

    return (
        <>
            <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-neutral-900">
                    Tone
                </legend>
                <div className="grid gap-3 sm:grid-cols-3">
                    {COVER_LETTER_TONES.map((option: CoverLetterTone) => {
                        const selected = tone === option
                        return (
                            <label
                                key={option}
                                className={cn(
                                    "cursor-pointer rounded-xl border p-4 transition-colors",
                                    selected
                                        ? "border-primary bg-primary/5 ring-1 ring-primary/25"
                                        : "border-neutral-200 bg-white hover:border-primary/30",
                                )}
                            >
                                <input
                                    type="radio"
                                    name="cover-tone"
                                    value={option}
                                    checked={selected}
                                    className="sr-only"
                                    onChange={() => setTone(option)}
                                />
                                <span className="block text-sm font-semibold text-neutral-900">
                                    {option}
                                </span>
                                <span className="mt-1 block text-xs leading-relaxed text-neutral-500">
                                    {COVER_LETTER_TONE_META[option].description}
                                </span>
                            </label>
                        )
                    })}
                </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label
                        htmlFor="cover-company"
                        className={PROFILE_SURFACE.fieldLabel}
                    >
                        Company name
                    </Label>
                    <Input
                        id="cover-company"
                        value={coverCompany}
                        onChange={(e) => setCoverCompany(e.target.value)}
                        className={PROFILE_SURFACE.fieldInput}
                    />
                </div>
                <div className="space-y-2">
                    <Label
                        htmlFor="cover-job-title"
                        className={PROFILE_SURFACE.fieldLabel}
                    >
                        Job title
                    </Label>
                    <Input
                        id="cover-job-title"
                        value={coverJobTitle}
                        onChange={(e) => setCoverJobTitle(e.target.value)}
                        className={PROFILE_SURFACE.fieldInput}
                    />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <Label
                        htmlFor="cover-hiring-manager"
                        className={PROFILE_SURFACE.fieldLabel}
                    >
                        Hiring manager{" "}
                        <span className="font-normal text-neutral-500">
                            (optional)
                        </span>
                    </Label>
                    <Input
                        id="cover-hiring-manager"
                        placeholder="e.g. Alex Chen"
                        value={hiringManager}
                        onChange={(e) => setHiringManager(e.target.value)}
                        className={PROFILE_SURFACE.fieldInput}
                    />
                </div>
            </div>

            {generatedCoverLetter ? null : <Button
                type="button"
                size="lg"
                className="w-full gap-2 sm:w-auto"
                disabled={generatingCover}
                onClick={() => void handleGenerateCoverLetter()}
            >
                {generatingCover ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                    <Sparkles className="size-4" aria-hidden />
                )}
                Generate cover letter
            </Button>}

            {generatedCoverLetter ? (
                <GeneratedDocumentPreview
                    title="Generated cover letter"
                    content={generatedCoverLetter.content}
                    createdAt={generatedCoverLetter.created_at}
                    downloading={downloadingCover}
                    onDownload={() => void handleDownloadCover()}
                />
            ) : (
                <EmptyDocumentHint label="No cover letter generated yet for this application." />
            )}
        </>
    )
}

export default GeneratedCoverLetterTab