import { type KeyboardEvent, useMemo, useState } from "react"
import { Loader2, Plus, Wrench } from "lucide-react"
import { SkillCategoryCard } from "@/components/profile/skill-category-card"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import {
	SUGGESTED_SKILL_CATEGORIES,
	collectSkillNames,
	groupSkillsByCategory,
} from "@/lib/skill-categories"
import type {
	UserSkillCategoryRow,
	UserSkillRow,
} from "@/types/database"
import type { AsyncResultMsg } from "@/types/types"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

interface SkillsEditorProps {
	categories: UserSkillCategoryRow[]
	skills: UserSkillRow[]
	onAddCategory: (name: string) => Promise<AsyncResultMsg>
	onRenameCategory: (
		categoryId: string,
		name: string,
	) => Promise<AsyncResultMsg>
	onDeleteCategory: (categoryId: string) => Promise<AsyncResultMsg>
	onAddSkill: (
		name: string,
		categoryId: string | null,
	) => Promise<AsyncResultMsg>
	onDeleteSkill: (skillId: string) => Promise<AsyncResultMsg>
}

export function SkillsEditor({
	categories,
	skills,
	onAddCategory,
	onRenameCategory,
	onDeleteCategory,
	onAddSkill,
	onDeleteSkill,
}: SkillsEditorProps) {
	const [draftCategory, setDraftCategory] = useState("")
	const [isAddingCategory, setIsAddingCategory] = useState(false)

	const groups = useMemo(
		() => groupSkillsByCategory(categories, skills),
		[categories, skills],
	)
	const existingSkillNames = useMemo(
		() => collectSkillNames(skills),
		[skills],
	)
	const existingCategoryNames = useMemo(
		() =>
			new Set(
				categories.map((category) => category.name.trim().toLowerCase()),
			),
		[categories],
	)
	const suggestedCategories = useMemo(
		() =>
			SUGGESTED_SKILL_CATEGORIES.filter(
				(name) => !existingCategoryNames.has(name.toLowerCase()),
			),
		[existingCategoryNames],
	)

	const totalSkills = skills.length
	const hasCategories = categories.length > 0

	async function handleAddCategory(name: string) {
		const nextName = name.trim()
		if (!nextName || isAddingCategory) return

		if (existingCategoryNames.has(nextName.toLowerCase())) {
			toast.error("That category already exists.")
			setDraftCategory("")
			return
		}

		setIsAddingCategory(true)
		const result = await onAddCategory(nextName)
		setIsAddingCategory(false)

		if (result.success) {
			toast.success(result.message)
			setDraftCategory("")
			return
		}
		toast.error(result.message)
	}

	function handleCategoryInputKeyDown(
		event: KeyboardEvent<HTMLInputElement>,
	) {
		if (event.key !== "Enter") return
		event.preventDefault()
		void handleAddCategory(draftCategory)
	}

	return (
		<Card variant="solid" className={DASHBOARD_THEME.card}>
			<CardHeader className="space-y-3">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<CardTitle className="flex items-center gap-2 font-display">
							<Wrench className={PROFILE_SURFACE.sectionIcon} aria-hidden />
							Skills
						</CardTitle>
						<CardDescription className="mt-1.5">
							Group skills by category so resumes stay organized and easy to
							scan.
						</CardDescription>
					</div>
					<div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
						{totalSkills} skill{totalSkills === 1 ? "" : "s"} ·{" "}
						{categories.length} categor
						{categories.length === 1 ? "y" : "ies"}
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Input
						placeholder="New category name"
						value={draftCategory}
						onChange={(event) => setDraftCategory(event.target.value)}
						onKeyDown={handleCategoryInputKeyDown}
						className="h-9 w-full sm:max-w-xs"
						disabled={isAddingCategory}
					/>
					<Button
						type="button"
						className="h-9 gap-2"
						onClick={() => void handleAddCategory(draftCategory)}
						disabled={draftCategory.trim().length === 0 || isAddingCategory}
					>
						{isAddingCategory ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : (
							<Plus className="size-4" aria-hidden />
						)}
						Add category
					</Button>
				</div>

				{suggestedCategories.length > 0 ? (
					<div className="space-y-2">
						<p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
							Suggested categories
						</p>
						<div className="flex flex-wrap gap-2">
							{suggestedCategories.map((name) => (
								<button
									key={name}
									type="button"
									disabled={isAddingCategory}
									onClick={() => void handleAddCategory(name)}
									className={cn(
										"rounded-lg border border-dashed border-neutral-300 bg-white px-2.5 py-1.5",
										"text-xs font-medium text-neutral-700 transition",
										"hover:border-primary/40 hover:bg-primary/5 hover:text-neutral-900",
										"disabled:pointer-events-none disabled:opacity-50",
									)}
								>
									+ {name}
								</button>
							))}
						</div>
					</div>
				) : null}
			</CardHeader>

			<CardContent className="space-y-4">
				{!hasCategories && totalSkills === 0 ? (
					<div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center">
						<p className="text-sm font-medium text-neutral-800">
							Start with a category
						</p>
						<p className="mt-1 text-sm text-neutral-500">
							Add something like “Programming Languages”, then drop skills
							under it.
						</p>
					</div>
				) : null}

				{groups.map((group) => (
					<SkillCategoryCard
						key={group.id}
						group={group}
						existingSkillNames={existingSkillNames}
						onRenameCategory={onRenameCategory}
						onDeleteCategory={onDeleteCategory}
						onAddSkill={onAddSkill}
						onDeleteSkill={onDeleteSkill}
					/>
				))}
			</CardContent>
		</Card>
	)
}
