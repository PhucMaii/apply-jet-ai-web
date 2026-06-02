import { type KeyboardEvent, useMemo, useState } from "react"
import { Plus, Trash2, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardHeader,
	CardDescription,
	CardTitle,
} from "@/components/ui/card"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import { Input } from "@/components/ui/input"
import type { UserSkillRow } from "@/types/database"
import { cn } from "@/lib/utils"
import type { AsyncResultMsg } from "@/types/types"
import { toast } from "react-hot-toast"

interface SkillsEditorProps {
	items: UserSkillRow[]
	onAddSkill: (name: string) => Promise<AsyncResultMsg>
	onDeleteSkill: (skillId: string) => Promise<AsyncResultMsg>
}

export function SkillsEditor({
	items,
	onAddSkill,
	onDeleteSkill,
}: SkillsEditorProps) {
	const [draftSkill, setDraftSkill] = useState("")

	const hasSkills = items.length > 0
	const normalizedNames = useMemo(
		() => new Set(items.map((item) => item.name.trim().toLowerCase())),
		[items],
	)

	const handleRemove = async (index: number) => {
		const result = await onDeleteSkill(items[index].id)
		if (result.success) {
			toast.success(result.message)
		} else {
			toast.error(result.message)
		}
	}

	const handleCreateSkill = async () => {
		const nextSkill = draftSkill.trim()
		if (!nextSkill) return
		if (normalizedNames.has(nextSkill.toLowerCase())) {
			setDraftSkill("")
			return
		}
		const result = await onAddSkill(nextSkill)
		if (result.success) {
			toast.success(result.message)
		} else {
			toast.error(result.message)
		}
		setDraftSkill("")
	}

	const handleSkillInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== "Enter") return
		e.preventDefault()
		handleCreateSkill()
	}

	return (
		<Card variant="solid" className={DASHBOARD_THEME.card}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 font-display">
					<Wrench className={PROFILE_SURFACE.sectionIcon} aria-hidden />
					Skills
				</CardTitle>
				<CardDescription>
					Quickly review and manage all skills in one compact view.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div
					className={cn(
						"rounded-xl border border-neutral-200 bg-neutral-50 p-3",
						"min-h-20",
					)}
				>
					{hasSkills ? (
						<div className="flex flex-wrap gap-2">
							{items.map((row, index) => (
								<div
									key={`${row.id}-${index}`}
									className={cn(
										"inline-flex items-center gap-1.5 rounded-lg",
										PROFILE_SURFACE.skillChip,
									)}
								>
									<span className="text-sm text-neutral-900">{row.name}</span>
									<button
										type="button"
										className={cn(
											"rounded p-0.5 text-neutral-500 transition",
											"hover:bg-red-50 hover:text-red-600",
										)}
										onClick={() => handleRemove(index)}
										aria-label={`Remove ${row.name}`}
									>
										<Trash2 className="size-3.5" aria-hidden />
									</button>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-neutral-500">
							No skills added yet.
						</p>
					)}
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Input
						placeholder="Add a skill and press Enter"
						value={draftSkill}
						onChange={(e) => setDraftSkill(e.target.value)}
						onKeyDown={handleSkillInputKeyDown}
						className="h-9 w-full sm:max-w-xs"
					/>
					<Button
						type="button"
						variant="secondary"
						className="h-9 gap-2"
						onClick={handleCreateSkill}
						disabled={draftSkill.trim().length === 0}
					>
						<Plus className="size-4" aria-hidden />
						Add
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}

