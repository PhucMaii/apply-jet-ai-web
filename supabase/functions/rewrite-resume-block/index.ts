/**
 * Rewrite a single app_resume_blocks row to better match a job description.
 *
 * Body: { blockId, appResumeId, jdText }
 * Returns: { blockId, blockType, sectionType, content_json, changes }
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsonResponse } from "../_shared/stripe-cors.ts";
import {
  HUMAN_CV_VOICE_RULES,
  sanitizeHumanResumeText,
} from "../_shared/humanize-resume-text.ts";
import { createHash } from "node:crypto";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (name: string) => string | undefined };
};

const GEMINI_PRIMARY_MODEL = "gemini-3.8-flash";
const GEMINI_FAILOVER_MODEL = "gemini-3.1-flash-lite";
const GEMINI_MODELS = [GEMINI_PRIMARY_MODEL, GEMINI_FAILOVER_MODEL] as const;
const GEMINI_MAX_ATTEMPTS_PER_MODEL = 2;

const geminiGenerateUrl = (model: string, apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

function isRetryableGeminiStatus(status: number): boolean {
  return status === 429 || status === 503 || status === 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number): number {
  const base = 500 * 2 ** attempt;
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

const MAX_NEW_BULLETS = 2;
const MAX_REMOVED_BULLETS = 2;

type BlockType =
  | "rich_text"
  | "group_text"
  | "job_entry"
  | "project_entry"
  | "education_entry"
  | "skill_entry"
  | "skill_category_entry";

interface AppResumeBlockRow {
  id: string;
  app_resume_id: string;
  section_id: string;
  block_type: BlockType | string;
  sort_key: number;
  content_json: Record<string, unknown>;
  style_json: Record<string, unknown> | null;
}

interface AppResumeSectionRow {
  id: string;
  app_resume_id: string;
  display_name: string;
  section_type: string;
  sort_key: number;
}

interface BulletChange {
  from: string;
  to: string;
}

interface RewriteChanges {
  summary: string;
  added_bullets?: string[];
  removed_bullets?: string[];
  rewritten_bullets?: BulletChange[];
}

interface RewriteResult {
  blockId: string;
  blockType: string;
  sectionType: string;
  content_json: Record<string, unknown>;
  changes: RewriteChanges;
  applied?: boolean;
}

interface RewriteResumeBlockBody {
  userId: string;
  blockId: string;
  appResumeId: string;
  jdText: string;
  /** When true, write normalized content_json back to app_resume_blocks. */
  apply?: boolean;
}

/**
 * Craft rules distilled from career-center / ATS guidance.
 * Same bar for studio rewrites and job-board tailor.
 */
const RESUME_CRAFT_RULES = `RESUME CRAFT STANDARDS (follow these; they beat generic "sound professional" advice)

${HUMAN_CV_VOICE_RULES}

SUMMARY (rich_text / summary)
- 2-4 short lines, roughly 35-70 words. Not a biography. Not an objective statement.
- Lead with who they are for THIS role (title/domain + years or scope if already in the resume).
- Mirror 2-4 exact nouns/tools from the JD that the resume already supports.
- Prefer fragments or tight third-person phrasing without "I/me/my" (ATS-friendly).
- Every claim must be defendable in an interview. No soft traits without proof ("detail-oriented").

EXPERIENCE BULLETS (job_entry)
- Formula: Accomplish X by doing Y to get outcome Z, when Z is known from the source.
- Prefer impact verbs (built, cut, shipped, led, designed) over duty verbs (responsible for, assisted, helped, worked on).
- Vary opening verbs within a role. Never start three bullets with the same verb.
- Front-load the JD-relevant skill or result in the first 4-6 words (6-10 second skim).
- Keep numbers that already exist; never invent metrics. If the bullet is vague ("improved performance") but the work is real, tighten the X/Y wording and leave Z unquantified rather than fabricating a %.
- Typically 3-5 strong bullets per role. Drop weak duty-list lines rather than padding.
- Put JD keywords inside real accomplishment sentences, never as comma dumps.
- Do not invent "100%" claims or absolute guarantees.

SKILLS (skill_category_entry)
- Prioritize hard skills / tools / methods the JD names that the resume already supports.
- Keep category name unless a light rename improves clarity (e.g. "Tools" to "Tools & Platforms").
- Prefer exact JD spelling when truthful (e.g. "PostgreSQL" not "Postgres" if JD says PostgreSQL).
- 6-12 skills per category max when possible; drop fluff soft skills unless the JD explicitly requires them.
- Do not invent tools, certifications, or languages with no resume evidence.
- NEVER duplicate skills. Case-insensitive uniqueness is mandatory (React and react still count as one).
- Prefer reorder/rename of an existing skill over adding a near-duplicate (Node / Node.js / nodejs: keep one).
- Do not append JD keywords that are already listed in this category.`;

