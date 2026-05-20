import type { LucideIcon } from "lucide-react"
import {
	BriefcaseBusiness,
	GraduationCap,
	Link2,
	ShieldCheck,
	UserRound,
	Wrench,
} from "lucide-react"

export const PROFILE_SECTION = {
	contact: "contact",
	work: "work",
	education: "education",
	links: "links",
	disclosure: "disclosure",
	skills: "skills",
} as const

export type ProfileSection =
	(typeof PROFILE_SECTION)[keyof typeof PROFILE_SECTION]

export const PROFILE_SECTION_META: Record<
	ProfileSection,
	{ label: string; Icon: LucideIcon }
> = {
	[PROFILE_SECTION.contact]: { label: "Contact", Icon: UserRound },
	[PROFILE_SECTION.work]: { label: "Work", Icon: BriefcaseBusiness },
	[PROFILE_SECTION.education]: { label: "Education", Icon: GraduationCap },
	[PROFILE_SECTION.links]: { label: "Links", Icon: Link2 },
	[PROFILE_SECTION.disclosure]: { label: "Disclosure", Icon: ShieldCheck },
	[PROFILE_SECTION.skills]: { label: "Skills", Icon: Wrench },
}
