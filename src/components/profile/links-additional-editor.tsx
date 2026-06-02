import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UserAdditionalInfoRow, UserLinkRow } from "@/types/database"
import { stableFormSnapshot } from "@/lib/utils"
import LinkAdditionalRow from "./link-additional-row"
import type { AsyncResultMsg } from "@/types/types"
import AddLinkModal from "./add-link-modal"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "react-hot-toast"
import { debounce } from "lodash"

interface LinksAdditionalEditorProps {
	links: UserLinkRow[]
	additionalInfo: UserAdditionalInfoRow | null
	onAddLink: (newLink: UserLinkRow) => Promise<AsyncResultMsg>
	onDeleteLink: (linkId: string) => void
	onSaveLink: (link: UserLinkRow) => Promise<AsyncResultMsg>
	onSaveAdditionalInfo: (additionalInfo: UserAdditionalInfoRow) => Promise<AsyncResultMsg>
}

export function LinksAdditionalEditor({
	links,
	additionalInfo,
	onAddLink,
	onDeleteLink,
	onSaveLink,
	onSaveAdditionalInfo,
}: LinksAdditionalEditorProps) {
	const [isOpenAddLinkModal, setIsOpenAddLinkModal] = useState(false)

	const isHydratedRef = useRef(false)

	const { control, register, handleSubmit, formState: { isDirty } } = useForm<UserAdditionalInfoRow>({
		defaultValues: additionalInfo ?? { languages: "", certifications: "" },
		mode: "onTouched",
	})

	useEffect(() => {
		if (!isHydratedRef.current) {
			const id = setTimeout(() => {
				isHydratedRef.current = true
			}, 0)
			return () => clearTimeout(id)
		}
	}, [isDirty])

	const watchedValues = useWatch({ control })
	const lastSavedSnapshotRef = useRef<string>("")
	const isSavingRef = useRef(false)

	const runSave = useCallback(async () => {
		if (isSavingRef.current) {
			return
		}
		isSavingRef.current = true


		try {
			await handleSubmit(async (data) => {
				const snapshot = stableFormSnapshot(data)
				await onSaveAdditionalInfo(data)
				toast.success("Additional info saved")
				lastSavedSnapshotRef.current = snapshot
			})()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to save additional info")
		} finally {
			isSavingRef.current = false
		}
	}, [handleSubmit, onSaveAdditionalInfo])

	const debouncedSave = useMemo(() => {
		return debounce(() => {
			void runSave()
		}, 1000)
	}, [runSave])

	useEffect(() => {
		return () => {
			debouncedSave.flush()
			debouncedSave.cancel()
		}
	}, [debouncedSave])

	useEffect(() => {
		if (!isDirty || !isHydratedRef.current) {
			lastSavedSnapshotRef.current = ""
			return
		}

		const snapshot = stableFormSnapshot(watchedValues)
		if (snapshot === lastSavedSnapshotRef.current) {
			return
		}
		debouncedSave()
	}, [debouncedSave, watchedValues, isDirty])

	return (
		<Card variant="solid" className={DASHBOARD_THEME.card}>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle className="flex items-center gap-2 font-display">
						<Link2 className={PROFILE_SURFACE.sectionIcon} aria-hidden />
						Links &amp; additional info
					</CardTitle>
					<CardDescription>
						Links and your languages/certifications live in one section.
					</CardDescription>
				</div>

				<Button
					type="button"
					variant="secondary"
					className="gap-2"
					onClick={() => setIsOpenAddLinkModal(true)}
				>
					<Plus className="size-4" aria-hidden />
					Add link
				</Button>
			</CardHeader>
			<CardContent className="space-y-4">
				{links.map((row, index) => (
					<LinkAdditionalRow
						key={`${row.id}-${index}`}
						row={row}
						index={index}
						onDeleteLink={onDeleteLink}
						onSave={onSaveLink}
					/>
				))}

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label>Languages (comma separated)</Label>
						<Input
							placeholder="English, Spanish"
							{...register("languages")}
						/>
					</div>
					<div className="space-y-2">
						<Label>Certifications (comma separated)</Label>
						<Input
							placeholder="AWS SAA, PSM I"
							{...register("certifications")}
						/>
					</div>
				</div>
			</CardContent>

			<AddLinkModal
				isOpen={isOpenAddLinkModal}
				onClose={() => setIsOpenAddLinkModal(false)}
				onAdd={onAddLink}
			/>
		</Card>
	)
}