interface GeminiRewritePayload {
  content_json: Record<string, unknown>;
  changes: RewriteChanges;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return jsonResponse({ message: "OK" }, 200);
  }

  const secretKey = Deno.env.get("X-SECRET-KEY");
  const xsecretkey = req.headers.get("X-Secret-Key");
  if (!secretKey || xsecretkey !== secretKey) {
    console.error(
      "Something went wrong: unauthorized rewrite-resume-block call",
      {
        hasSecretEnv: Boolean(secretKey),
        hasSecretHeader: Boolean(xsecretkey),
        secretsMatch: Boolean(
          secretKey && xsecretkey && secretKey === xsecretkey,
        ),
      },
    );
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  try {
    let body: RewriteResumeBlockBody;
    try {
      body = await req.json();
      if (!body?.userId || !body?.blockId || !body?.appResumeId || !body?.jdText) {
        console.error("Something went wrong: missing required rewrite-resume-block fields", {
          bodyKeys: Object.keys(body ?? {}),
        });
        return jsonResponse({ error: "Missing required fields: userId, blockId, appResumeId, jdText" }, 400);
      }
    } catch (parseError) {
      console.error(
        "Something went wrong parsing rewrite-resume-block request JSON:",
        parseError,
      );
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "Something went wrong: Supabase env is not configured for rewrite-resume-block",
        {
          hasSupabaseUrl: Boolean(supabaseUrl),
          hasServiceRoleKey: Boolean(serviceRoleKey),
        },
      );
      return jsonResponse({ error: "Supabase env is not configured" }, 500);
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Guard user usage of this function
    const { error: guardError } = await supabase.functions.invoke("ai-generations-guard", {
      body: {
        userId: body?.userId as string,
        guard_type: 'ai_generations'
      },
      headers: {
        "X-Secret-Key": secretKey,
      },
    });

    if (guardError) {
      const errorMsg = await guardError.context?.json() || "Failed to invoke ai-generations-guard."
      console.error("Something went wrong invoking ai-generations-guard:", errorMsg);
      return jsonResponse({ error: errorMsg.error }, 500);
    }

    const blockId =
      typeof body?.blockId === "string" ? body.blockId.trim() : "";
    const appResumeId =
      typeof body?.appResumeId === "string" ? body.appResumeId.trim() : "";
    const jdText = typeof body?.jdText === "string" ? body.jdText.trim() : "";

    if (!blockId || !appResumeId || !jdText) {
      console.error(
        "Something went wrong: missing required rewrite-resume-block fields",
        {
          hasBlockId: Boolean(blockId),
          hasAppResumeId: Boolean(appResumeId),
          hasJdText: Boolean(jdText),
          bodyKeys: Object.keys(body ?? {}),
        },
      );
      return jsonResponse(
        { error: "Missing required fields: blockId, appResumeId, jdText" },
        400,
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error(
        "Something went wrong: GEMINI_API_KEY is not set for rewrite-resume-block",
      );
      return jsonResponse({ error: "GEMINI_API_KEY is not set" }, 500);
    }


    const { data: block, error: blockError } = await supabase
      .from("app_resume_blocks")
      .select("*")
      .eq("id", blockId)
      .eq("app_resume_id", appResumeId)
      .single();

    if (blockError || !block) {
      console.error("Something went wrong fetching app resume block:", {
        blockId,
        appResumeId,
        blockError,
        hasBlock: Boolean(block),
      });
      return jsonResponse({ error: "Block not found" }, 404);
    }

    const typedBlock = block as AppResumeBlockRow;

    const { data: section, error: sectionError } = await supabase
      .from("app_resume_sections")
      .select("id, app_resume_id, display_name, section_type, sort_key")
      .eq("id", typedBlock.section_id)
      .single();

    if (sectionError || !section) {
      console.error("Something went wrong fetching app resume section:", {
        blockId,
        sectionId: typedBlock.section_id,
        sectionError,
        hasSection: Boolean(section),
      });
      return jsonResponse({ error: "Section not found" }, 404);
    }

    const typedSection = section as AppResumeSectionRow;

    const { data: contextBlocks, error: contextError } = await supabase
      .from("app_resume_blocks")
      .select("id, block_type, content_json, section_id, sort_key")
      .eq("app_resume_id", appResumeId)
      .order("sort_key", { ascending: true });

    if (contextError) {
      console.error("Something went wrong fetching resume context blocks:", {
        appResumeId,
        contextError,
      });
      return jsonResponse({ error: "Failed to load resume context" }, 500);
    }

    const { data: contextSections, error: sectionsError } = await supabase
      .from("app_resume_sections")
      .select("id, display_name, section_type, sort_key")
      .eq("app_resume_id", appResumeId)
      .order("sort_key", { ascending: true });

    if (sectionsError) {
      console.error("Something went wrong fetching resume context sections:", {
        appResumeId,
        sectionsError,
      });
      return jsonResponse({ error: "Failed to load resume sections" }, 500);
    }

    const resumeContext = buildResumeContext(
      (contextSections as AppResumeSectionRow[] | null) ?? [],
      (contextBlocks as AppResumeBlockRow[] | null) ?? [],
    );

    const prompt = buildRewritePrompt({
      jdText,
      block: typedBlock,
      section: typedSection,
      resumeContext,
    });

    const aiPayload = await callGeminiForRewrite(apiKey, prompt, appResumeId, blockId);
    if (!aiPayload) {
      console.error(
        "Something went wrong generating rewrite payload from Gemini",
        {
          blockId,
          appResumeId,
          blockType: typedBlock.block_type,
          sectionType: typedSection.section_type,
        },
      );
      return jsonResponse({ error: "generation_failed" }, 502);
    }

    let contentJson: Record<string, unknown>;
    try {
      contentJson = normalizeContentJson(
        typedBlock.block_type,
        typedBlock.content_json,
        aiPayload.content_json,
      );
    } catch (normalizeError) {
      console.error("Something went wrong normalizing rewrite content_json:", {
        blockId,
        blockType: typedBlock.block_type,
        normalizeError,
        suggestedContentJson: aiPayload.content_json,
      });
      return jsonResponse({ error: "normalize_failed" }, 502);
    }

    const changes = normalizeChanges(aiPayload.changes);

    const shouldApply = body.apply === true;

    if (shouldApply) {
      const { error: applyError } = await supabase
        .from("app_resume_blocks")
        .update({
          content_json: contentJson,
          updated_at: new Date().toISOString(),
        })
        .eq("id", typedBlock.id)
        .eq("app_resume_id", appResumeId);

      if (applyError) {
        console.error("Something went wrong applying rewrite to block:", {
          blockId: typedBlock.id,
          appResumeId,
          applyError,
        });
        return jsonResponse({ error: "Failed to save rewritten block" }, 500);
      }
    }

    const result: RewriteResult = {
      blockId: typedBlock.id,
      blockType: typedBlock.block_type,
      sectionType: typedSection.section_type,
      content_json: contentJson,
      changes,
      applied: shouldApply,
    };

    // increment usage
    const { error: incrementUsageError } = await supabase.functions.invoke("increment-usage", {
      body: {
        userId: body?.userId as string,
        guardType: "ai_generations",
      },
      headers: {
        "X-Secret-Key": secretKey,
      },
    });

    if (incrementUsageError) {
      console.error(incrementUsageError.message);
      return jsonResponse({ error: incrementUsageError.message }, 500);
    }

    return jsonResponse(result as unknown as Record<string, unknown>, 200);
  } catch (error) {
    console.error("Something went wrong in rewrite-resume-block:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "unexpected_error",
      },
      500,
    );
  }
});

