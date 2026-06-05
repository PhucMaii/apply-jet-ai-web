import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import {
  type ApplicationStatus,
  isApplicationStatus,
} from "@/lib/application-status";
import type { ApplicationWithDocuments } from "@/types/database";
import { useGeneratedResume } from "../../hooks/useGeneratedResume";
import { useGeneratedCoverLetter } from "../../hooks/useGeneratedCoverLetter";
import {
  downloadFromUrl,
  downloadTextContent,
} from "@/lib/application-generation";
import type { GeneratedDocumentRow } from "@/types/application-detail";

export function useApplications() {
  const { user } = useAuth();
  const { getResumeDownloadUrl } = useGeneratedResume();
  const { getCoverLetterDownloadUrl } = useGeneratedCoverLetter();

  const [rows, setRows] = useState<ApplicationWithDocuments[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    if (!user) return;
    setLoadError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Something went wrong loading applications:", error);
        setLoadError(error.message);
        setRows([]);
        return;
      }

      const generatedResumes = await supabase
        .from("generated_resumes")
        .select("*")
        .in(
          "application_id",
          data.map((d) => d.id),
        )
        .then((res) => res.data);

      const generatedCoverLetters = await supabase
        .from("generated_cover_letters")
        .select("*")
        .in(
          "application_id",
          data.map((d) => d.id),
        )
        .then((res) => res.data);

      setRows(
        data.map((d) => ({
          ...d,
          generated_resume: generatedResumes?.find(
            (r) => r.application_id === d.id,
          ),
          generated_cover_letter: generatedCoverLetters?.find(
            (c) => c.application_id === d.id,
          ),
        })) as unknown as ApplicationWithDocuments[],
      );
    } catch (err) {
      console.error("Something went wrong loading applications:", err);
      setLoadError(err instanceof Error ? err.message : "Load failed.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  async function updateStatus(applicationId: string, next: ApplicationStatus) {
    if (!user) return;
    setUpdatingId(applicationId);
    setLoadError(null);
    try {
      const { error } = await supabase
        .from("applications")
        .update({
          status: next,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Something went wrong updating status:", error);
        setLoadError(error.message);
        return;
      }

      setRows((prev) =>
        prev.map((r) => (r.id === applicationId ? { ...r, status: next } : r)),
      );
    } catch (err) {
      console.error("Something went wrong updating status:", err);
      setLoadError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function downloadResume(
    application: ApplicationWithDocuments,
    generatedResume: GeneratedDocumentRow,
    companyName: string,
  ) {
    setLoadError(null);
    setDownloading(`resume-${application.id}`);
    try {
      if (generatedResume.file_url) {
        const filename = `${companyName}-resume.pdf`;
        const url = await getResumeDownloadUrl(generatedResume.id, filename);
        await downloadFromUrl(url, filename);
        return;
      }
      downloadTextContent(generatedResume.content, `${companyName}-resume.txt`);
    } catch (err) {
      console.error("Something went wrong downloading generated resume:", err);
      setLoadError(
        err instanceof Error ? err.message : "Failed to download resume.",
      );
    } finally {
      setDownloading(null);
    }
  }

  async function downloadCoverLetter(
    application: ApplicationWithDocuments,
    generatedCoverLetter: GeneratedDocumentRow,
    companyName: string,
  ) {
    setLoadError(null);
    setDownloading(`cover-${application.id}`);
    try {
      const filename = `${companyName}-cover-letter.pdf`;
      const url = await getCoverLetterDownloadUrl(
        generatedCoverLetter.id,
        filename,
      );
      await downloadFromUrl(url, filename);
    } catch (err) {
      console.error("Something went wrong downloading cover letter:", err);
      setLoadError(
        err instanceof Error ? err.message : "Failed to download cover letter.",
      );
    } finally {
      setDownloading(null);
    }
  }

  function resolveStatus(raw: string): ApplicationStatus {
    return isApplicationStatus(raw) ? raw : "Generated";
  }

  const deleteApplication = useCallback(
    async (applicationId: string) => {
      if (!user)
        return { success: false, message: "User is not authenticated" };
      setLoadError(null);
      setDeletingId(applicationId);
      try {
        const { error } = await supabase
          .from("applications")
          .delete()
          .eq("id", applicationId)
          .eq("user_id", user.id);

        if (error) {
          console.error("Something went wrong deleting application:", error);
          setLoadError(error.message);
          return { success: false, message: error.message };
        }

        setRows((prev) => prev.filter((r) => r.id !== applicationId));
        return { success: true, message: "Application deleted successfully" };
      } catch (err) {
        console.error("Something went wrong deleting application:", err);
        const message =
          err instanceof Error ? err.message : "Delete failed.";
        setLoadError(message);
        return { success: false, message };
      } finally {
        setDeletingId(null);
      }
    },
    [user],
  );

  return {
    rows,
    loadError,
    loading,
    updatingId,
    downloading,
    deletingId,

    loadApplications,
    updateStatus,
    downloadResume,
    downloadCoverLetter,
    resolveStatus,  
    deleteApplication,
  };
}
