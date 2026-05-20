import type {
	UserDisclosureRow,
	UserEducationRow,
	UserLinkRow,
	UserProfileRow,
	UserSkillRow,
	UserWorkExperienceRow,
} from "@/types/database"

export const EMPTY_DISPLAY = "—"

export function emptyProfileRow(id: string, authEmail: string): UserProfileRow {
	return {
		id,
		email: authEmail,
		full_name: null,
		first_name: null,
		last_name: null,
		phone: null,
		address_line1: null,
		address_line2: null,
		city: null,
		province: null,
		country: null,
		postal_code: null,
		expected_salary: null,
		summary: null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	}
}

export function emptyWorkExperience(userId: string): UserWorkExperienceRow {
	return {
		id: "",
		user_id: userId,
		location: null,
		start_date: null,
		end_date: null,
		currently_working: false,
		description: null,
		created_at: "",
		company: null,
		title: null,
		employment_type: null,
		updated_at: "",
	}
}

export function emptyEducation(userId: string): UserEducationRow {
	return {
		id: "",
		user_id: userId,
		degree: null,
		field_of_study: null,
		start_date: null,
		end_date: null,
		gpa: null,
		description: null,
		created_at: "",
		school: null,
		updated_at: "",
	}
}

export function emptyDisclosure(userId: string): UserDisclosureRow {
	return {
		id: "",
		user_id: userId,
		authorized_to_work: null,
		willing_to_relocate: null,
		gender: null,
		ethnicity: null,
		veteran_status: null,
		disability_status: null,
		created_at: "",
		require_sponsorship: null,
	}
}

export function emptyLink(userId: string): UserLinkRow {
	return {
		id: "",
		user_id: userId,
		url: "",
		link_type: null,
		created_at: "",
		updated_at: "",
	}
}

export function emptySkill(userId: string): UserSkillRow {
	return {
		id: "",
		user_id: userId,
		name: "",
		created_at: "",
		is_from_org_resume: false,
	}
}
