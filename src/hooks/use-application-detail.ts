import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  type ApplicationStatus,
  isApplicationStatus,
} from "@/lib/application-status";
import { supabase } from "@/lib/supabase";
import type {
  ApplicationDetailForm,
  ApplicationDetailRecord,
  GeneratedDocumentRow,
  RecruiterEmail,
} from "@/types/application-detail";
import type { ApplicationRow } from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import type { AppResume, AppResumeBlock, AppResumeSection } from "@/types/app-resume";

function toForm(row: ApplicationRow): ApplicationDetailForm {
  return {
    id: row.id,
    jobTitle: row.job_title,
    companyName: row.company_name,
    jobUrl: row.job_url ?? "",
    jobDescription: row.job_description ?? "",
  };
}

export function useApplicationDetail(applicationId: string | undefined) {
  const { user } = useAuth();
  const [record, setRecord] = useState<ApplicationDetailRecord | null>(null);
  const [form, setForm] = useState<ApplicationDetailForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingDetails, setSavingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [appResume, setAppResume] = useState<AppResume | null>(null);
  const [appResumeSections, setAppResumeSections] = useState<AppResumeSection[]>([]);
  const [appResumeBlocks, setAppResumeBlocks] = useState<AppResumeBlock[]>([]);

  const {
    data: application,
    isLoading: isLoadingApplication,
    refetch: refetchApplication,
    isRefetching: isRefetchingApplication,
  } = useQuery({
    queryKey: ["application", applicationId],
    queryFn: () => loadApplication({ silent: true }),
    initialData: form,
    enabled: !!applicationId && !!user,
  });

  const loadApplication = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!user || !applicationId) return;
      setError(null);
      if (!options?.silent) {
        setLoading(true);
      }
      try {
        const { data: appRow, error: appErr } = await supabase
          .from("applications")
          .select("*")
          .eq("id", applicationId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (appErr) {
          console.error("Something went wrong loading application:", appErr);
          setError(appErr.message);
          setRecord(null);
          setForm(null);
          return;
        }

        if (!appRow) {
          setError("Application not found.");
          setRecord(null);
          setForm(null);
          return;
        }

        const application = appRow as ApplicationRow;

        const [{ data: resumeRow }, { data: coverRow }] = await Promise.all([
          supabase
            .from("generated_resumes")
            .select("*")
            .eq("application_id", applicationId)
            .maybeSingle(),
          supabase
            .from("generated_cover_letters")
            .select("*")
            .eq("application_id", applicationId)
            .maybeSingle(),
        ]);

        const { data: recruiterEmailsData = [] } = await supabase
          .from("recruiter_emails")
          .select("*")
          .eq("application_id", applicationId);

        const detail: ApplicationDetailRecord = {
          ...application,
          generatedResume: (resumeRow as GeneratedDocumentRow | null) ?? null,
          generatedCoverLetter:
            (coverRow as GeneratedDocumentRow | null) ?? null,
          recruiterEmails: recruiterEmailsData as RecruiterEmail[],
        };

        setRecord(detail);
        setForm(toForm(application));

        return toForm(application);
      } catch (err) {
        console.error("Something went wrong loading application:", err);
        setError(err instanceof Error ? err.message : "Load failed.");
        setRecord(null);
        setForm(null);
      } finally {
        setLoading(false);
      }
    },
    [applicationId, user],
  );

  const fetchAppResume = useCallback(async () => {
    if (!user || !applicationId) return;
    const { data: appResume, error: appResumeError } = await supabase
      .from("app_resumes")
      .select("*")
      .eq("application_id", applicationId)
      .maybeSingle();
    if (appResumeError) {
      console.error("Something went wrong fetching app resume:", appResumeError);
      return;
    }

    const { data: appResumeSections, error: appResumeSectionsError } = await supabase
      .from("app_resume_sections")
      .select("*")
      .eq("app_resume_id", appResume.id);
    if (appResumeSectionsError) {
      console.error("Something went wrong fetching app resume sections:", appResumeSectionsError);
      return;
    }
    
    const { data: appResumeBlocks, error: appResumeBlocksError } = await supabase
      .from("app_resume_blocks")
      .select("*")
      .eq("app_resume_id", appResume.id);
    if (appResumeBlocksError) {
      console.error("Something went wrong fetching app resume blocks:", appResumeBlocksError);
      return;
    }
    
    // Format the data for resume tab
    const formattedAppResume: any = {
      ...appResume,
      sections: appResumeSections.map((section) => ({
        ...section,
        blocks: appResumeBlocks.filter((block) => block.section_id === section.id),
      })),
    }

    console.log(formattedAppResume, "formattedAppResume");
  }, [applicationId, user]);

  useEffect(() => {
    void fetchAppResume();
  }, [fetchAppResume]);

  useEffect(() => {
    void loadApplication();
  }, [loadApplication]);

  async function saveApplication() {
    if (!user || !applicationId || !form) return;
    setSavingDetails(true);
    setError(null);
    setNotice(null);
    try {
      const { error: upErr } = await supabase
        .from("applications")
        .update({
          job_title: form.jobTitle.trim(),
          company_name: form.companyName.trim(),
          job_url: form.jobUrl.trim() || null,
          job_description: form.jobDescription.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .eq("user_id", user.id);

      if (upErr) {
        console.error("Something went wrong saving application:", upErr);
        setError(upErr.message);
        return;
      }

      setNotice("Application details saved.");
      await loadApplication({ silent: true });
    } catch (err) {
      console.error("Something went wrong saving application:", err);
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSavingDetails(false);
    }
  }

  async function updateStatus(next: ApplicationStatus) {
    if (!user || !applicationId) return;
    setUpdatingStatus(true);
    setError(null);
    try {
      const { error: upErr } = await supabase
        .from("applications")
        .update({
          status: next,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .eq("user_id", user.id);

      if (upErr) {
        console.error("Something went wrong updating status:", upErr);
        setError(upErr.message);
        return;
      }

      setRecord((prev) => (prev ? { ...prev, status: next } : prev));
    } catch (err) {
      console.error("Something went wrong updating status:", err);
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  function resolveStatus(raw: string): ApplicationStatus {
    return isApplicationStatus(raw) ? raw : "Generated";
  }

  function patchForm(patch: Partial<ApplicationDetailForm>) {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  return {
    application,
    isLoadingApplication,

    record,
    form,
    loading,
    savingDetails,
    updatingStatus,
    error,
    notice,
    isRefetchingApplication,
    appResume,
    appResumeSections,
    appResumeBlocks,
    
    setNotice,
    loadApplication,
    refetchApplication,
    saveApplication,
    updateStatus,
    resolveStatus,
    patchForm,
  };
}
