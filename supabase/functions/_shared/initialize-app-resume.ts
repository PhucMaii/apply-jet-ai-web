/**
 * Clone the user's profile into an app_resume tree for a new application.
 * Mirrors src/hooks/use-create-application.ts initializeAppResume for Deno edge.
 */

// deno-lint-ignore no-explicit-any
type SupabaseClient = any

const APP_RESUME_STATUS = { DRAFT: "draft" } as const

const SECTION = {
	HEADER: "header",
	SUMMARY: "summary",
	EXPERIENCE: "experience",
	PROJECTS: "projects",
	SKILLS: "skills",
	EDUCATION: "education",
	CERTIFICATIONS: "certifications",
} as const

function descriptionStringToBullets(value: string | null | undefined): string[] {
	if (!value) return []
	const trimmed = value.trim()
	if (!trimmed) return []

	if (trimmed.includes("\n")) {
		return trimmed
			.split("\n")
			.map((line) => line.replace(/^•\s*/, "").trimEnd())
			.filter(Boolean)
	}

	if (trimmed.includes("•")) {
		return trimmed
			.split("•")
			.map((part) => part.trim())
			.filter(Boolean)
	}

	return [trimmed]
}

function buildSections(
	appResumeId: string,
	flags: {
		hasExperiences: boolean
		hasProjects: boolean
		hasEducation: boolean
		hasSkills: boolean
		hasCertifications: boolean
	},
) {
	return [
		{
			app_resume_id: appResumeId,
			section_type: SECTION.HEADER,
			display_name: "Header",
			sort_key: 0,
		},
		{
			app_resume_id: appResumeId,
			section_type: SECTION.SUMMARY,
			display_name: "Summary",
			sort_key: 1,
		},
		flags.hasExperiences && {
			app_resume_id: appResumeId,
			section_type: SECTION.EXPERIENCE,
			display_name: "Experience",
			sort_key: 2,
		},
		flags.hasProjects && {
			app_resume_id: appResumeId,
			section_type: SECTION.PROJECTS,
			display_name: "Projects",
			sort_key: 3,
		},
		flags.hasEducation && {
			app_resume_id: appResumeId,
			section_type: SECTION.EDUCATION,
			display_name: "Education",
			sort_key: 4,
		},
		flags.hasSkills && {
			app_resume_id: appResumeId,
			section_type: SECTION.SKILLS,
			display_name: "Skills",
			sort_key: 5,
		},
		flags.hasCertifications && {
			app_resume_id: appResumeId,
			section_type: SECTION.CERTIFICATIONS,
			display_name: "Certifications",
			sort_key: 6,
		},
	].filter(Boolean) as Array<{
		app_resume_id: string
		section_type: string
		display_name: string
		sort_key: number
	}>
}

function buildHeaderBlocks(
	appResumeId: string,
	sectionId: string,
	jobTitle: string,
	// deno-lint-ignore no-explicit-any
	userData: any,
	// deno-lint-ignore no-explicit-any
	userLinks: any[],
) {
	const headline =
		jobTitle.trim() || (userData.target_role ?? "").trim() || ""

	return [
		{
			app_resume_id: appResumeId,
			section_id: sectionId,
			block_type: "rich_text",
			content_json: { text: userData.full_name ?? "" },
			sort_key: 0,
			style_json: { bold: true, color: "black", fontSize: 24 },
		},
		{
			app_resume_id: appResumeId,
			section_id: sectionId,
			block_type: "rich_text",
			content_json: { text: headline },
			sort_key: 1,
			style_json: { bold: true, color: "black", fontSize: 16 },
		},
		{
			app_resume_id: appResumeId,
			section_id: sectionId,
			block_type: "group_text",
			sort_key: 2,
			content_json: {
				texts: [
					userData?.city &&
						userData?.province && {
							text: `${userData.city}, ${userData.province}`,
						},
					userData?.phone && { text: `| ${userData.phone}` },
					userData?.email && { text: `| ${userData.email}` },
					...userLinks
						.filter((link) => link.url)
						.map((link) => ({ text: `| ${link.url}` })),
				].filter(Boolean),
			},
			style_json: { color: "black", fontSize: 12 },
		},
	]
}

