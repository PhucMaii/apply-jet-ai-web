import type { Dispatch, SetStateAction } from "react"
import { useId } from "react"
import { ShieldCheck } from "lucide-react"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { UserDisclosureRow } from "@/types/database"
import { cn } from "@/lib/utils"
import { DISCLOSURE_OPTIONS } from "@/components/profile/constant"

interface DisclosureEditorProps {
	disclosure: UserDisclosureRow | null
	setDisclosure: Dispatch<SetStateAction<UserDisclosureRow | null>>
}

const PLACEHOLDER = "Select an option"

function boolToSelectValue(value: boolean | null | undefined): string {
	if (value === true) return "yes"
	if (value === false) return "no"
	return ""
}

function selectValueToBool(raw: string): boolean | null {
	if (raw === "yes") return true
	if (raw === "no") return false
	return null
}

function willingRelocateToBool(raw: string): boolean | null {
	if (raw === "yes") return true
	if (raw === "no") return false
	if (raw === "open") return null
	return null
}

function willingRelocateFromBool(
	value: boolean | null | undefined,
): string {
	return boolToSelectValue(value)
}

function DisclosureSelectField({
	id,
	label,
	value,
	options,
	onChange,
}: {
	id: string
	label: string
	value: string
	options: { value: string; label: string }[]
	onChange: (next: string) => void
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<select
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={cn(
					"flex h-11 w-full cursor-pointer rounded-md border border-input",
					"bg-muted/40 px-3 py-2 text-sm text-foreground shadow-inner",
					"transition-colors",
					"focus-visible:outline-none focus-visible:ring-2",
					"focus-visible:ring-ring focus-visible:ring-offset-2",
					"focus-visible:ring-offset-background",
					"disabled:cursor-not-allowed disabled:opacity-50",
				)}
			>
				<option value="">{PLACEHOLDER}</option>
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</div>
	)
}

export function DisclosureEditor({
	disclosure,
	setDisclosure,
}: DisclosureEditorProps) {
	const baseId = useId()
	const idAuthorized = `${baseId}-authorized`
	const idSponsorship = `${baseId}-sponsorship`
	const idRelocate = `${baseId}-relocate`
	const idGender = `${baseId}-gender`
	const idEthnicity = `${baseId}-ethnicity`
	const idVeteran = `${baseId}-veteran`
	const idDisability = `${baseId}-disability`

	return (
		<Card className="border-border/80 bg-card/40 backdrop-blur-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 font-display">
					<ShieldCheck className="size-4 text-info" aria-hidden />
					Disclosure
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<DisclosureSelectField
						id={idAuthorized}
						label="Authorized to work"
						value={boolToSelectValue(disclosure?.authorized_to_work)}
						options={DISCLOSURE_OPTIONS.authorized_to_work}
						onChange={(raw) =>
							setDisclosure((prev) =>
								prev
									? {
											...prev,
											authorized_to_work: selectValueToBool(raw),
										}
									: prev,
							)
						}
					/>
					<DisclosureSelectField
						id={idSponsorship}
						label="Require sponsorship"
						value={boolToSelectValue(disclosure?.require_sponsorship)}
						options={DISCLOSURE_OPTIONS.require_sponsorship}
						onChange={(raw) =>
							setDisclosure((prev) =>
								prev
									? {
											...prev,
											require_sponsorship: selectValueToBool(raw),
										}
									: prev,
							)
						}
					/>
					<DisclosureSelectField
						id={idRelocate}
						label="Willing to relocate"
						value={willingRelocateFromBool(
							disclosure?.willing_to_relocate,
						)}
						options={DISCLOSURE_OPTIONS.willing_to_relocate}
						onChange={(raw) =>
							setDisclosure((prev) =>
								prev
									? {
											...prev,
											willing_to_relocate: willingRelocateToBool(raw),
										}
									: prev,
							)
						}
					/>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<DisclosureSelectField
						id={idGender}
						label="Gender"
						value={disclosure?.gender ?? ""}
						options={DISCLOSURE_OPTIONS.gender}
						onChange={(raw) =>
							setDisclosure((prev) =>
								prev ? { ...prev, gender: raw || null } : prev,
							)
						}
					/>
					<DisclosureSelectField
						id={idEthnicity}
						label="Ethnicity"
						value={disclosure?.ethnicity ?? ""}
						options={DISCLOSURE_OPTIONS.ethnicity}
						onChange={(raw) =>
							setDisclosure((prev) =>
								prev ? { ...prev, ethnicity: raw || null } : prev,
							)
						}
					/>
					<DisclosureSelectField
						id={idVeteran}
						label="Veteran status"
						value={disclosure?.veteran_status ?? ""}
						options={DISCLOSURE_OPTIONS.veteran_status}
						onChange={(raw) =>
							setDisclosure((prev) =>
								prev
									? { ...prev, veteran_status: raw || null }
									: prev,
							)
						}
					/>
					<DisclosureSelectField
						id={idDisability}
						label="Disability status"
						value={disclosure?.disability_status ?? ""}
						options={DISCLOSURE_OPTIONS.disability_status}
						onChange={(raw) =>
							setDisclosure((prev) =>
								prev
									? { ...prev, disability_status: raw || null }
									: prev,
							)
						}
					/>
				</div>
			</CardContent>
		</Card>
	)
}
