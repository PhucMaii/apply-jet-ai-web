import { useCallback, useEffect, useMemo, useRef } from "react"
import { ShieldCheck } from "lucide-react"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import type { UserDisclosureRow } from "@/types/database"
import { stableFormSnapshot } from "@/lib/utils"
import { DISCLOSURE_OPTIONS } from "@/components/profile/constant"
import type { AsyncResultMsg } from "@/types/types"
import { useForm, useWatch } from "react-hook-form"
import { DisclosureSelectField } from "./disclosure-select-field"
import { toast } from "react-hot-toast"
import { debounce } from "lodash"

interface DisclosureEditorProps {
	disclosure: UserDisclosureRow | null
	onSave: (disclosure: UserDisclosureRow) => Promise<AsyncResultMsg>
}

export function DisclosureEditor({
	disclosure,
	onSave,
}: DisclosureEditorProps) {
	const isHydratedRef = useRef(false)

	const { register, handleSubmit, control, formState: { isDirty } } = useForm<UserDisclosureRow>({
		defaultValues: disclosure ?? {
			authorized_to_work: null,
			require_sponsorship: null,
			willing_to_relocate: null,
			gender: null,
			ethnicity: null,
			veteran_status: null,
			disability_status: null,
		},
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
				await onSave(data)
				toast.success("Disclosure saved")
				lastSavedSnapshotRef.current = snapshot
			})()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to save disclosure")
		} finally {
			isSavingRef.current = false
		}
	}, [handleSubmit, onSave])

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
			<CardHeader>
				<CardTitle className="flex items-center gap-2 font-display">
					<ShieldCheck className={PROFILE_SURFACE.sectionIcon} aria-hidden />
					Disclosure
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<DisclosureSelectField
						register={register}
						field="authorized_to_work"
						options={DISCLOSURE_OPTIONS.authorized_to_work}
						label="Authorized to work"
					/>
					<DisclosureSelectField
						register={register}
						field="require_sponsorship"
						options={DISCLOSURE_OPTIONS.require_sponsorship}
						label="Require sponsorship"
					/>
					<DisclosureSelectField
						register={register}
						field="willing_to_relocate"
						options={DISCLOSURE_OPTIONS.willing_to_relocate}
						label="Willing to relocate"
					/>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<DisclosureSelectField
						register={register}
						field="gender"
						options={DISCLOSURE_OPTIONS.gender}
						label="Gender"
					/>
					<DisclosureSelectField
						register={register}
						field="ethnicity"
						options={DISCLOSURE_OPTIONS.ethnicity}
						label="Ethnicity"
					/>
					<DisclosureSelectField
						register={register}
						field="veteran_status"
						options={DISCLOSURE_OPTIONS.veteran_status}
						label="Veteran status"
					/>
					<DisclosureSelectField
						register={register}
						field="disability_status"
						options={DISCLOSURE_OPTIONS.disability_status}
						label="Disability status"
					/>
				</div>
			</CardContent>
		</Card>
	)
}
