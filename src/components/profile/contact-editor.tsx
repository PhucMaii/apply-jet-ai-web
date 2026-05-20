import { type Dispatch, type FormEvent, type SetStateAction } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PROFILE_FORM_IDS } from "@/components/profile/profile-form-ids"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import type { UserProfileRow } from "@/types/database"

interface ProfileContactEditorProps {
	formIds?: typeof PROFILE_FORM_IDS
	userEmail: string | null | undefined
	profile: UserProfileRow
	setProfile: Dispatch<SetStateAction<UserProfileRow | null>>
	saving: boolean
	onSubmit: (e: FormEvent) => void
}

export function ProfileContactEditor({
	formIds = PROFILE_FORM_IDS,
	userEmail,
	profile,
	setProfile,
	saving,
	onSubmit,
}: ProfileContactEditorProps) {
	const fieldInputClass = PROFILE_SURFACE.fieldInput
	const fieldLabelClass = PROFILE_SURFACE.fieldLabel
	const fieldTextareaClass = PROFILE_SURFACE.fieldTextarea

	return (
		<form onSubmit={onSubmit} className="space-y-6 bg-white">
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
						value={profile.first_name ?? ""}
						onChange={(e) =>
							setProfile((p) =>
								p
									? {
											...p,
											first_name: e.target.value,
										}
									: p,
							)
						}
						autoComplete="given-name"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={formIds.lastName} className={fieldLabelClass}>
						Last name
					</Label>
					<Input
						id={formIds.lastName}
						className={fieldInputClass}
						value={profile.last_name ?? ""}
						onChange={(e) =>
							setProfile((p) =>
								p
									? {
											...p,
											last_name: e.target.value,
										}
									: p,
							)
						}
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
					value={profile.email ?? ""}
					onChange={(e) =>
						setProfile((p) =>
							p ? { ...p, email: e.target.value } : p,
						)
					}
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
					value={profile.phone ?? ""}
					onChange={(e) =>
						setProfile((p) =>
							p ? { ...p, phone: e.target.value } : p,
						)
					}
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
					value={profile.address_line1 ?? ""}
					onChange={(e) =>
						setProfile((p) =>
							p
								? { ...p, address_line1: e.target.value }
								: p,
						)
					}
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
					value={profile.address_line2 ?? ""}
					onChange={(e) =>
						setProfile((p) =>
							p ? { ...p, address_line2: e.target.value } : p,
						)
					}
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
						value={profile.city ?? ""}
						onChange={(e) =>
							setProfile((p) =>
								p ? { ...p, city: e.target.value } : p,
							)
						}
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
						value={profile.province ?? ""}
						onChange={(e) =>
							setProfile((p) =>
								p ? { ...p, province: e.target.value } : p,
							)
						}
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
						value={profile.country ?? ""}
						onChange={(e) =>
							setProfile((p) =>
								p ? { ...p, country: e.target.value } : p,
							)
						}
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
						value={profile.postal_code ?? ""}
						onChange={(e) =>
							setProfile((p) =>
								p ? { ...p, postal_code: e.target.value } : p,
							)
						}
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
					value={
						profile.expected_salary === null ||
						profile.expected_salary === undefined
							? ""
							: String(profile.expected_salary)
					}
					onChange={(e) => {
						const v = e.target.value
						setProfile((p) =>
							p
								? {
										...p,
										expected_salary: v === "" ? null : Number(v),
									}
								: p,
						)
					}}
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
					value={profile.summary ?? ""}
					onChange={(e) =>
						setProfile((p) =>
							p ? { ...p, summary: e.target.value } : p,
						)
					}
				/>
			</div>

			<Button type="submit" disabled={saving} className="gap-2">
				{saving ? (
					<>
						<Loader2 className="size-4 animate-spin" aria-hidden />
						Saving…
					</>
				) : (
					"Save profile"
				)}
			</Button>
		</form>
	)
}

