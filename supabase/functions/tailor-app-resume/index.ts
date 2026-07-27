import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { jsonResponse, STRIPE_FUNCTION_CORS } from "../_shared/stripe-cors.ts"

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void
  env: { get: (name: string) => string | undefined }
}

const GEMINI_MODEL = "gemini-2.0-flash"
const GEMINI_URL = (apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`

interface IncomingBlock {
  block_key: string
  type: string
  content: string
  order: number
}

interface IncomingSection {
  section_key: string
  type: string
  title: string | null
  order: number
  blocks: IncomingBlock[]
}

interface TailoredBlock {
  block_key: string
  section_key: string
  section_type: string
  section_title?: string | null
  section_order?: number
  type: string
  content: string
  order: number
  is_new?: boolean
  is_removed?: boolean
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: STRIPE_FUNCTION_CORS })
  }

  const secretKey = Deno.env.get("X-SECRET-KEY")
  const xsecretkey = req.headers.get("X-Secret-Key")
  if (xsecretkey !== secretKey) {
    return jsonResponse({ error: "unauthorized" }, 401)
  }

  try {
    const body = await req.json()
    const {
      jobTitle,
      companyName,
      jobDescription,
      original,
    } = body as {
      jobTitle?: string
      companyName?: string
      jobDescription?: string
      original?: { sections?: IncomingSection[] }
    }

    if (!jobDescription?.trim() || !original?.sections?.length) {
      return jsonResponse({ error: "missing_resume_or_jd" }, 400)
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY")
    if (!apiKey) {
      return jsonResponse({ error: "GEMINI_API_KEY is not set" }, 500)
    }

    const prompt = buildPrompt({
      jobTitle: jobTitle ?? "",
      companyName: companyName ?? "",
      jobDescription,
      sections: original.sections,
    })

    const response = await fetch(GEMINI_URL(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    })

    if (!response.ok) {
      const details = await response.text()
      console.error("Something went wrong calling Gemini:", details)
      return jsonResponse({ error: "generation_failed" }, 502)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!text) {
      return jsonResponse({ error: "empty_generation" }, 502)
    }

    let parsed: unknown
    try {
      let jsonStr = text
      const match = text.match(/^```(?:json)?\s*([\s\S]*?)```$/m)
      if (match) jsonStr = match[1].trim()
      parsed = JSON.parse(jsonStr)
    } catch {
      console.error("Something went wrong parsing tailored resume JSON")
      return jsonResponse({ error: "invalid_json" }, 502)
    }

    const validated = validateTailoredPayload(parsed, original.sections)
    if (!validated) {
      return jsonResponse({ error: "malformed_schema" }, 502)
    }

    return jsonResponse(validated, 200)
  } catch (error) {
    console.error("Something went wrong in tailor-app-resume:", error)
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "unexpected_error",
      },
      500,
    )
  }
})

function buildPrompt(input: {
  jobTitle: string
  companyName: string
  jobDescription: string
  sections: IncomingSection[]
}): string {
  return `You are a careful resume editor. Tailor the candidate's structured resume to the job description.

CRITICAL RULES:
1. Return ONLY valid JSON with shape:
{
  "score": 0-100 integer,
  "blocks": [
    {
      "block_key": "uuid",
      "section_key": "uuid",
      "section_type": "header|summary|experience_entry|education_entry|skills|projects|custom",
      "section_title": "string or null",
      "section_order": 0,
      "type": "heading|subheading|bullet|text|date_range|contact_line",
      "content": "string",
      "order": 0,
      "is_new": false,
      "is_removed": false
    }
  ]
}
2. For every kept or rewritten block, reuse the EXACT block_key and section_key from the input.
3. Only invent a new block_key UUID when is_new is true.
4. To suggest removing a weak/irrelevant bullet, keep its block_key and set is_removed=true (content can stay as original).
5. Do not fabricate employers, degrees, or tools not grounded in the original content.
6. Prefer rewriting bullets/summary for the JD keywords while preserving truthfulness.
7. Include at most 2 is_new bullets total, and at most 1 is_removed block.

Job title: ${input.jobTitle}
Company: ${input.companyName}
Job description:
${input.jobDescription}

Original structured resume JSON:
${JSON.stringify({ sections: input.sections })}
`
}

function validateTailoredPayload(
  parsed: unknown,
  originalSections: IncomingSection[],
): { score: number; blocks: TailoredBlock[] } | null {
  if (!parsed || typeof parsed !== "object") return null
  const root = parsed as Record<string, unknown>
  if (typeof root.score !== "number" || !Number.isFinite(root.score)) return null
  if (!Array.isArray(root.blocks) || root.blocks.length === 0) return null

  const knownKeys = new Set(
    originalSections.flatMap((section) =>
      section.blocks.map((block) => block.block_key),
    ),
  )

  const blocks: TailoredBlock[] = []
  for (const item of root.blocks) {
    if (!item || typeof item !== "object") return null
    const block = item as Record<string, unknown>
    if (typeof block.block_key !== "string" || !block.block_key) return null
    if (typeof block.section_key !== "string" || !block.section_key) return null
    if (typeof block.section_type !== "string") return null
    if (typeof block.type !== "string") return null
    if (typeof block.content !== "string") return null
    if (typeof block.order !== "number") return null

    const isNew = Boolean(block.is_new)
    const isRemoved = Boolean(block.is_removed)
    if (!isNew && !knownKeys.has(block.block_key)) return null
    if (isNew && knownKeys.has(block.block_key)) return null

    blocks.push({
      block_key: block.block_key,
      section_key: block.section_key,
      section_type: block.section_type,
      section_title:
        typeof block.section_title === "string" || block.section_title === null
          ? (block.section_title as string | null)
          : null,
      section_order:
        typeof block.section_order === "number" ? block.section_order : 0,
      type: block.type,
      content: block.content,
      order: block.order,
      is_new: isNew,
      is_removed: isRemoved,
    })
  }

  return {
    score: Math.round(Math.min(100, Math.max(0, root.score))),
    blocks,
  }
}
