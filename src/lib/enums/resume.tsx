export const APP_RESUME_STATUS = {
  DRAFT: 'draft',
  DOWNLOADED: 'downloaded',
} as const;

export type AppResumeStatus = (typeof APP_RESUME_STATUS)[keyof typeof APP_RESUME_STATUS];

export const APP_RESUME_SECTION_TYPE = {
  HEADER: 'header',
  SUMMARY: 'summary',
  EXPERIENCE: 'experience',
  PROJECTS: 'projects',
  SKILLS: 'skills',
  EDUCATION: 'education',
  CERTIFICATIONS: 'certifications',
  AWARDS: 'awards',
  LANGUAGES: 'languages',
  VOLUNTEER: 'volunteer',
  PUBLICATIONS: 'publications',
  CUSTOM: 'custom',
} as const;

export type AppResumeSectionType = (typeof APP_RESUME_SECTION_TYPE)[keyof typeof APP_RESUME_SECTION_TYPE];