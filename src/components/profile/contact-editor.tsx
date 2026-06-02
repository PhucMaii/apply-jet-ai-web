import { useCallback, useEffect, useMemo, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PROFILE_FORM_IDS } from "@/components/profile/profile-form-ids"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import type { UserProfileRow } from "@/types/database"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "react-hot-toast"
import type { AsyncResultMsg } from "@/types/types"
import { stableFormSnapshot } from "@/lib/utils"
import { debounce } from "lodash"

interface ProfileContactEditorProps {
	formIds?: typeof PROFILE_FORM_IDS
	userEmail: string | null | undefined
	profile: UserProfileRow
	onSave: (updatedProfile: UserProfileRow) => Promise<AsyncResultMsg>
}

export function ProfileContactEditor({
	formIds = PROFILE_FORM_IDS,
	userEmail,
	profile,
	onSave,
}: ProfileContactEditorProps) {
	const fieldInputClass = PROFILE_SURFACE.fieldInput
	const fieldLabelClass = PROFILE_SURFACE.fieldLabel
	const fieldTextareaClass = PROFILE_SURFACE.fieldTextarea

	const isHydratedRef = useRef(false)

	const {
		register,
		handleSubmit,
		control,
		formState: { isDirty },
	} = useForm<UserProfileRow>({
		defaultValues: profile,
	})

	// After reset, mark as hydrated on next tick
	useEffect(() => {
		if (!isHydratedRef.current) {
			const id = setTimeout(() => {
				isHydratedRef.current = true
			}, 0)
			return () => clearTimeout(id)
		}
	}, [profile, isDirty])

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
				toast.success("Profile saved")
				lastSavedSnapshotRef.current = snapshot
			})()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to save profile")
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
		<form className="space-y-6 bg-white">
			<div className={PROFILE_SURFACE.infoBox}>
				<p className={PROFILE_SURFACE.infoBoxTitle}>
					Account email (sign-in)
				</p>
				<p className={PROFILE_SURFACE.infoBoxText}>{userEmail ?? "—"}</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor={formIds.firstName} className={fieldLabelClass}>
						First name
					</Label>
					<Input
						id={formIds.firstName}
						className={fieldInputClass}
						autoComplete="given-name"
						{...register("first_name")}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={formIds.lastName} className={fieldLabelClass}>
						Last name
					</Label>
					<Input
						id={formIds.lastName}
						className={fieldInputClass}
						{...register("last_name")}
						autoComplete="family-name"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor={formIds.email} className={fieldLabelClass}>
					Email (autofill)
				</Label>
				<Input
					id={formIds.email}
					type="email"
					className={fieldInputClass}
					{...register("email")}
					autoComplete="email"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor={formIds.phone} className={fieldLabelClass}>
					Phone
				</Label>
				<Input
					id={formIds.phone}
					type="tel"
					className={fieldInputClass}
					{...register("phone")}
					autoComplete="tel"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor={formIds.address1} className={fieldLabelClass}>
					Address line 1
				</Label>
				<Input
					id={formIds.address1}
					className={fieldInputClass}
					{...register("address_line1")}
					autoComplete="address-line1"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor={formIds.address2} className={fieldLabelClass}>
					Address line 2
				</Label>
				<Input
					id={formIds.address2}
					className={fieldInputClass}
					{...register("address_line2")}
					autoComplete="address-line2"
				/>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor={formIds.city} className={fieldLabelClass}>
						City
					</Label>
					<Input
						id={formIds.city}
						className={fieldInputClass}
						{...register("city")}
						autoComplete="address-level2"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={formIds.province} className={fieldLabelClass}>
						Province / state
					</Label>
					<Input
						id={formIds.province}
						className={fieldInputClass}
						{...register("province")}
						autoComplete="address-level1"
					/>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor={formIds.country} className={fieldLabelClass}>
						Country
					</Label>
					<Input
						id={formIds.country}
						className={fieldInputClass}
						{...register("country")}
						autoComplete="country-name"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={formIds.postal} className={fieldLabelClass}>
						Postal code
					</Label>
					<Input
						id={formIds.postal}
						className={fieldInputClass}
						{...register("postal_code")}
						autoComplete="postal-code"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor={formIds.salary} className={fieldLabelClass}>
					Expected salary (annual)
				</Label>
				<Input
					id={formIds.salary}
					type="number"
					className={fieldInputClass}
					min={0}
					step={1000}
					placeholder="85000"
					{...register("expected_salary")}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor={formIds.summary} className={fieldLabelClass}>
					Professional summary
				</Label>
				<Textarea
					id={formIds.summary}
					rows={5}
					className={fieldTextareaClass}
					placeholder="Short summary for forms and cover letters…"
					{...register("summary")}
				/>
			</div>
		</form>
	)
}