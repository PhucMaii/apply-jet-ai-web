import type { LucideIcon } from "lucide-react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ProfileNavItem {
	key: string
	label: string
	Icon: LucideIcon
	isDone?: boolean
}

export interface ProfileNavGroup {
	key: string
	label: string
	items: readonly ProfileNavItem[]
}

interface ProfileSectionNavProps {
	groups: readonly ProfileNavGroup[]
	activeKey: string
	onSelect: (key: string) => void
}

const NAV_LABEL = "Profile sections" as const

export function ProfileSectionNav({ groups, activeKey, onSelect }: ProfileSectionNavProps) {
	const allItems = groups.flatMap((group) => group.items)

	return (
		<nav aria-label={NAV_LABEL}>
			<ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 thin-scrollbar lg:hidden">
				{allItems.map((item) => {
					const isActive = item.key === activeKey
					return (
						<li key={item.key} className="shrink-0">
							<button
								type="button"
								aria-current={isActive ? "page" : undefined}
								onClick={() => onSelect(item.key)}
								className={cn(
									"inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
									isActive
										? "border-brand bg-brand-soft text-brand-ink"
										: "border-hairline bg-surface text-ink-muted hover:text-ink",
								)}
							>
								{item.label}
								{item.isDone ? (
									<Check className="size-3.5 text-emerald-600" aria-label="complete" />
								) : null}
							</button>
						</li>
					)
				})}
			</ul>

			<div className="hidden space-y-6 lg:block">
				{groups.map((group) => (
					<div key={group.key}>
						<p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
							{group.label}
						</p>
						<ul className="space-y-0.5">
							{group.items.map((item) => {
								const isActive = item.key === activeKey
								const Icon = item.Icon
								return (
									<li key={item.key}>
										<button
											type="button"
											aria-current={isActive ? "page" : undefined}
											onClick={() => onSelect(item.key)}
											className={cn(
												"flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium transition-colors",
												"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
												isActive
													? "bg-brand-soft text-brand-ink"
													: "text-ink-muted hover:bg-surface-sunken hover:text-ink",
											)}
										>
											<Icon
												className={cn("size-4 shrink-0", isActive ? "text-brand" : "text-ink-subtle")}
												aria-hidden
											/>
											<span className="min-w-0 flex-1 truncate">{item.label}</span>
											{item.isDone ? (
												<Check className="size-3.5 shrink-0 text-emerald-600" aria-label="complete" />
											) : null}
										</button>
									</li>
								)
							})}
						</ul>
					</div>
				))}
			</div>
		</nav>
	)
}
