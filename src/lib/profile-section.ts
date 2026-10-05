import type { LucideIcon } from "lucide-react"
import {
	BriefcaseBusiness,
	CreditCard,
	FileText,
	FolderKanban,
	Gauge,
	GraduationCap,
	Link2,
	UserRound,
	Wrench,
} from "lucide-react"

export const PROFILE_SECTION = {
	resume: "resume",
	contact: "contact",
	work: "work",
	education: "education",
	projects: "projects",
	links: "links",
	skills: "skills",
} as const

export type ProfileSection =
	(typeof PROFILE_SECTION)[keyof typeof PROFILE_SECTION]

export const PROFILE_SECTION_PARAM = "section" as const

export function isProfileSection(value: string | null): value is ProfileSection {
	return (
		value !== null &&
		(Object.values(PROFILE_SECTION) as string[]).includes(value)
	)
}

interface ProfileNavMeta {
	label: string
	Icon: LucideIcon
}

export const PROFILE_SECTION_META: Record<ProfileSection, ProfileNavMeta> = {
	[PROFILE_SECTION.resume]: { label: "Resume file", Icon: FileText },
	[PROFILE_SECTION.contact]: { label: "Personal info", Icon: UserRound },
	[PROFILE_SECTION.work]: { label: "Work experience", Icon: BriefcaseBusiness },
	[PROFILE_SECTION.education]: { label: "Education", Icon: GraduationCap },
	[PROFILE_SECTION.projects]: { label: "Projects", Icon: FolderKanban },
	[PROFILE_SECTION.links]: { label: "Links", Icon: Link2 },
	[PROFILE_SECTION.skills]: { label: "Skills", Icon: Wrench },
}

export const PROFILE_ACCOUNT_META = {
	usage: { label: "Usage", Icon: Gauge },
	billing: { label: "Plan & billing", Icon: CreditCard },
} as const satisfies Record<string, ProfileNavMeta>
