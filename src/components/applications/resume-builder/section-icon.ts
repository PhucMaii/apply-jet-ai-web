import {
	FolderKanban,
	Briefcase,
	FileText,
	GraduationCap,
	Layers,
	UserRound,
	Wrench,
} from "lucide-react"
import type { AppResumeSectionType } from "@/types/app-resume"

export function getSectionIcon(type: AppResumeSectionType) {
	switch (type) {
		case "header":
			return UserRound
		case "summary":
			return FileText
		case "experience":
			return Briefcase
		case "education":
			return GraduationCap
		case "skills":
			return Wrench
		case "projects":
			return FolderKanban
		case "custom":
			return Layers
		default:
			return FileText
	}
}
