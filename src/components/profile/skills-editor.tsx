import { type Dispatch, type KeyboardEvent, type SetStateAction, useMemo, useState } from "react"
import { Plus, Trash2, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardHeader,
	CardDescription,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { UserSkillRow } from "@/types/database"
import { cn } from "@/lib/utils"

interface SkillsEditorProps {
	items: UserSkillRow[]
	setItems: Dispatch<SetStateAction<UserSkillRow[]>>
	onCreateSkill: (name: string) => void
	onDeleteSkill: (skillId: string) => void
}

export function SkillsEditor({
	items,
	setItems,
	onCreateSkill,
	onDeleteSkill,
}: SkillsEditorProps) {
	const [draftSkill, setDraftSkill] = useState("")

	const hasSkills = items.length > 0
	const normalizedNames = useMemo(
		() => new Set(items.map((item) => item.name.trim().toLowerCase())),
		[items],
	)

	const handleRemove = (index: number) => {
		setItems((prev) => prev.filter((_, entryIndex) => entryIndex !== index))
		onDeleteSkill(items[index].id)
	}

	const handleCreateSkill = () => {
		const nextSkill = draftSkill.trim()
		if (!nextSkill) return
		if (normalizedNames.has(nextSkill.toLowerCase())) {
			setDraftSkill("")
			return
		}
		onCreateSkill(nextSkill)
		setDraftSkill("")
	}

	const handleSkillInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== "Enter") return
		e.preventDefault()
		handleCreateSkill()
	}

	return (
		<Card className="border-border/80 bg-card/40 backdrop-blur-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 font-display">
					<Wrench className="size-4 text-info" aria-hidden />
					Skills
				</CardTitle>
				<CardDescription>
					Quickly review and manage all skills in one compact view.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div
					className={cn(
						"rounded-xl border border-border/60 bg-muted/20 p-3",
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
										"border border-border/70 bg-background/40 px-2.5 py-1.5",
									)}
								>
									<span className="text-sm text-foreground">{row.name}</span>
									{row.is_from_org_resume ? (
										<span
											className="rounded border border-success/35 bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success"
											title="Imported from org resume"
										>
											Org
										</span>
									) : null}
									<button
										type="button"
										className={cn(
											"rounded p-0.5 text-muted-foreground transition",
											"hover:bg-destructive/10 hover:text-destructive",
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
						<p className="text-sm text-muted-foreground">
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

