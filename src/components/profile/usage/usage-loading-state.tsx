import { DASHBOARD_THEME } from "@/lib/dashboard-theme";
import { USAGE_COPY } from "@/lib/usage-copy";
import { Loader2 } from "lucide-react";

export function UsageLoadingState() {
    return (
        <div
            className="flex flex-col items-center justify-center gap-3 py-16"
            aria-busy="true"
        >
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
            <p className={DASHBOARD_THEME.muted}>{USAGE_COPY.loading}</p>
        </div>
    )
}