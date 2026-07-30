import {
	type KeyboardEvent,
	useState,
} from "react"
import {
	Check,
	Loader2,
	Pencil,
	Plus,
	Trash2,
	X,
} from "lucide-react"
import { SkillChip } from "@/components/profile/skill-chip"
import ConfirmModal from "@/components/ui/confirm-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import type { SkillCategoryGroup } from "@/lib/skill-categories"
import { cn } from "@/lib/utils"
import type { AsyncResultMsg } from "@/types/types"
import { toast } from "react-hot-toast"

interface SkillCategoryCardProps {
	group: SkillCategoryGroup
	existingSkillNames: Set<string>
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

export function SkillCategoryCard({
	group,
	existingSkillNames,
	onRenameCategory,
	onDeleteCategory,
	onAddSkill,
	onDeleteSkill,
}: SkillCategoryCardProps) {
	const [draftSkill, setDraftSkill] = useState("")
	const [isAddingSkill, setIsAddingSkill] = useState(false)
	const [isEditingName, setIsEditingName] = useState(false)
	const [draftName, setDraftName] = useState(group.name)
	const [isSavingName, setIsSavingName] = useState(false)
	const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)

	const skillCountLabel =
		group.skills.length === 1
			? "1 skill"
			: `${group.skills.length} skills`

	async function handleAddSkill() {
		const nextSkill = draftSkill.trim()
		if (!nextSkill || isAddingSkill) return

		if (existingSkillNames.has(nextSkill.toLowerCase())) {
			toast.error("That skill already exists.")
			setDraftSkill("")
			return
		}

		setIsAddingSkill(true)
		const categoryId = group.isUncategorized ? null : group.id
		const result = await onAddSkill(nextSkill, categoryId)
		setIsAddingSkill(false)

		if (result.success) {
			toast.success(result.message)
			setDraftSkill("")
			return
		}
		toast.error(result.message)
	}

	function handleSkillInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key !== "Enter") return
		event.preventDefault()
		void handleAddSkill()
	}

	async function handleSaveName() {
		const nextName = draftName.trim()
		if (!nextName) {
			toast.error("Category name is required.")
			return
		}
		if (nextName === group.name) {
			setIsEditingName(false)
			return
		}

		setIsSavingName(true)
		const result = await onRenameCategory(group.id, nextName)
		setIsSavingName(false)

		if (result.success) {
			toast.success(result.message)
			setIsEditingName(false)
			return
		}
		toast.error(result.message)
	}

	function handleNameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Enter") {
			event.preventDefault()
			void handleSaveName()
		}
		if (event.key === "Escape") {
			event.preventDefault()
			setDraftName(group.name)
			setIsEditingName(false)
		}
	}

	async function handleDeleteSkill(skillId: string, skillName: string) {
		const result = await onDeleteSkill(skillId)
		if (result.success) {
			toast.success(`Removed ${skillName}`)
			return
		}
		toast.error(result.message)
	}

	async function handleConfirmDeleteCategory() {
		const result = await onDeleteCategory(group.id)
		if (!result.success) {
			throw new Error(result.message)
		}
	}

	return (
		<section
			className={cn(
				"space-y-3 rounded-xl border border-neutral-200 bg-white p-4",
				group.isUncategorized && "border-dashed bg-neutral-50/80",
			)}
		>
			<header className="flex flex-wrap items-start justify-between gap-2">
				<div className="min-w-0 flex-1 space-y-1">
					{isEditingName && !group.isUncategorized ? (
						<div className="flex flex-wrap items-center gap-2">
							<Input
								value={draftName}
								onChange={(event) => setDraftName(event.target.value)}
								onKeyDown={handleNameKeyDown}
								className="h-9 max-w-xs"
								aria-label="Category name"
								autoFocus
							/>
							<Button
								type="button"
								size="sm"
								className="h-9 gap-1.5"
								onClick={() => void handleSaveName()}
								disabled={isSavingName}
							>
								{isSavingName ? (
									<Loader2 className="size-3.5 animate-spin" aria-hidden />
								) : (
									<Check className="size-3.5" aria-hidden />
								)}
								Save
							</Button>
							<Button
								type="button"
								size="sm"
								variant="ghost"
								className="h-9"
								onClick={() => {
									setDraftName(group.name)
									setIsEditingName(false)
								}}
								disabled={isSavingName}
							>
								<X className="size-3.5" aria-hidden />
							</Button>
						</div>
					) : (
						<div className="flex min-w-0 flex-wrap items-center gap-2">
							<h3 className="truncate text-sm font-semibold text-neutral-900">
								{group.name}
							</h3>
							<span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
								{skillCountLabel}
							</span>
						</div>
					)}
					{group.isUncategorized ? (
						<p className={`text-xs ${PROFILE_SURFACE.infoBoxText}`}>
							Skills without a category. Move them by deleting and re-adding
							under a category, or create a category first.
						</p>
					) : null}
				</div>

				{!group.isUncategorized && !isEditingName ? (
					<div className="flex items-center gap-1">
						<Button
							type="button"
							size="sm"
							variant="ghost"
							className="h-8 gap-1.5 px-2 text-neutral-600"
							onClick={() => {
								setDraftName(group.name)
								setIsEditingName(true)
							}}
						>
							<Pencil className="size-3.5" aria-hidden />
							Rename
						</Button>
						<Button
							type="button"
							size="sm"
							variant="ghost"
							className="h-8 gap-1.5 px-2 text-destructive hover:text-destructive"
							onClick={() => setIsConfirmDeleteOpen(true)}
						>
							<Trash2 className="size-3.5" aria-hidden />
							Delete
						</Button>
					</div>
				) : null}
			</header>

			<div
				className={cn(
					"min-h-14 rounded-lg border border-neutral-200 bg-neutral-50 p-3",
				)}
			>
				{group.skills.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{group.skills.map((skill) => (
							<SkillChip
								key={skill.id}
								name={skill.name}
								onRemove={() =>
									void handleDeleteSkill(skill.id, skill.name)
								}
							/>
						))}
					</div>
				) : (
					<p className="text-sm text-neutral-500">
						No skills in this category yet.
					</p>
				)}
			</div>

			{!group.isUncategorized ? (
				<div className="flex flex-wrap items-center gap-2">
					<Input
						placeholder="Add a skill and press Enter"
						value={draftSkill}
						onChange={(event) => setDraftSkill(event.target.value)}
						onKeyDown={handleSkillInputKeyDown}
						className="h-9 w-full sm:max-w-xs"
						disabled={isAddingSkill}
					/>
					<Button
						type="button"
						variant="secondary"
						className="h-9 gap-2"
						onClick={() => void handleAddSkill()}
						disabled={draftSkill.trim().length === 0 || isAddingSkill}
					>
						{isAddingSkill ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : (
							<Plus className="size-4" aria-hidden />
						)}
						Add
					</Button>
				</div>
			) : null}

			{!group.isUncategorized ? (
				<ConfirmModal
					isOpen={isConfirmDeleteOpen}
					onClose={() => setIsConfirmDeleteOpen(false)}
					onConfirm={handleConfirmDeleteCategory}
					title="Delete category"
					message={`Delete "${group.name}"? Skills in this category will move to Uncategorized.`}
					successMessage="Category deleted"
				/>
			) : null}
		</section>
	)
}
