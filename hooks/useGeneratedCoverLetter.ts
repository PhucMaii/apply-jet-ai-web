import { supabase } from "../src/lib/supabase";

const COVER_LETTERS_BUCKET = "resumes";
const SIGNED_URL_EXPIRY_SEC = 60;

export const useGeneratedCoverLetter = () => {
  const getCoverLetterDownloadUrl = async (
    generatedCoverLetterId: string,
    filename: string,
  ): Promise<string> => {
    const { data: generatedCoverLetterData, error: generatedCoverLetterError } =
      await supabase
        .from("generated_cover_letters")
        .select("file_url")
        .eq("id", generatedCoverLetterId)
        .single();
    if (generatedCoverLetterError) {
      throw new Error(
        generatedCoverLetterError.message ||
          "Failed to get generated cover letter path",
      );
    }

    const trimmed = generatedCoverLetterData.file_url.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    // const downloadName =
    //   trimmed.split("/").filter(Boolean).pop() ?? "cover-letter.pdf";
    const downloadName = filename;
    const { data, error } = await supabase.storage
      .from(COVER_LETTERS_BUCKET)
      .createSignedUrl(trimmed, SIGNED_URL_EXPIRY_SEC, {
        download: downloadName,
      });
    if (error) {
      throw new Error(
        error.message || "Failed to get cover letter download URL",
      );
    }
    if (!data?.signedUrl) {
      throw new Error("No signed URL returned");
    }
    return data.signedUrl;
  };
  return { getCoverLetterDownloadUrl };
};
