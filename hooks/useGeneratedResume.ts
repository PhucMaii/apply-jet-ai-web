import { supabase } from "../src/lib/supabase";

const RESUMES_BUCKET = "resumes";
const SIGNED_URL_EXPIRY_SEC = 60;
export const useGeneratedResume = () => {
  const getResumeDownloadUrl = async (
    generatedResumeId: string,
    filename: string,
  ): Promise<string> => {
    // Get the generated resume path from the database
    const { data: generatedResumeData, error: generatedResumeError } = await supabase
      .from("generated_resumes")
      .select("file_url")
      .eq("id", generatedResumeId)
      .single();
    if (generatedResumeError) {
      throw new Error(generatedResumeError.message || "Failed to get generated resume path");
    }
    const generatedResumePath = generatedResumeData.file_url;

    const trimmed = generatedResumePath.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    // const downloadName =
    //   trimmed.split("/").filter(Boolean).pop() ?? "resume.pdf";
    const downloadName = filename;
    const { data, error } = await supabase.storage
      .from(RESUMES_BUCKET)
      .createSignedUrl(trimmed, SIGNED_URL_EXPIRY_SEC, {
        download: downloadName,
      });

    console.log("data", data);
    if (error) {
      throw new Error(error.message || "Failed to get download URL");
    }
    if (!data?.signedUrl) {
      throw new Error("No signed URL returned");
    }

    // Update generated_resume status to "downloaded"
    const { error: updateGeneratedResumeError } = await supabase
      .from("generated_resumes")
      .update({ status: "downloaded" })
      .eq("id", generatedResumeId);
    if (updateGeneratedResumeError) {
      throw new Error(
        updateGeneratedResumeError.message ||
          "Failed to update generated resume status",
      );
    }
    return data.signedUrl;
  };

  return { getResumeDownloadUrl };
};