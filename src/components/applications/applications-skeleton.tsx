import { Skeleton } from "@/components/ui/skeleton"
import { APPLICATIONS_COPY } from "@/lib/applications-copy"

const SKELETON_ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5"] as const

export function ApplicationsSkeleton() {
	return (
		<div
			className="overflow-hidden rounded-xl border border-hairline bg-surface"
			role="status"
			aria-busy="true"
			aria-label={APPLICATIONS_COPY.loading}
		>
			<div className="h-11 border-b border-hairline bg-surface-sunken/50" />
			<ul className="divide-y divide-hairline">
				{SKELETON_ROWS.map((key) => (
					<li key={key} className="flex items-center gap-4 px-4 py-3.5">
						<Skeleton className="size-9 rounded-md" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-3.5 w-48 max-w-[60%]" />
							<Skeleton className="h-3 w-28 max-w-[40%]" />
						</div>
						<Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
						<Skeleton className="hidden size-9 rounded-full md:block" />
						<Skeleton className="hidden h-3 w-16 md:block" />
					</li>
				))}
			</ul>
		</div>
	)
}