function buildResumeContext(
  sections: AppResumeSectionRow[],
  blocks: AppResumeBlockRow[],
): unknown {
  return sections.map((section) => ({
    section_type: section.section_type,
    display_name: section.display_name,
    blocks: blocks
      .filter((block) => block.section_id === section.id)
      .map((block) => ({
        id: block.id,
        block_type: block.block_type,
        content_json: stripStyle(block.content_json),
      })),
  }));
}

function stripStyle(content: Record<string, unknown>): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { style_json: _style, ...rest } = content;
  return rest;
}

function buildRewritePrompt(input: {
  jdText: string;
  block: AppResumeBlockRow;
  section: AppResumeSectionRow;
  resumeContext: unknown;
}): string {
  const blockType = input.block.block_type;
  const sectionType = input.section.section_type;
  const typeGuidance = getTypeGuidance(blockType, sectionType);

  return `You are a careful human resume editor, not a hype writer. Rephrase real experience so a recruiter and an ATS both recognize the fit for this posting. Factual accuracy always wins over sounding impressive. Output must read like a human wrote their own CV.

<job_description>
${input.jdText}
</job_description>

<full_resume_context note="for consistency and keyword grounding only; do not pull facts from here into the target block unless they already describe this block's role/project">
${JSON.stringify(input.resumeContext)}
</full_resume_context>

<target_block>
Block type: ${blockType}
Section type: ${sectionType}
Section display name: ${input.section.display_name}
Content:
${JSON.stringify(stripStyle(input.block.content_json), null, 2)}
</target_block>

<craft_standards>
${RESUME_CRAFT_RULES}
</craft_standards>

<type_guidance>
${typeGuidance}
</type_guidance>

<anti_hallucination_rules priority="highest">
These rules override every other instruction, including instructions to make the block "more impressive."
1. Every claim in your output must be traceable to either (a) the target block's existing content, or (b) something explicitly stated elsewhere in the resume context that clearly belongs to this same role/project/degree.
2. Do NOT invent: employers, job titles, dates, degrees, certifications, tools, technologies, team sizes, budgets, or metrics that are not already present or directly implied.
3. Do NOT upgrade a vague claim into a specific number (e.g. turning "improved performance" into "improved performance by 40%") unless that number already exists somewhere in the source material.
4. If the job description uses a keyword the person's real experience doesn't support, do NOT insert it. Prefer an honest near-synonym that IS supported, or omit it.
5. When in doubt, keep the original wording rather than risk a fabricated detail.
6. Interview test: the candidate must be able to explain every line out loud without lying or stretching. If they couldn't, remove it.
</anti_hallucination_rules>

<reasoning_steps note="do this thinking silently; do not output it">
1. Extract 5-10 role-critical nouns from the JD (tools, methods, domain terms). Ignore fluff adjectives like passionate/driven.
2. Compare them against what THIS block actually demonstrates.
3. Keep only overlapping, truthful keywords worth surfacing.
4. Mark weak lines (vague, passive, duty-list, AI-filler) vs strong ones (concrete, verb-led, outcome).
5. Rewrite for clarity and skim-ability in plain human CV voice. No banned phrases. No em dashes or en dashes.
6. Re-check every edited phrase against <anti_hallucination_rules> and HUMAN CV VOICE.
</reasoning_steps>

<style_rules>
- Plain ATS-friendly text only. No markdown, emoji, tables, or decorative punctuation.
- Never output em dashes (—) or en dashes (–). Use commas, periods, or plain hyphens for dates/compounds only.
- Recruiter skim (6-10 seconds): front-load the useful word or result.
- Keyword once, naturally. Never stuff or dump a skill list into a bullet.
- Match tense/voice of the surrounding resume.
- Bullet arrays: typically 3-5 focused lines. Add at most ${MAX_NEW_BULLETS} new bullets and remove at most ${MAX_REMOVED_BULLETS} weak ones.
- Preserve factual anchors as-is: company, school, degree, job title, project name, dates, unless fixing an obvious typo.
- Never include style_json in content_json.
- If the block is already strong, return a lightly polished version and say so in changes.summary. Do not manufacture changes.
</style_rules>

<output_format>
Return ONLY valid JSON (no markdown fences, no commentary before or after) with this exact shape:
{
  "content_json": { ...same schema as the target block... },
  "changes": {
    "summary": "1-2 plain sentences on what changed and which truthful JD terms were used",
    "added_bullets": ["optional new bullets"],
    "removed_bullets": ["optional removed original bullets"],
    "rewritten_bullets": [{ "from": "original", "to": "rewritten" }]
  }
}
</output_format>

Final checks before responding:
1) Every added word/number/keyword traces to <target_block> or the matching part of <full_resume_context>.
2) No banned AI-sounding phrases remain. No em/en dashes remain.
3) You would be comfortable reading every line aloud as the candidate. If any check fails, revise before outputting.`;
}

