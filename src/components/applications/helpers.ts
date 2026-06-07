export const isAllowToGenerateResume = (userProfile: any): boolean => {
    if (!userProfile) return false

    const hasEducation = userProfile.educations.length > 0
    const hasWorkExperience = userProfile.workExperiences.length > 0
    const hasProject = userProfile.projects.length > 0

    return hasEducation && (hasWorkExperience || hasProject)
}