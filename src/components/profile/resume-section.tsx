/**
 * Resume section for User Info: shows current resume or upload zone.
 * Uses resumes table (one resume per user). Styled for sidebar dark theme.
 */

import { useCallback, useRef, useState } from "react"
import {
    ExternalLink,
    FileText,
    PenLine,
    RefreshCw,
    Upload
} from "lucide-react"
import { useResume } from "../../../hooks/useResume"
import { getAllowedAccept, isAllowedFile, prefillResume } from "../../../src/lib/resume"
import { toast } from "react-hot-toast"
// import { formatDate } from "../../../src/lib/formatDate"

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
        })
    } catch {
        return ""
    }
}

interface ResumeSectionProps {
    userId: string | null
    refetchProfile: () => Promise<void>
}

export function ResumeSection({ userId, refetchProfile }: ResumeSectionProps) {
    const {
        resume,
        isLoading,
        uploading,
        error,
        uploadResume,
        clearError
    } = useResume(userId ?? undefined)

    const [dragActive, setDragActive] = useState(false)
    const [replaceMode, setReplaceMode] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const handleFile = useCallback(
        (file: File | null) => {
            if (!file) return
            clearError()
            setValidationError(null)
            const check = isAllowedFile(file)
            if (!check.ok) {
                setValidationError(check.error)
                return
            }
            uploadResume(file).then(() => setReplaceMode(false))
            inputRef.current?.form?.reset()
        },
        [uploadResume, clearError]
    )

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setDragActive(false)
            handleFile(e.dataTransfer.files[0] ?? null)
        },
        [handleFile]
    )

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(true)
    }, [])

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
    }, [])

    const openFilePicker = useCallback(() => {
        inputRef.current?.click()
    }, []);

    const handleAutoFill = useCallback(async () => {
        if (!resume || !userId || loading) return
        setLoading(true)
        try {
            await prefillResume(userId)
            await refetchProfile();
            toast.success("Resume auto-filled successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to auto-fill resume")
        } finally {
            setLoading(false)
        }
    }, [userId, resume, loading]);


    if (!userId) return null

    if (isLoading) {
        return (
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-white/10" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
                        <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
                    </div>
                </div>
            </section>
        )
    }

    const showUploadZone = !resume || replaceMode
    const showUploading = uploading

    return (
        <section className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                    <FileText className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-white/95">Resume</h2>
                    <p className="text-xs text-white/50">
                        Used for autofill, ATS resume, and cover letters
                    </p>
                </div>
            </div>

            <div className="p-4">
                {(error || validationError) && (
                    <div
                        className="mb-4 flex items-start justify-between gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                        <span>{error || validationError}</span>
                        <button
                            type="button"
                            onClick={clearError}
                            className="shrink-0 text-red-400 hover:text-red-300">
                            Dismiss
                        </button>
                    </div>
                )}

                {showUploadZone ? (
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        className="block">
                        <input
                            ref={inputRef}
                            type="file"
                            accept={getAllowedAccept()}
                            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                            className="absolute h-0 w-0 opacity-0"
                            aria-label="Choose resume file"
                            disabled={showUploading}
                        />
                        <button
                            type="button"
                            onClick={openFilePicker}
                            disabled={showUploading}
                            className={`w-full rounded-xl border-2 border-dashed px-4 py-8 transition-all duration-200 ${dragActive
                                    ? "border-indigo-400 bg-indigo-500/15"
                                    : "border-white/15 bg-white/[0.02] hover:border-indigo-500/40 hover:bg-indigo-500/10"
                                } ${showUploading ? "pointer-events-none opacity-70" : ""}`}>
                            {showUploading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
                                    <span className="text-sm font-medium text-white/70">
                                        Uploading & parsing…
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-indigo-500/40 bg-indigo-500/10 text-indigo-400">
                                        <Upload className="h-6 w-6" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-sm font-medium text-white/90">
                                        {resume
                                            ? "Drop a new file or click to replace"
                                            : "Drop your resume here or click to upload"}
                                    </span>
                                    <span className="text-xs text-white/50">
                                        PDF or Word (.pdf, .doc, .docx), max 5 MB
                                    </span>
                                </div>
                            )}
                        </button>
                        {resume && replaceMode && (
                            <button
                                type="button"
                                onClick={() => {
                                    setReplaceMode(false)
                                    setValidationError(null)
                                }}
                                className="mt-3 w-full rounded-lg border border-white/15 bg-white/5 py-2 text-xs font-medium text-white/80 hover:bg-white/10">
                                Cancel
                            </button>
                        )}
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 rounded-lg bg-white/5 p-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
                                <FileText className="h-5 w-5 text-indigo-400" strokeWidth={1.5} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white/95">
                                    {resume?.title || "Resume"}
                                </p>
                                <p className="mt-0.5 text-xs text-white/50">
                                    {resume?.updated_at
                                        ? `Updated ${formatDate(resume.updated_at)}`
                                        : "Ready to use"}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {resume?.original_file_url && (
                                <a
                                    href={resume.original_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-600">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    View file
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={() => setReplaceMode(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10">
                                <Upload className="h-3.5 w-3.5" />
                                Replace resume
                            </button>
                        </div>
                    </div>
                )}

                {/* Auto-fill CTA — no-op for now */}
                <div className="mt-4 rounded-xl bg-gradient-to-br from-indigo-500/15 to-indigo-600/10 p-4 ring-1 ring-white/10">
                    <button
                        type="button"
                        onClick={handleAutoFill}
                        disabled={!resume || loading}
                        title={
                            loading
                                ? "Auto-filling resume..."
                                : resume
                                    ? "Auto-fill application forms using your resume"
                                    : "Upload a resume to enable"
                        }
                        aria-label="Auto-fill form from resume"
                        className="flex w-full items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-left transition-all duration-200 hover:border-indigo-400/40 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-indigo-500/30 disabled:hover:bg-indigo-500/10">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/25 text-indigo-400">
                            <PenLine className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-white/95">
                                {loading ? "Auto-filling resume..." : "Auto-fill form from resume"}
                            </span>
                            <span className="mt-0.5 block text-xs text-white/60">
                                {resume
                                    ? "Fill application fields using your saved resume"
                                    : "Upload a resume above to enable"}
                            </span>
                        </div>
                    </button>
                </div>
            </div>
        </section>
    )
}
