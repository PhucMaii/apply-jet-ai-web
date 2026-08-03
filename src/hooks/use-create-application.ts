import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { APPLICATION_CREATE_VALIDATION } from "@/lib/application-create-copy";
import { applicationDetailPath } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import {
  EMPTY_CREATE_APPLICATION_FORM,
  type CreateApplicationField,
  type CreateApplicationFieldErrors,
  type CreateApplicationForm,
} from "@/types/application-create";
import useEmail from "./use-email";
import { APP_RESUME_SECTION_TYPE, APP_RESUME_STATUS } from "@/lib/enums/resume";
import { buildAppResumeSections, buildHeaderBlock, getUserProfile } from "@/lib/resume";
import { descriptionStringToBullets } from "@/components/applications/resume-builder/app-resume-utils";

export function useCreateApplication() {
  const { user } = useAuth();
  const { sendFirstApplicationEmail } = useEmail();
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateApplicationForm>(
    EMPTY_CREATE_APPLICATION_FORM,
  );
  const [fieldErrors, setFieldErrors] = useState<CreateApplicationFieldErrors>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function patchForm(patch: Partial<CreateApplicationForm>) {
    setForm((prev) => ({ ...prev, ...patch }));
    const clearedKeys = Object.keys(patch) as CreateApplicationField[];
    if (clearedKeys.length === 0) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      for (const key of clearedKeys) {
        delete next[key];
      }
      return next;
    });
  }

  function validateForm(): boolean {
    const errors: CreateApplicationFieldErrors = {};
    if (!form.companyName.trim()) {
      errors.companyName = APPLICATION_CREATE_VALIDATION.companyNameRequired;
    }
    if (!form.jobTitle.trim()) {
      errors.jobTitle = APPLICATION_CREATE_VALIDATION.jobTitleRequired;
    }
    if (!form.jobDescription.trim()) {
      errors.jobDescription =
        APPLICATION_CREATE_VALIDATION.jobDescriptionRequired;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const checkIsFirstApplication = async (userId: string) => {
    const { count } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    return count === 0;
  };

  async function submit() {
    if (!user) return;
    setError(null);
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const isFirstApplication = await checkIsFirstApplication(user.id);
      if (isFirstApplication) {
        await sendFirstApplicationEmail(user.id);
      }

      const { data, error: insertError } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          company_name: form.companyName.trim(),
          job_title: form.jobTitle.trim(),
          job_url: form.jobUrl.trim() || null,
          job_description: form.jobDescription.trim() || null,
          status: "Generated",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error(
          "Something went wrong creating application:",
          insertError,
        );
        setError(insertError.message);
        return;
      }

      if (!data?.id) {
        setError("Application was created but no id was returned.");
        return;
      }

      await initializeAppResume(user.id, data.id);

      navigate(applicationDetailPath(data.id));
    } catch (err) {
      console.error("Something went wrong creating application:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create application.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const initializeAppResume = async (userId: string, applicationId: string) => {
    const {
      userData,
      userLinksArray,
      userExperiencesArray,
      userProjectsArray,
      userSkillsArray,
      userSkillCategoriesArray,
      userEducationArray,
    } = await getUserProfile(userId);
    const hasUserExperiences = userExperiencesArray.length > 0;
    const hasUserProjects = userProjectsArray.length > 0;
    const hasUserEducation = userEducationArray.length > 0;
    const hasUserSkills = userSkillsArray.length > 0;

    // Create app resume based on user info
    const { data: appResumeData, error: appResumeError } = await supabase
      .from("app_resumes")
      .insert({
        user_id: userId,
        application_id: applicationId,
        status: APP_RESUME_STATUS.DRAFT,
      })
      .select("id")
      .single();
    if (appResumeError) {
      throw new Error("Failed to create app resume");
    }

    // Create app resume section
    const sections = buildAppResumeSections(
      appResumeData.id,
      hasUserExperiences,
      hasUserProjects,
      hasUserEducation,
      hasUserSkills,
    );
    const idsMap = new Map<string, string>();
    await Promise.all(
      sections.map(async (section) => {
        const { data: appResumeSectionData, error: appResumeSectionError } =
          await supabase
            .from("app_resume_sections")
            .insert(section)
            .select("id")
            .single();
        if (appResumeSectionError) {
          throw new Error("Failed to create app resume section");
        }

        idsMap.set(section.section_type, appResumeSectionData.id);
      }),
    );

    // Create app resume block
    // Header block
    const headerBlocks = buildHeaderBlock(appResumeData.id, idsMap.get(APP_RESUME_SECTION_TYPE.HEADER)!, form.jobTitle.trim(), userData, userLinksArray);
    await Promise.all(
      headerBlocks.map(async (block) => {
        const { data: appResumeBlockData, error: appResumeBlockError } =
          await supabase
            .from("app_resume_blocks")
            .insert(block)
            .select("id")
            .single();
        if (appResumeBlockError) {
          console.error(appResumeBlockError);
          throw new Error(appResumeBlockError.message);
        }
        return appResumeBlockData.id;
      }),
    );

    // Summary Block
    const summaryBlock = {
      app_resume_id: appResumeData.id,
      section_id: idsMap.get(APP_RESUME_SECTION_TYPE.SUMMARY)!,
      block_type: "rich_text",
      content_json: {
        text: userData.summary,
      },
      sort_key: 0,
      style_json: {
        color: "black",
        fontSize: 12,
      },
    }
    const { error: appResumeBlockError } =
      await supabase
        .from("app_resume_blocks")
        .insert(summaryBlock)
        .select("id")
        .single();
    if (appResumeBlockError) {
      console.error(appResumeBlockError);
      throw new Error(appResumeBlockError.message);
    }

    // Experience Block
    const experienceBlocks = userExperiencesArray.map((experience, index) => ({
      app_resume_id: appResumeData.id,
      section_id: idsMap.get(APP_RESUME_SECTION_TYPE.EXPERIENCE)!,
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
      }
    }));
    await Promise.all(
      experienceBlocks.map(async (block) => {
        const { data: appResumeBlockData, error: appResumeBlockError } =
          await supabase
            .from("app_resume_blocks")
            .insert(block)
            .select("id")
            .single();
        if (appResumeBlockError) {
          console.error(appResumeBlockError);
          throw new Error(appResumeBlockError.message);
        }
        return appResumeBlockData.id;
      }),
    );

    // Projects Block
    const projectsBlocks = userProjectsArray.map((project, index) => ({
      app_resume_id: appResumeData.id,
      section_id: idsMap.get(APP_RESUME_SECTION_TYPE.PROJECTS)!,
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
      }
    }));
    await Promise.all(
      projectsBlocks.map(async (block) => {
        const { data: appResumeBlockData, error: appResumeBlockError } =
          await supabase
            .from("app_resume_blocks")
            .insert(block)
            .select("id")
            .single();
        if (appResumeBlockError) {
          console.error(appResumeBlockError);
          throw new Error(appResumeBlockError.message);
        }
        return appResumeBlockData.id;
      }),
    );

    // Education Block
    const educationBlocks = userEducationArray.map((education, index) => ({
      app_resume_id: appResumeData.id,
      section_id: idsMap.get(APP_RESUME_SECTION_TYPE.EDUCATION)!,
      block_type: "education_entry",
      content_json: {
        school: education.school,
        degree: education.degree,
        start_date: education.start_date,
        end_date: education.end_date,
      },
      sort_key: index,
      style_json: {
        color: "black",
        fontSize: 12,
      },
    }));
    await Promise.all(
      educationBlocks.map(async (block) => {
        const { data: appResumeBlockData, error: appResumeBlockError } =
          await supabase
            .from("app_resume_blocks")
            .insert(block)
            .select("id")
            .single();
        if (appResumeBlockError) {
          console.error(appResumeBlockError);
          throw new Error(appResumeBlockError.message);
        }
        return appResumeBlockData.id;
      }),
    );

    // Skills Block
    const skillsBlocks = userSkillCategoriesArray
      .filter((category) => category.skills.length > 0)
      .map((category, index) => ({
        app_resume_id: appResumeData.id,
        section_id: idsMap.get(APP_RESUME_SECTION_TYPE.SKILLS)!,
        block_type: "skill_category_entry",
        sort_key: index,
        content_json: {
          category_id: category.id,
          name: category.name,
          skills: category.skills.map((skill) => skill.name),
        },
        style_json: {
          color: "black",
          fontSize: 12,
        },
      }));
    await Promise.all(
      skillsBlocks.map(async (block) => {
        const { data: appResumeBlockData, error: appResumeBlockError } =
          await supabase
            .from("app_resume_blocks")
            .insert(block)
            .select("id")
            .single();
        if (appResumeBlockError) {
          console.error(appResumeBlockError);
          throw new Error(appResumeBlockError.message);
        }
        return appResumeBlockData.id;
      }),
    );
  };

  return {
    form,
    patchForm,
    fieldErrors,
    error,
    submitting,
    submit,
    initializeAppResume,
  };
}
