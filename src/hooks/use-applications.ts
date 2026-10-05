import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import {
  type ApplicationStatus,
  resolveApplicationStatus,
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

      const applicationIds = data.map((d) => d.id);

      const [generatedResumesResult, generatedCoverLettersResult, appResumesResult] =
        await Promise.all([
          applicationIds.length
            ? supabase
                .from("generated_resumes")
                .select("*")
                .in("application_id", applicationIds)
            : Promise.resolve({ data: [], error: null }),
          applicationIds.length
            ? supabase
                .from("generated_cover_letters")
                .select("*")
                .in("application_id", applicationIds)
            : Promise.resolve({ data: [], error: null }),
          applicationIds.length
            ? supabase
                .from("app_resumes")
                .select("id, application_id, score")
                .in("application_id", applicationIds)
            : Promise.resolve({ data: [], error: null }),
        ]);

      if (generatedResumesResult.error) {
        console.error(
          "Something went wrong loading generated resumes:",
          generatedResumesResult.error,
        );
      }
      if (generatedCoverLettersResult.error) {
        console.error(
          "Something went wrong loading cover letters:",
          generatedCoverLettersResult.error,
        );
      }
      if (appResumesResult.error) {
        console.error(
          "Something went wrong loading app resume scores:",
          appResumesResult.error,
        );
      }

      const generatedResumes = generatedResumesResult.data ?? [];
      const generatedCoverLetters = generatedCoverLettersResult.data ?? [];
      const appResumes = appResumesResult.data ?? [];

      setRows(
        data.map((d) => {
          const appResume = appResumes.find((r) => r.application_id === d.id);
          return {
            ...d,
            generated_resume:
              generatedResumes.find((r) => r.application_id === d.id) ?? null,
            generated_cover_letter:
              generatedCoverLetters.find((c) => c.application_id === d.id) ??
              null,
            app_resume: appResume
              ? { id: appResume.id, score: appResume.score }
              : null,
          };
        }) as ApplicationWithDocuments[],
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

  /** Optimistic: the row moves immediately and rolls back if the save fails. */
  async function updateStatus(
    applicationId: string,
    next: ApplicationStatus,
  ): Promise<boolean> {
    if (!user) return false;
    const previous = rows.find((r) => r.id === applicationId);
    if (!previous) return false;

    const updatedAt = new Date().toISOString();
    setUpdatingId(applicationId);
    setRows((prev) =>
      prev.map((r) =>
        r.id === applicationId ? { ...r, status: next, updated_at: updatedAt } : r,
      ),
    );

    const rollback = () =>
      setRows((prev) =>
        prev.map((r) =>
          r.id === applicationId
            ? { ...r, status: previous.status, updated_at: previous.updated_at }
            : r,
        ),
      );

    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: next, updated_at: updatedAt })
        .eq("id", applicationId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Something went wrong updating status:", error);
        rollback();
        return false;
      }
      return true;
    } catch (err) {
      console.error("Something went wrong updating status:", err);
      rollback();
      return false;
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
    resolveStatus: resolveApplicationStatus,
    deleteApplication,
  };
}
