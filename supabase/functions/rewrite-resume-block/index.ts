/**
 * Rewrite a single app_resume_blocks row to better match a job description.
 *
 * Body: { blockId, appResumeId, jdText }
 * Returns: { blockId, blockType, sectionType, content_json, changes }
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsonResponse, STRIPE_FUNCTION_CORS } from "../_shared/stripe-cors.ts";
import { createHash } from "node:crypto";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (name: string) => string | undefined };
};

const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_URL = (apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

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
}

interface GeminiRewritePayload {
  content_json: Record<string, unknown>;
  changes: RewriteChanges;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: STRIPE_FUNCTION_CORS });
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
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error(
        "Something went wrong parsing rewrite-resume-block request JSON:",
        parseError,
      );
      return jsonResponse({ error: "Invalid JSON body" }, 400);
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

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error(
        "Something went wrong: GEMINI_API_KEY is not set for rewrite-resume-block",
      );
      return jsonResponse({ error: "GEMINI_API_KEY is not set" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

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

    const result: RewriteResult = {
      blockId: typedBlock.id,
      blockType: typedBlock.block_type,
      sectionType: typedSection.section_type,
      content_json: contentJson,
      changes,
    };

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

  return `You are an expert resume writer and ATS keyword strategist. You optimize resume content for both applicant tracking systems and human recruiters, while treating factual accuracy as non-negotiable.

<job_description>
${input.jdText}
</job_description>

<full_resume_context note="for consistency and keyword grounding only — do not pull facts from here into the target block unless they already describe this block's role/project">
${JSON.stringify(input.resumeContext)}
</full_resume_context>

<target_block>
Block type: ${blockType}
Section type: ${sectionType}
Section display name: ${input.section.display_name}
Content:
${JSON.stringify(stripStyle(input.block.content_json), null, 2)}
</target_block>

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
</anti_hallucination_rules>

<reasoning_steps note="do this thinking silently — do not output it">
1. Extract the 5-10 hard/soft skills and role-critical keywords from the job description.
2. Compare them against what this specific block actually demonstrates.
3. Identify only the overlapping, truthful keywords worth surfacing.
4. Decide which bullets are weak (vague, passive, no outcome) vs strong (concrete, verb-led).
5. Rewrite for clarity, active voice, and front-loaded impact — without adding unverified facts.
6. Re-check every new or edited phrase against <anti_hallucination_rules> before finalizing.
</reasoning_steps>

<style_rules>
- Strong action verbs, concrete outcomes, plain ATS-friendly text — no markdown, no emoji, no tables, human sounds, no AI sounding text.
- Write for a human recruiter skimming in 6-10 seconds: front-load the most relevant word or result in each bullet.
- Avoid keyword stuffing — a JD term should appear because it's true and natural, not repeated for density.
- Keep a consistent tense and voice with the rest of the resume context.
- Bullet arrays: keep a focused set (typically 3-6). Add at most ${MAX_NEW_BULLETS} new bullets and remove at most ${MAX_REMOVED_BULLETS} weak/irrelevant ones.
- Preserve factual anchors as-is: company, school, degree, job title, project name, and dates — unless fixing an obvious typo.
- Never include style_json in content_json.
- If the block is already strong, return a lightly polished version and say so plainly in changes.summary — do not manufacture changes for their own sake.
</style_rules>

<output_format>
Return ONLY valid JSON (no markdown fences, no commentary before or after) with this exact shape:
{
  "content_json": { ...same schema as the target block... },
  "changes": {
    "summary": "1-2 sentence explanation of edits, including which JD keywords were incorporated and why they're truthful",
    "added_bullets": ["optional new bullets"],
    "removed_bullets": ["optional removed original bullets"],
    "rewritten_bullets": [{ "from": "original", "to": "rewritten" }]
  }
}
</output_format>

Final check before responding: does every added word, number, or keyword trace back to real content in <target_block> or the matching part of <full_resume_context>? If any phrase fails that test, revise it before outputting.`;
}

function getTypeGuidance(blockType: string, sectionType: string): string {
  switch (blockType) {
		case "rich_text":
			return `BLOCK GUIDANCE (${sectionType} / rich_text)
- content_json must be: { "text": "..." }
- Write a tight professional summary (3–5 sentences or ~50–90 words).
- Mirror JD language for skills/domain the candidate already supports elsewhere in the resume.
- If the current text is empty, GENERATE a new summary from the resume context + JD. Do not invent employers or tools not grounded in the resume.`;

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
- Improve bullets for keyword match and clarity.
- You may rewrite bullets, add stronger JD-aligned bullets (grounded in this role), or drop weak bullets.
- Bullets must follow format: Action Verb + Outcome + Impact.
- Quantify outcomes whenever possible. Using metrics help recruiters understand the impact of the work.
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
- Same bullet strategy as experience: rewrite / add / remove for JD fit.
- Keep the project name unless polishing wording only.`;

    case "education_entry":
      return `BLOCK GUIDANCE (education / education_entry)
- content_json must be:
{
  "school": "string",
  "degree": "string",
  "start_date": "string|null",
  "end_date": "string|null"
}
- Polish degree wording for clarity/ATS (e.g. expand abbreviations carefully).
- Do not invent schools, degrees, GPAs, or coursework fields that are not present.
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
- Reorder/prioritize skills for the JD; add only skills clearly supported by the resume context.
- Remove clearly irrelevant skills; do not invent niche tools with no resume evidence.`;

    case "skill_entry":
      return `BLOCK GUIDANCE (skills / skill_entry)
- content_json must be:
{
  "name": "string",
  "categoryId": number,
  "categoryName": "string"
}
- Polish skill naming for ATS (canonical spelling). Keep ids/names consistent.`;

    case "group_text":
      return `BLOCK GUIDANCE (group_text)
- content_json must be: { "texts": [{ "text": "..." }, ...] }
- Polish each text item; keep the same number of items unless one is empty/useless.`;

    default:
      return `BLOCK GUIDANCE
- Return content_json with the same keys as the input block.
- Improve clarity and JD alignment without changing schema.`;
  }
}

  async function callGeminiForRewrite(
  apiKey: string,
  prompt: string,
  appResumeId: string,
  blockId: string,
): Promise<GeminiRewritePayload | null> {
  let response: Response;
  try {
    response = await fetch(GEMINI_URL(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (fetchError) {
    console.error(
      "Something went wrong fetching Gemini for rewrite-resume-block:",
      fetchError,
    );
    return null;
  }

  if (!response.ok) {
    const details = await response.text();
    console.error("Something went wrong calling Gemini:", {
      status: response.status,
      statusText: response.statusText,
      details,
    });
    return null;
  }

  let data: any;
  try {
    data = await response.json();
  } catch (jsonError) {
    console.error(
      "Something went wrong parsing Gemini HTTP JSON response:",
      jsonError,
    );
    return null;
  }

  const candidate = Array.isArray(data?.candidates)
    ? (data.candidates[0] as Record<string, unknown> | undefined)
    : undefined;
  const content = candidate?.content as Record<string, unknown> | undefined;
  const parts = Array.isArray(content?.parts) ? content.parts : [];
  const firstPart = parts[0] as Record<string, unknown> | undefined;
  const text = typeof firstPart?.text === "string" ? firstPart.text.trim() : "";

  if (!text) {
    console.error("Something went wrong: empty Gemini rewrite payload", {
      hasCandidates: Array.isArray(data?.candidates),
      candidateCount: Array.isArray(data?.candidates)
        ? data.candidates.length
        : 0,
      finishReason: candidate?.finishReason,
      promptFeedback: data?.promptFeedback,
      rawResponse: data,
    });
    return null;
  }
  

  try {
    // Logged into ai generation table
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: appResume, error: appResumeError } = await supabase.from("app_resumes").select("*").eq("id", appResumeId).single();
    if (appResumeError) {
      console.error("Something went wrong getting app resume:", appResumeError);
      return null;
    }
    await supabase.from("ai_generations").insert({
      prompt_hash: hash(prompt),
      tokens_input: data.usageMetadata?.promptTokenCount,
      tokens_output: data.usageMetadata?.candidatesTokenCount,
      application_id: appResume?.application_id,
      block_id: blockId,
      created_at: new Date().toISOString(),
    });
    
    let jsonStr = text;
    const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
    if (fenced) jsonStr = fenced[1].trim();
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") {
      console.error(
        "Something went wrong: Gemini rewrite JSON root is not an object",
        { jsonStr },
      );
      return null;
    }
    if (!parsed.content_json || typeof parsed.content_json !== "object") {
      console.error(
        "Something went wrong: Gemini rewrite missing content_json object",
        { parsedKeys: Object.keys(parsed), parsed },
      );
      return null;
    }
    return {
      content_json: parsed.content_json as Record<string, unknown>,
      changes: (parsed.changes ?? { summary: "" }) as RewriteChanges,
    };
  } catch (error) {
    console.error("Something went wrong parsing rewrite JSON:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      rawText: text,
    });
    return null;
  }
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
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
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 12);
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
      return {
        category_id: asString(original.category_id),
        name: asString(suggested.name, asString(original.name)).trim(),
        skills: asStringArray(suggested.skills, asStringArray(original.skills)),
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
      ? raw.summary.trim()
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
          to: item.to.trim(),
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