async function insertBlocks(
	supabase: SupabaseClient,
	// deno-lint-ignore no-explicit-any
	blocks: any[],
) {
	if (blocks.length === 0) return
	const { error } = await supabase.from("app_resume_blocks").insert(blocks)
	if (error) {
		console.error("Something went wrong inserting app resume blocks:", error)
		throw new Error(error.message)
	}
}

export async function initializeAppResumeFromProfile(
	supabase: SupabaseClient,
	userId: string,
	applicationId: string,
	jobTitle: string,
): Promise<{ appResumeId: string }> {
	const { data: userData, error: userError } = await supabase
		.from("users")
		.select("*")
		.eq("id", userId)
		.single()
	if (userError || !userData) {
		throw new Error("User not found")
	}

	const [
		{ data: userLinks, error: linksError },
		{ data: userExperiences, error: expError },
		{ data: userProjects, error: projectsError },
		{ data: userSkills, error: skillsError },
		{ data: userSkillCategories, error: categoriesError },
		{ data: userEducation, error: educationError },
		{ data: additionalInfo, error: additionalInfoError },
	] = await Promise.all([
		supabase.from("user_links").select("*").eq("user_id", userId),
		supabase.from("user_work_experiences").select("*").eq("user_id", userId),
		supabase.from("user_projects").select("*").eq("user_id", userId),
		supabase.from("user_skills").select("*").eq("user_id", userId),
		supabase
			.from("user_skill_categories")
			.select("*")
			.eq("user_id", userId)
			.order("name", { ascending: true }),
		supabase.from("user_educations").select("*").eq("user_id", userId),
		supabase
			.from("user_additional_info")
			.select("certifications")
			.eq("user_id", userId)
			.maybeSingle(),
	])

	if (linksError) throw new Error("Failed to get user links")
	if (expError) throw new Error("Failed to get user experiences")
	if (projectsError) throw new Error("Failed to get user projects")
	if (skillsError) throw new Error("Failed to get user skills")
	if (categoriesError) throw new Error("Failed to get skill categories")
	if (educationError) throw new Error("Failed to get user education")
	if (additionalInfoError) throw new Error("Failed to get user certifications")

	const experiences = userExperiences ?? []
	const projects = userProjects ?? []
	const skills = userSkills ?? []
	const categories = userSkillCategories ?? []
	const education = userEducation ?? []
	const links = userLinks ?? []
	const certifications = (
		(additionalInfo?.certifications as string[] | null) ?? []
	)
		.map((item) => (typeof item === "string" ? item.trim() : ""))
		.filter(Boolean)

	const formattedCategories = categories.map(
		(category: { id: string; name: string }) => ({
			id: category.id,
			name: category.name,
			skills: skills
				.filter(
					(skill: { category_id: string | null }) =>
						skill.category_id === category.id,
				)
				.map((skill: { id: string; name: string }) => ({
					id: skill.id,
					name: skill.name,
				})),
		}),
	)

	const { data: appResumeData, error: appResumeError } = await supabase
		.from("app_resumes")
		.insert({
			user_id: userId,
			application_id: applicationId,
			status: APP_RESUME_STATUS.DRAFT,
		})
		.select("id")
		.single()

	if (appResumeError || !appResumeData) {
		throw new Error("Failed to create app resume")
	}

	const appResumeId = appResumeData.id as string
	const sections = buildSections(appResumeId, {
		hasExperiences: experiences.length > 0,
		hasProjects: projects.length > 0,
		hasEducation: education.length > 0,
		hasSkills: skills.length > 0,
		hasCertifications: certifications.length > 0,
	})

	const idsMap = new Map<string, string>()
	for (const section of sections) {
		const { data: sectionRow, error: sectionError } = await supabase
			.from("app_resume_sections")
			.insert(section)
			.select("id")
			.single()
		if (sectionError || !sectionRow) {
			throw new Error("Failed to create app resume section")
		}
		idsMap.set(section.section_type, sectionRow.id)
	}

	await insertBlocks(
		supabase,
		buildHeaderBlocks(
			appResumeId,
			idsMap.get(SECTION.HEADER)!,
			jobTitle,
			userData,
			links,
		),
	)

	await insertBlocks(supabase, [
		{
			app_resume_id: appResumeId,
			section_id: idsMap.get(SECTION.SUMMARY)!,
			block_type: "rich_text",
			content_json: { text: userData.summary ?? "" },
			sort_key: 0,
			style_json: { color: "black", fontSize: 12 },
		},
	])

	if (idsMap.has(SECTION.EXPERIENCE)) {
		await insertBlocks(
			supabase,
			experiences.map(
				(
					experience: {
						company: string
						title: string
						start_date: string | null
						end_date: string | null
						description: string | null
					},
					index: number,
				) => ({
					app_resume_id: appResumeId,
					section_id: idsMap.get(SECTION.EXPERIENCE)!,
					block_type: "job_entry",
					content_json: {
						company: experience.company,
						title: experience.title,
						start_date: experience.start_date,
						end_date: experience.end_date,
						description: descriptionStringToBullets(experience.description),
					},
					sort_key: index,
					style_json: {
						color: "black",
						fontSize: 12,
						headerLayout: "inline",
					},
				}),
			),
		)
	}

	if (idsMap.has(SECTION.PROJECTS)) {
		await insertBlocks(
			supabase,
			projects.map(
				(
					project: {
						project_name: string
						description: string | null
						start_date: string | null
						end_date: string | null
					},
					index: number,
				) => ({
					app_resume_id: appResumeId,
					section_id: idsMap.get(SECTION.PROJECTS)!,
					block_type: "project_entry",
					content_json: {
						name: project.project_name,
						description: descriptionStringToBullets(project.description),
						start_date: project.start_date,
						end_date: project.end_date,
					},
					sort_key: index,
					style_json: {
						color: "black",
						fontSize: 12,
						headerLayout: "inline",
					},
				}),
			),
		)
	}

	if (idsMap.has(SECTION.EDUCATION)) {
		await insertBlocks(
			supabase,
			education.map(
				(
					row: {
						school: string
						degree: string
						start_date: string | null
						end_date: string | null
					},
					index: number,
				) => ({
					app_resume_id: appResumeId,
					section_id: idsMap.get(SECTION.EDUCATION)!,
					block_type: "education_entry",
					content_json: {
						school: row.school,
						degree: row.degree,
						start_date: row.start_date,
						end_date: row.end_date,
					},
					sort_key: index,
					style_json: {
						color: "black",
						fontSize: 12,
						headerLayout: "stacked",
					},
				}),
			),
		)
	}

	if (idsMap.has(SECTION.SKILLS)) {
		const skillsBlocks = formattedCategories
			.filter(
				(category: { skills: Array<{ name: string }> }) =>
					category.skills.length > 0,
			)
			.map(
				(
					category: { id: string; name: string; skills: Array<{ name: string }> },
					index: number,
				) => ({
					app_resume_id: appResumeId,
					section_id: idsMap.get(SECTION.SKILLS)!,
					block_type: "skill_category_entry",
					sort_key: index,
					content_json: {
						category_id: category.id,
						name: category.name,
						skills: category.skills.map((skill) => skill.name),
					},
					style_json: { color: "black", fontSize: 12 },
				}),
			)
		await insertBlocks(supabase, skillsBlocks)
	}

	if (idsMap.has(SECTION.CERTIFICATIONS)) {
		await insertBlocks(supabase, [
			{
				app_resume_id: appResumeId,
				section_id: idsMap.get(SECTION.CERTIFICATIONS)!,
				block_type: "bullet_list",
				sort_key: 0,
				content_json: {
					items: certifications,
				},
				style_json: {
					color: "black",
					fontSize: 12,
				},
			},
		])
	}

	return { appResumeId }
}