function getTypeGuidance(blockType: string, sectionType: string): string {
  switch (blockType) {
		case "rich_text":
			return `BLOCK GUIDANCE (${sectionType} / rich_text)
- content_json must be: { "text": "..." }
- Write a tight professional summary: 2-4 lines / ~35-70 words.
- Structure: (1) who they are for this role, (2) strongest matching strengths already in the resume, (3) one concrete proof point if available.
- Mirror exact JD nouns the resume already supports. Do not paste the job title as a fake identity.
- No first person. No objective ("seeking a role…"). No soft-trait filler.
- No em dashes or en dashes in the text.
- If the current text is empty, GENERATE a summary from resume context + JD using only grounded facts.`;

    case "job_entry":
      return `BLOCK GUIDANCE (experience / job_entry)
- content_json must be:
{
  "title": "string",
  "company": "string",
  "start_date": "string|null",
  "end_date": "string|null",
  "description": ["bullet", "..."]
}
- Rewrite bullets with Action + context/tools + outcome (when known). Prefer impact over duties.
- Emphasize work that overlaps this JD; demote or drop irrelevant duties.
- You may add at most ${MAX_NEW_BULLETS} grounded bullets or remove at most ${MAX_REMOVED_BULLETS} weak ones.
- Quantify ONLY with numbers already present or clearly implied. Never invent %.
- Vary action verbs. Ban "Responsible for / Assisted with / Helped with / Worked on" openers.
- No em dashes or en dashes in bullets.
- Populate changes.added_bullets / removed_bullets / rewritten_bullets accordingly.`;

    case "project_entry":
      return `BLOCK GUIDANCE (projects / project_entry)
- content_json must be:
{
  "name": "string",
  "description": ["bullet", "..."],
  "start_date": "string|null",
  "end_date": "string|null"
}
- Same bullet craft as experience: Action + context/tools + outcome when known.
- Keep the project name unless polishing wording only.
- Only add tools/methods that already appear for this project or elsewhere as belonging to it.`;

    case "education_entry":
      return `BLOCK GUIDANCE (education / education_entry)
- content_json must be:
{
  "school": "string",
  "degree": "string",
  "start_date": "string|null",
  "end_date": "string|null"
}
- Polish degree wording for clarity/ATS (expand abbreviations carefully).
- Do not invent schools, degrees, GPAs, or coursework.
- If no bullet array exists, do not invent one.`;

    case "skill_category_entry":
      return `BLOCK GUIDANCE (skills / skill_category_entry)
- content_json must be:
{
  "category_id": "string",
  "name": "string",
  "skills": ["skill", "..."]
}
- Keep category_id exactly as provided.
- Start from the existing skills list. Reorder so JD-critical skills come first.
- Add a skill ONLY if (1) resume context clearly supports it AND (2) it is not already in this list under any casing/alias.
- If a JD term matches an existing skill, keep/rename that one entry — do not add a second copy.
- Prefer JD-exact spelling when truthful. Drop soft-skill fluff unless the JD requires it.
- Aim for a focused list (roughly 6–12), with zero duplicates.`;

    case "skill_entry":
      return `BLOCK GUIDANCE (skills / skill_entry)
- content_json must be:
{
  "name": "string",
  "categoryId": number,
  "categoryName": "string"
}
- Polish skill naming for ATS (canonical / JD-exact spelling when truthful). Keep ids consistent.`;

    case "group_text":
      return `BLOCK GUIDANCE (group_text)
- content_json must be: { "texts": [{ "text": "..." }, ...] }
- Polish each text item in plain human language; keep the same number of items unless one is empty/useless.`;

    default:
      return `BLOCK GUIDANCE
- Return content_json with the same keys as the input block.
- Improve clarity and honest JD alignment without changing schema.`;
  }
}

