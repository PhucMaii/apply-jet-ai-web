import { cn } from "@/lib/utils"
import type { UsageMetricKey, UsageMetricView } from "@/types/user-usage"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { FileText, InfinityIcon, ScanText, type LucideIcon, MessageSquareText, Mail } from "lucide-react"
import { USAGE_COPY } from "@/lib/usage-copy"

const USAGE_METRIC_ICONS: Record<UsageMetricKey, LucideIcon> = {
    resumeGenerations: FileText,
    coverLetters: Mail,
    extractText: ScanText,
    applicationAnswers: MessageSquareText,
}

const USAGE_STATUS_THEME = {
    ok: {
        bar: "bg-primary",
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    warning: {
        bar: "bg-amber-500",
        badge: "border-amber-200 bg-amber-50 text-amber-800",
    },
    exhausted: {
        bar: "bg-red-500",
        badge: "border-red-200 bg-red-50 text-red-700",
    },
} as const

export function UsageMetricCard({ metric }: { metric: UsageMetricView }) {
    const Icon = USAGE_METRIC_ICONS[metric.key]
    const statusTheme = USAGE_STATUS_THEME[metric.status]

    return (
        <article
            className={cn(
                "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm",
                "transition-shadow hover:shadow-md",
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span
                        className={cn(
                            "flex size-10 shrink-0 items-center justify-center",
                            DASHBOARD_THEME.cardIconWrap,
                        )}
                    >
                        <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                        <h3 className="font-medium text-neutral-900">{metric.label}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                            {metric.description}
                        </p>
                    </div>
                </div>
                {metric.isUnlimited ? (
                    <span
                        className={cn(
                            "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5",
                            "text-xs font-semibold text-emerald-700",
                            "border-emerald-200 bg-emerald-50",
                        )}
                    >
                        <InfinityIcon className="size-3.5" aria-hidden />
                        {USAGE_COPY.unlimited}
                    </span>
                ) : (
                    <span
                        className={cn(
                            "inline-flex shrink-0 rounded-full border px-2 py-0.5",
                            "text-xs font-semibold",
                            statusTheme.badge,
                        )}
                    >
                        {metric.remaining} {USAGE_COPY.remaining}
                    </span>
                )}
            </div>

            <div className="mt-4 space-y-2">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-semibold text-neutral-900">
                        {metric.used} used
                    </span>
                    {metric.isUnlimited ? null : (
                        <span className="text-neutral-500">
                            of {metric.limit}
                        </span>
                    )}
                </div>

                {metric.isUnlimited ? (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-800">
                        <InfinityIcon className="size-4 shrink-0" aria-hidden />
                        No limit on your Pro plan
                    </div>
                ) : (
                    <div
                        className="h-2 overflow-hidden rounded-full bg-neutral-100"
                        role="progressbar"
                        aria-valuenow={metric.percentUsed ?? 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${metric.label} usage`}
                    >
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-300",
                                statusTheme.bar,
                            )}
                            style={{ width: `${metric.percentUsed ?? 0}%` }}
                        />
                    </div>
                )}
            </div>
        </article>
    )
}