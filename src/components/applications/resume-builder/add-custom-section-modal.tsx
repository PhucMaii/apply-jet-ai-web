import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import Modal from "@/components/ui/modal"
import Divider from "@/components/ui/divider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CUSTOM_SECTION_BLOCK_OPTIONS } from "@/lib/custom-resume-section"
import type { CustomSectionBlockType } from "@/types/app-resume"
import { cn } from "@/lib/utils"

const DEFAULT_BLOCK_TYPE: CustomSectionBlockType = "rich_text"

interface AddCustomSectionModalProps {
	isOpen: boolean
	mode: "section" | "block"
	isSubmitting?: boolean
	onClose: () => void
	onSubmit: (input: {
		title: string
		blockType: CustomSectionBlockType
	}) => Promise<void> | void
}

export function AddCustomSectionModal({
	isOpen,
	mode,
	isSubmitting = false,
	onClose,
	onSubmit,
}: AddCustomSectionModalProps) {
	const [title, setTitle] = useState("")
	const [blockType, setBlockType] =
		useState<CustomSectionBlockType>(DEFAULT_BLOCK_TYPE)
	const [titleError, setTitleError] = useState<string | null>(null)

	useEffect(() => {
		if (!isOpen) return
		setTitle("")
		setBlockType(DEFAULT_BLOCK_TYPE)
		setTitleError(null)
	}, [isOpen])

	async function handleSubmit() {
		const trimmedTitle = title.trim()
		if (mode === "section" && !trimmedTitle) {
			setTitleError("Enter a section header name.")
			return
		}

		await onSubmit({
			title: trimmedTitle,
			blockType,
		})
	}

	const heading =
		mode === "section" ? "Add custom section" : "Add block"
	const description =
		mode === "section"
			? "Name the section, then choose the first block type."
			: "Choose what kind of content to add."

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="space-y-1 pr-6">
				<h2 className="font-display text-lg font-semibold text-neutral-900">
					{heading}
				</h2>
				<p className="text-sm text-neutral-500">{description}</p>
			</div>

			<Divider />

			<div className="space-y-4">
				{mode === "section" ? (
					<div className="space-y-1.5">
						<Label htmlFor="custom-section-title">
							Section header name
						</Label>
						<Input
							id="custom-section-title"
							value={title}
							onChange={(event) => {
								setTitle(event.target.value)
								if (titleError) setTitleError(null)
							}}
							placeholder="e.g. Certifications, Volunteer, Awards"
							className="h-10"
							autoFocus
						/>
						{titleError ? (
							<p className="text-xs text-red-600" role="alert">
								{titleError}
							</p>
						) : null}
					</div>
				) : null}

				<div className="space-y-2">
					<p className="text-sm font-medium text-neutral-700">
						Block type
					</p>
					<div
						className="grid gap-2"
						role="radiogroup"
						aria-label="Block type"
					>
						{CUSTOM_SECTION_BLOCK_OPTIONS.map((option) => {
							const selected = blockType === option.value
							return (
								<button
									key={option.value}
									type="button"
									role="radio"
									aria-checked={selected}
									onClick={() => setBlockType(option.value)}
									className={cn(
										"rounded-lg border px-3 py-2.5 text-left transition-colors",
										selected
											? "border-primary/40 bg-primary/5"
											: "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
									)}
								>
									<p className="text-sm font-medium text-neutral-900">
										{option.label}
									</p>
									<p className="mt-0.5 text-xs text-neutral-500">
										{option.description}
									</p>
								</button>
							)
						})}
					</div>
				</div>
			</div>

			<div className="flex items-center justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={onClose}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button
					type="button"
					onClick={() => {
						void handleSubmit()
					}}
					disabled={isSubmitting}
					className="gap-1.5"
				>
					{isSubmitting ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					{mode === "section" ? "Create section" : "Add block"}
				</Button>
			</div>
		</Modal>
	)
}
