/* eslint-disable @typescript-eslint/no-unused-vars */
import { env } from "@/lib/env";
import { preprocessJobDescription } from "./skill-extractor/preprocess";
import { detectSections } from "./skill-extractor/sections";
import type {
  CoverLetter,
  ExtractedSkillsResult,
} from "./skill-extractor/type";
import { matchCandidate } from "./skill-extractor/matching";
import { extractCandidates } from "./skill-extractor/candidates";
import type { SkillCategory } from "./skill-extractor/type";
import { MIN_CONFIDENCE } from "./skill-extractor/constants";
import { supabase } from "./supabase";

const EDGE_FUNCTION_NAME = "generate-resume";

export interface GenerateResumePayload {
  resumeText: string;
  jdText: string;
  targetRole: string;
  userId: string;
  jobUrl: string | null;
  applicationId: string;
}
export interface GenerateCoverLetterPayload {
  jdText: string;
  resumeText: string;
  userId: string;
  jobUrl: string;
  companyName?: string;
  roleTitle?: string;
  hiringManager?: string;
  tone?: "Professional" | "Friendly" | "Direct";
  wordCount?: number; 
  applicationId?: string;
}
export interface FindHRContactsPayload {
  userId: string;
  companyName: string;
  applicationId: string;
  jobTitle: string;
  jobUrl: string;
  jobDescription: string;
}
export interface CoverLetterPayload {
  cover_letter: CoverLetter;
  letter_id: string;
  pdf_url: string;
}

export function extractSkillsFromJobDescription(
  text: string,
): ExtractedSkillsResult {
  const cleaned = preprocessJobDescription(text);
  const sections = detectSections(cleaned);
  const allMatches: Array<
    ReturnType<typeof matchCandidate> & { __nonNull: true }
  > = [];

  for (const section of sections) {
    if (!section.content.trim()) continue;
    const candidates = extractCandidates(section.content, section.weight);
    for (const c of candidates) {
      const m = matchCandidate(c, section.content);
      if (m)
        allMatches.push(
          m as ReturnType<typeof matchCandidate> & { __nonNull: true },
        );
    }
  }

  // Dedupe by canonical (case-insensitive), keep max confidence and canonical form
  const byCanonical = new Map<
    string,
    { confidence: number; category: SkillCategory; canonical: string }
  >();
  for (const m of allMatches) {
    const key = m.canonical.toLowerCase();
    const existing = byCanonical.get(key);
    if (!existing || m.confidence > existing.confidence) {
      byCanonical.set(key, {
        confidence: m.confidence,
        category: m.category,
        canonical: m.canonical,
      });
    }
  }

  const hardSkills: string[] = [];
  const softSkills: string[] = [];
  const tools: string[] = [];
  const qualifications: string[] = [];
  const keywords: string[] = [];
  const normalizedSkills: string[] = [];
  const confidence: Record<string, number> = {};

  const sorted = Array.from(byCanonical.entries()).sort(
    (a, b) => b[1].confidence - a[1].confidence,
  );

  for (const [_, { confidence: conf, category, canonical }] of sorted) {
    if (conf < MIN_CONFIDENCE) continue;
    normalizedSkills.push(canonical);
    confidence[canonical] = conf;
    switch (category) {
      case "hardSkills":
        hardSkills.push(canonical);
        break;
      case "softSkills":
        softSkills.push(canonical);
        break;
      case "tools":
        tools.push(canonical);
        break;
      case "qualifications":
        qualifications.push(canonical);
        break;
      case "keywords":
        keywords.push(canonical);
        break;
    }
  }

  return {
    hardSkills,
    softSkills,
    tools,
    qualifications,
    keywords,
    normalizedSkills,
    confidence,
  };
}

export async function invokeGenerateResume(payload: GenerateResumePayload) {
  const secretKey = env.xsecretkey;
  const jdSkills = await extractSkillsFromJobDescription(payload.jdText || "");

  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
    headers: { "X-Secret-Key": secretKey },
    method: "POST",
    body: {
      resumeText: payload.resumeText,
      jdText: payload.jdText,
      targetRole: payload.targetRole,
      userId: payload.userId,
      jobUrl: payload.jobUrl ?? "",
      jdSkills: jdSkills,
      applicationId: payload.applicationId,
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    data: data as unknown as { ok?: boolean; error?: string },
  };
}

export async function invokeGenerateCoverLetter(
  payload: GenerateCoverLetterPayload,
) {
  console.log(payload, "payload")
  const secretKey = env.xsecretkey;
  const { data, error } = await supabase.functions.invoke(
    env.edgeGenerateCoverLetter,
    {
      headers: { "X-Secret-Key": secretKey },
      body: {
        resumeText: payload.resumeText,
        jdText: payload.jdText,
        userId: payload.userId,
        jobUrl: payload.jobUrl,
        companyName: payload.companyName,
        roleTitle: payload.roleTitle,
        hiringManager: payload.hiringManager,
        tone: payload.tone,
        wordCount: payload.wordCount,
        applicationId: payload.applicationId,
      },
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  const cover_letter = (data as { cover_letter?: unknown })?.cover_letter;

  return {
    cover_letter: cover_letter as CoverLetterPayload["cover_letter"],
    application_id: (data as { application_id?: string })?.application_id,
    letter_id: (data as { letter_id?: string })?.letter_id,
    pdf_url: (data as { pdf_url?: string })?.pdf_url,
  };
}

export async function invokeFindHRContacts(payload: FindHRContactsPayload): Promise<{ ok: boolean; msg: string }> {
  const secretKey = env.xsecretkey;

  const body = {
    userId: payload.userId,
    companyName: payload.companyName,
    applicationId: payload.applicationId,
    jobTitle: payload.jobTitle,
    jobUrl: payload.jobUrl,
    jobDescription: payload.jobDescription,
  };
  const { error } = await supabase.functions.invoke("search-recruiter-email", {
    headers: { "X-Secret-Key": secretKey },
    method: "POST",
    body: body,
  });

  if (error) {
    return {
      ok: false,
      msg: error.message ?? "Failed to find HR contacts",
    };
  }

  return {
    ok: true,
    msg: "HR contacts found successfully",
  };
}

export function filenameFromFileUrl(fileUrl: string, fallback: string): string {
  const trimmed = fileUrl.trim();
  let pathname = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      pathname = new URL(trimmed).pathname;
    } catch {
      pathname = trimmed;
    }
  }
  const base = pathname.split("/").filter(Boolean).pop();
  return base && base.length > 0 ? base : fallback;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadTextContent(content: string, filename: string) {
  triggerBlobDownload(
    new Blob([content], { type: "text/plain;charset=utf-8" }),
    filename,
  );
}

export async function downloadFromUrl(
  url: string,
  filename: string,
): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }
  const blob = await response.blob();
  triggerBlobDownload(blob, filename);
}
