import { useEffect, useMemo, useState } from "react"
import { SectionStyleEditor } from "@/components/applications/resume-builder/section-style-editor"
import { buildResumeStyleGroups } from "@/lib/resume-block-style"
import type { AppResumeBlockStyle, AppResumeSection } from "@/types/app-resume"

interface ResumeStylePanelProps {
	sections: AppResumeSection[]
	activeSectionId: string
	savingGroupId?: string | null
	onSectionFocus: (sectionId: string) => void
	onStyleChange: (
		groupId: string,
		blockIds: string[],
		patch: Partial<AppResumeBlockStyle>,
	) => void
}

export function ResumeStylePanel({
	sections,
	activeSectionId,
	savingGroupId = null,
	onSectionFocus,
	onStyleChange,
}: ResumeStylePanelProps) {
	const groups = useMemo(() => buildResumeStyleGroups(sections), [sections])
	const defaultOpenGroupId = useMemo(
		() => resolveDefaultOpenGroupId(groups.map((group) => group.id)),
		[groups],
	)
	const [openGroupId, setOpenGroupId] = useState<string | null>(
		defaultOpenGroupId,
	)

	useEffect(() => {
		if (groups.length === 0) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setOpenGroupId(null)
			return
		}

		setOpenGroupId((current) => {
			if (current && groups.some((group) => group.id === current)) {
				return current
			}
			return resolveDefaultOpenGroupId(groups.map((group) => group.id))
		})
	}, [groups])

	if (groups.length === 0) {
		return (
			<p className="px-1 py-6 text-center text-sm text-neutral-500">
				Add resume content first, then tune its style here.
			</p>
		)
	}

	return (
		<div className="space-y-3">
			<div className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2.5">
				<p className="text-sm font-medium text-neutral-800">
					Section styles
				</p>
				<p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
					Open a section to edit its type. Changes update every matching
					block in the preview.
				</p>
			</div>

			{groups.map((group) => {
				const isOpen = openGroupId === group.id
				return (
					<SectionStyleEditor
						key={group.id}
						group={group}
						isOpen={isOpen}
						isActive={activeSectionId === group.sectionId}
						isSaving={savingGroupId === group.id}
						onToggle={() => {
							const nextOpen = isOpen ? null : group.id
							setOpenGroupId(nextOpen)
							if (nextOpen) onSectionFocus(group.sectionId)
						}}
						onChange={(patch) =>
							onStyleChange(group.id, group.blockIds, patch)
						}
					/>
				)
			})}
		</div>
	)
}

/** Prefer Name so the first accordion teaches the Style controls. */
function resolveDefaultOpenGroupId(groupIds: string[]): string | null {
	const nameGroupId = groupIds.find((id) => id.startsWith("header-name-"))
	return nameGroupId ?? groupIds[0] ?? null
}