async function callGeminiForRewrite(
  apiKey: string,
  prompt: string,
  appResumeId: string,
  blockId: string,
): Promise<GeminiRewritePayload | null> {
  const requestBody = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      // Lower temp keeps wording plainer and reduces AI-hype flourishes.
      temperature: 0.25,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < GEMINI_MAX_ATTEMPTS_PER_MODEL; attempt++) {
      if (attempt > 0) {
        await sleep(backoffMs(attempt - 1));
      }

      let response: Response;
      try {
        response = await fetch(geminiGenerateUrl(model, apiKey), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        });
      } catch (fetchError) {
        console.error(
          "Something went wrong fetching Gemini for rewrite-resume-block:",
          { model, attempt, fetchError },
        );
        if (attempt < GEMINI_MAX_ATTEMPTS_PER_MODEL - 1) continue;
        break;
      }

      if (!response.ok) {
        const details = await response.text();
        console.error("Something went wrong calling Gemini:", {
          model,
          attempt,
          status: response.status,
          statusText: response.statusText,
          details,
        });
        if (
          isRetryableGeminiStatus(response.status) &&
          attempt < GEMINI_MAX_ATTEMPTS_PER_MODEL - 1
        ) {
          continue;
        }
        // Fail over to next model on capacity / server errors.
        if (isRetryableGeminiStatus(response.status)) break;
        return null;
      }

      let data: {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
          finishReason?: unknown;
        }>;
        promptFeedback?: unknown;
        usageMetadata?: {
          promptTokenCount?: number;
          candidatesTokenCount?: number;
        };
      };
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error(
          "Something went wrong parsing Gemini HTTP JSON response:",
          { model, attempt, jsonError },
        );
        if (attempt < GEMINI_MAX_ATTEMPTS_PER_MODEL - 1) continue;
        break;
      }

      const candidate = Array.isArray(data?.candidates)
        ? data.candidates[0]
        : undefined;
      const parts = Array.isArray(candidate?.content?.parts)
        ? candidate.content.parts
        : [];
      const text =
        typeof parts[0]?.text === "string" ? parts[0].text.trim() : "";

      if (!text) {
        console.error("Something went wrong: empty Gemini rewrite payload", {
          model,
          attempt,
          hasCandidates: Array.isArray(data?.candidates),
          candidateCount: Array.isArray(data?.candidates)
            ? data.candidates.length
            : 0,
          finishReason: candidate?.finishReason,
          promptFeedback: data?.promptFeedback,
        });
        if (attempt < GEMINI_MAX_ATTEMPTS_PER_MODEL - 1) continue;
        break;
      }

      if (model !== GEMINI_PRIMARY_MODEL) {
        console.log("rewrite-resume-block using Gemini failover model", {
          model,
          attempt,
        });
      }

      try {
        // Use service role (same as the request handler). Anon key has no
        // user JWT here, so RLS would block app_resumes / ai_generations.
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (supabaseUrl && serviceRoleKey) {
          const supabase = createClient(supabaseUrl, serviceRoleKey);
          const { data: appResume, error: appResumeError } = await supabase
            .from("app_resumes")
            .select("application_id, user_id")
            .eq("id", appResumeId)
            .single();
          if (appResumeError) {
            console.error(
              "Something went wrong getting app resume:",
              appResumeError,
            );
          } else {
            const { error: generationError } = await supabase
              .from("ai_generations")
              .insert({
                user_id: appResume?.user_id,
                prompt_hash: hash(prompt),
                tokens_input: data.usageMetadata?.promptTokenCount,
                tokens_output: data.usageMetadata?.candidatesTokenCount,
                application_id: appResume?.application_id,
                block_id: blockId,
                created_at: new Date().toISOString(),
              });
            if (generationError) {
              console.error(
                "Something went wrong inserting ai_generations:",
                generationError,
              );
            }
          }
        } else {
          console.error(
            "Something went wrong: Supabase env missing for ai_generations log",
          );
        }

        let jsonStr = text;
        const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
        if (fenced) jsonStr = fenced[1].trim();
        const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
        if (!parsed || typeof parsed !== "object") {
          console.error(
            "Something went wrong: Gemini rewrite JSON root is not an object",
            { model, jsonStr },
          );
          if (attempt < GEMINI_MAX_ATTEMPTS_PER_MODEL - 1) continue;
          break;
        }
        if (!parsed.content_json || typeof parsed.content_json !== "object") {
          console.error(
            "Something went wrong: Gemini rewrite missing content_json object",
            { model, parsedKeys: Object.keys(parsed), parsed },
          );
          if (attempt < GEMINI_MAX_ATTEMPTS_PER_MODEL - 1) continue;
          break;
        }
        return {
          content_json: parsed.content_json as Record<string, unknown>,
          changes: (parsed.changes ?? { summary: "" }) as RewriteChanges,
        };
      } catch (error) {
        console.error("Something went wrong parsing rewrite JSON:", {
          model,
          attempt,
          error,
          message: error instanceof Error ? error.message : String(error),
          rawText: text,
        });
        if (attempt < GEMINI_MAX_ATTEMPTS_PER_MODEL - 1) continue;
        break;
      }
    }
  }

  return null;
}

