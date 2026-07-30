import { Trash2 } from "lucide-react"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import { cn } from "@/lib/utils"

interface SkillChipProps {
	name: string
	onRemove: () => void
	disabled?: boolean
}

export function SkillChip({ name, onRemove, disabled = false }: SkillChipProps) {
	return (
		<div
			className={cn(
				"inline-flex max-w-full items-center gap-1.5 rounded-lg",
				PROFILE_SURFACE.skillChip,
			)}
		>
			<span className="truncate text-sm text-neutral-900">{name}</span>
			<button
				type="button"
				className={cn(
					"shrink-0 rounded p-0.5 text-neutral-500 transition",
					"hover:bg-red-50 hover:text-red-600",
					"disabled:pointer-events-none disabled:opacity-50",
				)}
				onClick={onRemove}
				disabled={disabled}
				aria-label={`Remove ${name}`}
			>
				<Trash2 className="size-3.5" aria-hidden />
			</button>
		</div>
	)
}
