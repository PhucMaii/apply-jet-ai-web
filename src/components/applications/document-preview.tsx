import { Download, Loader2 } from "lucide-react"
import { Button } from "../ui/button"

interface GeneratedDocumentPreviewProps {
    title: string
    content: string
    createdAt: string
    downloading: boolean
    onDownload: () => void
}

export function GeneratedDocumentPreview({
    title,
    content,
    createdAt,
    downloading,
    onDownload,
}: GeneratedDocumentPreviewProps) {
    const createdLabel = new Date(createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    })

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-sm font-semibold text-neutral-900">{title}</p>
                    <p className="text-xs text-neutral-500">Created {createdLabel}</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={downloading}
                    onClick={onDownload}
                >
                    {downloading ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                        <Download className="size-4" aria-hidden />
                    )}
                    Download
                </Button>
            </div>
            {content ? (
                <pre className="thin-scrollbar max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-100 bg-neutral-50 p-3 font-sans text-sm leading-relaxed text-neutral-700">
                    {content}
                </pre>
            ) : (
                <p className="text-sm text-neutral-500">
                    Document ready—use download to open the file.
                </p>
            )}
        </div>
    )
}