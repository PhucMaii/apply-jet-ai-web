import { Skeleton } from "@/components/ui/skeleton"

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5] as const

export function JobsListSkeleton() {
	return (
		<ul className="divide-y divide-hairline" aria-hidden>
			{SKELETON_ROWS.map((row) => (
				<li key={row} className="flex gap-3 px-4 py-3.5">
					<Skeleton className="size-9 shrink-0 rounded-md" />
					<div className="min-w-0 flex-1 space-y-2 pt-0.5">
						<Skeleton className="h-4 w-4/5" />
						<Skeleton className="h-3.5 w-1/2" />
						<Skeleton className="h-3 w-2/3" />
					</div>
				</li>
			))}
		</ul>
	)
}

export function JobDetailSkeleton() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-5 sm:p-6" aria-hidden>
			<div className="flex gap-3">
				<Skeleton className="size-11 shrink-0 rounded-md" />
				<div className="flex-1 space-y-2 pt-1">
					<Skeleton className="h-6 w-3/5" />
					<Skeleton className="h-4 w-2/5" />
					<Skeleton className="h-3.5 w-1/2" />
				</div>
			</div>
			<div className="flex gap-2">
				<Skeleton className="h-9 w-32 rounded-lg" />
				<Skeleton className="h-9 w-24 rounded-lg" />
			</div>
			<div className="space-y-2 pt-2">
				<Skeleton className="h-3.5 w-full" />
				<Skeleton className="h-3.5 w-full" />
				<Skeleton className="h-3.5 w-4/5" />
				<Skeleton className="h-3.5 w-11/12" />
			</div>
		</div>
	)
}