function asString(value: unknown, fallback = ""): string {
  const raw = typeof value === "string" ? value : fallback;
  return sanitizeHumanResumeText(raw);
}

function asNullableString(
  value: unknown,
  fallback: string | null,
): string | null {
  if (value === null) return null;
  if (typeof value === "string") return value;
  return fallback;
}

function asStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((item) =>
      typeof item === "string" ? sanitizeHumanResumeText(item) : "",
    )
    .filter(Boolean)
    .slice(0, 12);
}

/** Case-insensitive skill dedupe; keeps first spelling encountered. */
function dedupeSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const skill of skills) {
    const key = skill.trim().toLowerCase().replace(/\s+/g, " ");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(skill.trim());
  }
  return unique;
}

function normalizeContentJson(
  blockType: string,
  original: Record<string, unknown>,
  suggested: Record<string, unknown>,
): Record<string, unknown> {
  switch (blockType) {
    case "rich_text": {
      const text = asString(suggested.text, asString(original.text)).trim();
      return { text };
    }
    case "group_text": {
      const originalTexts = Array.isArray(original.texts) ? original.texts : [];
      const suggestedTexts = Array.isArray(suggested.texts)
        ? suggested.texts
        : originalTexts;
      return {
        texts: suggestedTexts.map((item, index) => {
          const originalItem =
            originalTexts[index] && typeof originalTexts[index] === "object"
              ? (originalTexts[index] as Record<string, unknown>)
              : {};
          const record =
            item && typeof item === "object"
              ? (item as Record<string, unknown>)
              : {};
          return {
            text: asString(record.text, asString(originalItem.text)),
            ...(originalItem.style_json
              ? { style_json: originalItem.style_json }
              : {}),
          };
        }),
      };
    }
    case "job_entry": {
      return {
        title: asString(suggested.title, asString(original.title)).trim(),
        company: asString(original.company).trim(),
        start_date: asNullableString(original.start_date, null),
        end_date: asNullableString(original.end_date, null),
        description: asStringArray(
          suggested.description,
          asStringArray(original.description),
        ),
      };
    }
    case "project_entry": {
      return {
        name: asString(suggested.name, asString(original.name)).trim(),
        description: asStringArray(
          suggested.description,
          asStringArray(original.description),
        ),
        start_date: asNullableString(
          suggested.start_date ?? original.start_date,
          null,
        ),
        end_date: asNullableString(
          suggested.end_date ?? original.end_date,
          null,
        ),
      };
    }
    case "education_entry": {
      return {
        school: asString(original.school).trim(),
        degree: asString(suggested.degree, asString(original.degree)).trim(),
        start_date: asNullableString(original.start_date, null),
        end_date: asNullableString(original.end_date, null),
      };
    }
    case "skill_category_entry": {
      const suggestedSkills = asStringArray(
        suggested.skills,
        asStringArray(original.skills),
      );
      return {
        category_id: asString(original.category_id),
        name: asString(suggested.name, asString(original.name)).trim(),
        skills: dedupeSkills(suggestedSkills),
      };
    }
    case "skill_entry": {
      return {
        name: asString(suggested.name, asString(original.name)).trim(),
        categoryId:
          typeof original.categoryId === "number"
            ? original.categoryId
            : Number(original.categoryId) || 0,
        categoryName: asString(original.categoryName),
      };
    }
    default:
      return { ...original, ...suggested, style_json: undefined };
  }
}

function normalizeChanges(raw: RewriteChanges | undefined): RewriteChanges {
  const summary =
    typeof raw?.summary === "string" && raw.summary.trim()
      ? sanitizeHumanResumeText(raw.summary)
      : "Polished block for stronger job-description alignment.";

  const added = asStringArray(raw?.added_bullets).slice(0, MAX_NEW_BULLETS);
  const removed = asStringArray(raw?.removed_bullets).slice(
    0,
    MAX_REMOVED_BULLETS,
  );
  const rewritten = Array.isArray(raw?.rewritten_bullets)
    ? raw.rewritten_bullets
        .filter(
          (item): item is BulletChange =>
            !!item &&
            typeof item === "object" &&
            typeof item.from === "string" &&
            typeof item.to === "string",
        )
        .map((item) => ({
          from: item.from.trim(),
          to: sanitizeHumanResumeText(item.to),
        }))
        .filter((item) => item.from && item.to)
        .slice(0, 12)
    : [];

  return {
    summary,
    ...(added.length > 0 ? { added_bullets: added } : {}),
    ...(removed.length > 0 ? { removed_bullets: removed } : {}),
    ...(rewritten.length > 0 ? { rewritten_bullets: rewritten } : {}),
  };
}

function hash(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}