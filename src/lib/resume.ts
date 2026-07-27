import { pdfFileToBase64Images } from "@/lib/pdf-to-images";
import { supabase } from "@/lib/supabase";
import { env } from "./env";
import type { UserEducationRow, UserLinkRow, UserProfileRow, UserProjectRow, UserSkillRow, UserWorkExperienceRow } from "@/types/database";
import { APP_RESUME_SECTION_TYPE } from "./enums/resume";
import type { AppResumeSection } from "@/types/app-resume";

export const RESUMES_BUCKET = "resumes";

function isPdf(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

export interface ResumeKeywordsRow {
  hardSkills: string[];
  softSkills: string[];
  tools: string[];
}

export interface ResumeRow {
  id: string;
  user_id: string;
  title: string | null;
  original_file_url: string | null;
  parsed_text: string | null;
  keywords?: ResumeKeywordsRow | null;
  created_at: string;
  updated_at: string;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function getAllowedAccept(): string {
  return ".pdf,.doc,.docx";
}

export function isAllowedFile(
  file: File,
): { ok: true; error: null } | { ok: false; error: string } {
  if (
    !ALLOWED_TYPES.includes(file.type) &&
    !file.name.match(/\.(pdf|doc|docx)$/i)
  ) {
    return {
      ok: false,
      error: "Please upload a PDF or Word document (.pdf, .doc, .docx).",
    };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, error: "File must be 5 MB or smaller." };
  }
  return { ok: true, error: null };
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

/**
 * Get the current resume for a user (single resume per user – returns latest by updated_at).
 */
export async function getResume(userId: string): Promise<ResumeRow | null> {
  const { data } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as ResumeRow;
}

/**
 * Upload file to Supabase Storage and create or update the resume row.
 * One resume per user: if one exists we update it, otherwise we insert.
 */
export async function uploadResume(
  userId: string,
  file: File,
): Promise<
  | { resume: ResumeRow; error: null }
  | { resume: null; error: string }
  | { resume: ResumeRow; error: string }
> {
  const check = isAllowedFile(file);
  if (!check.ok) return { resume: null, error: check.error };

  const safeName = sanitizeFileName(file.name);
  const timestamp = Date.now();
  const storagePath = `${userId}/${timestamp}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(RESUMES_BUCKET)
    .upload(storagePath, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error("[Resume] storage upload error:", uploadError);
    return {
      resume: null,
      error:
        "Upload failed. Check that the resumes bucket exists and RLS allows access.",
    };
  }

  const { data: urlData } = supabase.storage
    .from(RESUMES_BUCKET)
    .getPublicUrl(storagePath);
  const originalFileUrl = urlData.publicUrl;

  const title = file.name.replace(/\.[^/.]+$/, "") || "Resume";

  const existing = await getResume(userId);
  let resumeRow: ResumeRow;

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("resumes")
      .update({
        title,
        original_file_url: originalFileUrl,
        parsed_text: existing.parsed_text ?? "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (updateError) {
      console.error("[Resume] update error:", updateError);
      return { resume: null, error: "Failed to update resume record." };
    }
    resumeRow = updated as ResumeRow;
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("resumes")
      .insert({
        user_id: userId,
        title,
        original_file_url: originalFileUrl,
        parsed_text: "",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Resume] insert error:", insertError);
      return { resume: null, error: "Failed to create resume record." };
    }
    resumeRow = inserted as ResumeRow;
  }

  if (isPdf(file)) {
    try {
      const base64Images = await pdfFileToBase64Images(file);
      if (base64Images.length === 0) {
        return { resume: resumeRow, error: null };
      }
      //   const ocrResult = await extractTextFromImages(base64Images)
      const { data: ocrResult, error: ocrError } =
        await supabase.functions.invoke("extract-text", {
          headers: {
            "X-Secret-Key": env.xsecretkey,
          },
          body: {
            images: base64Images,
            userId: userId,
          },
        });

      console.log("ocrResult", { ocrResult, ocrError });
      if (ocrError) {
        console.error("[Resume] Vision OCR error:", ocrError);
        return { resume: resumeRow, error: ocrError.message };
      }
      const { error: updateOcrError } = await supabase
        .from("resumes")
        .update({
          parsed_text: ocrResult.text,
          updated_at: new Date().toISOString(),
        })
        .eq("id", resumeRow.id);

      if (updateOcrError) {
        console.error("[Resume] update parsed_text error:", updateOcrError);
        return { resume: resumeRow, error: "Failed to save extracted text." };
      }
      resumeRow = {
        ...resumeRow,
        parsed_text: ocrResult.text,
        updated_at: new Date().toISOString(),
      };
    } catch (e) {
      console.error("[Resume] OCR failed:", e);
      return { resume: resumeRow, error: "Failed to extract text from PDF." };
    }
  }

  return { resume: resumeRow, error: null };
}

export const prefillResume = async (userId: string) => {
  const { data, error } = await supabase.functions.invoke(
    "prefill-with-resume",
    {
      body: { userId },
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getUserProfile = async (userId: string) => {
  // Get user info
  const { data: userData } = await supabase.from("users").select("*").eq("id", userId).single();
  if (!userData) {
    throw new Error("User not found");
  }

  // Get user links
  const { data: userLinks, error: userLinksError } = await supabase.from("user_links").select("*").eq("user_id", userId);
  if (userLinksError) {
    throw new Error("Failed to get user links");
  }
  const userLinksArray = userLinks as UserLinkRow[];
  if (!userLinksArray) {
    throw new Error("User links not found");
  }

  // Get user experiences
  const { data: userExperiences, error: userExperiencesError } = await supabase.from("user_work_experiences").select("*").eq("user_id", userId);
  if (userExperiencesError) {
    throw new Error("Failed to get user experiences");
  }
  const userExperiencesArray = userExperiences as UserWorkExperienceRow[];
  if (!userExperiencesArray) {
    throw new Error("User experiences not found");
  }

  // Get user projects
  const { data: userProjects, error: userProjectsError } = await supabase.from("user_projects").select("*").eq("user_id", userId);
  if (userProjectsError) {
    throw new Error("Failed to get user projects");
  }
  const userProjectsArray = userProjects as UserProjectRow[];
  if (!userProjectsArray) {
    throw new Error("User projects not found");
  }

  // Get user skills
  const { data: userSkills, error: userSkillsError } = await supabase.from("user_skills").select("*").eq("user_id", userId);
  if (userSkillsError) {
    throw new Error("Failed to get user skills");
  }
  const userSkillsArray = userSkills as UserSkillRow[];
  if (!userSkillsArray) {
    throw new Error("User skills not found");
  }
  
  // Get user education
  const { data: userEducation, error: userEducationError } = await supabase.from("user_educations").select("*").eq("user_id", userId);
  if (userEducationError) {
    throw new Error("Failed to get user education");
  }
  const userEducationArray = userEducation as UserEducationRow[];
  if (!userEducationArray) {
    throw new Error("User education not found");
  }

  return {
    userData,
    userLinksArray,
    userExperiencesArray,
    userProjectsArray,
    userSkillsArray,
    userEducationArray,
  };
}

export const buildAppResumeSections = (appResumeId: string, hasUserExperiences: boolean, hasUserProjects: boolean, hasUserEducation: boolean, hasUserSkills: boolean) => {
  const sections = [
    {
      app_resume_id: appResumeId,
      section_type: APP_RESUME_SECTION_TYPE.HEADER,
      display_name: 'Header',
      sort_key: 0,
    },
    {
      app_resume_id: appResumeId,
      section_type: APP_RESUME_SECTION_TYPE.SUMMARY,
      display_name: 'Summary',
      sort_key: 1,
    },
    hasUserExperiences && {
      app_resume_id: appResumeId,
      section_type: APP_RESUME_SECTION_TYPE.EXPERIENCE,
      display_name: 'Experience',
      sort_key: 2,
    },
    hasUserProjects && {
      app_resume_id: appResumeId,
      section_type: APP_RESUME_SECTION_TYPE.PROJECTS,
      display_name: 'Projects',
      sort_key: 3,
    },
    hasUserEducation && {
      app_resume_id: appResumeId,
      section_type: APP_RESUME_SECTION_TYPE.EDUCATION,
      display_name: 'Education',
      sort_key: 4,
    },
    hasUserSkills && {
      app_resume_id: appResumeId,
      section_type: APP_RESUME_SECTION_TYPE.SKILLS,
      display_name: 'Skills',
      sort_key: 5,
    },
  ].filter(Boolean) as AppResumeSection[];

  return sections;
}

export const buildHeaderBlock = (appResumeSectionId: string, job_title: string, userData: UserProfileRow, userLinksArray: UserLinkRow[]) => {
  const headerBlocks = [
    {
      section_id: appResumeSectionId,
      block_type: "rich_text",
      content_json: {
        text: userData.full_name,
      },
      sort_key: 0,
      style_json: {
        bold: true,
        color: "black",
        fontSize: 16,
      },
    },
    {
      section_id: appResumeSectionId,
      block_type: "rich_text",
      content_json: {
        text: job_title,
      },
      sort_key: 1,
      style_json: {
        bold: true,
        color: "black",
        fontSize: 12,
      },
    },
    {
      section_id: appResumeSectionId,
      block_type: "group_text",
      sort_key: 2,
      content_json: {
        texts: [
          userData?.city &&
            userData?.province && {
              text: `${userData.city}, ${userData.province}`,
              style_json: {
                color: "black",
                fontSize: 8,
              },
            },
          userData?.phone && {
            text: `| ${userData.phone}`,
            style_json: {
              color: "black",
              fontSize: 8,
            },
          },
          userData?.email && {
            text: `| ${userData.email}`,
            style_json: {
              color: "black",
              fontSize: 8,
            },
          },
          ...userLinksArray
            .filter((link) => link.url)
            .map((link) => ({
              text: `| ${link.url}`,
              style_json: {
                color: "black",
                fontSize: 8,
              },
            })),
        ].filter(Boolean),
      },
    },
  ];

  return headerBlocks;
}