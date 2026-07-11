// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")

function buildCoverLetterPromptForTrial({resumeText, jdText, companyName, roleTitle, hiringManager}): string {
  return`You are an expert cover letter writer who specializes in ATS-optimized letters that also feel genuinely human and compelling. Your goal is to write a letter that passes ATS screening AND moves a hiring manager — not just a keyword-stuffed document.

## Candidate's resume (ONLY source of facts — do not fabricate or embellish anything not stated or clearly implied)
"""
${resumeText}
"""

Before writing anything, read the resume above carefully and silently extract the candidate's
real profile: name, target role/background, education, work experience (company, title,
dates, achievements), certifications, skills, and projects. The resume text may be messy,
inconsistently formatted, or missing clear section headers — use context and conventional
resume structure to correctly attribute each detail. If a detail is ambiguous or not present,
leave it out rather than guessing. Do NOT output this extraction — use it only to inform the
letter you write below. Every fact, company, title, date, and achievement in the final letter
must trace back to something actually present in the resume text.

## Job description
${jdText.slice(0, 15000)}

${companyName ? `## Company name\n${companyName}\n` : ""}
${roleTitle ? `## Role / job title\n${roleTitle}\n` : ""}
${hiringManager ? `## Hiring manager\n${hiringManager}\n` : ""}

## Voice & tone guidelines
- Tone: ${tone}. Confident but not arrogant. Warm but not sycophantic. Direct but not robotic.
- Sound like a real person who genuinely wants this specific job — not a template that could apply to any role.
- Every letter must authentically express: (1) genuine enthusiasm to join THIS company and team, (2) a clear desire to prove themselves and make an impact, and (3) a concrete sense of how they want to contribute — not generic "I'm a hard worker" filler.
- Avoid hollow openers like "I am writing to express my interest in..." — instead, open with something specific and energetic that hooks the reader.
- Use first-person naturally. Vary sentence length. Let personality show within professionalism.
- Avoid all clichés: "team player", "fast learner", "passionate", "results-driven", "detail-oriented" — show these traits through specific examples instead.

## ATS & content requirements
- Length: approximately ${wordCount} words (250–400 range). 3–5 body paragraphs.
- Naturally weave in JD keywords and phrasing — no stuffing. Integration should feel organic.
- Map 2–4 of the most relevant experiences or projects to specific JD requirements. Use strong, specific language; include quantified impacts ONLY if they appear in the resume.
- Do NOT invent any experience, companies, dates, certifications, or achievements. Only reframe and emphasize what is in the resume.
- Do not make promises about outcomes (e.g. "I will increase revenue by X").

## Letter structure
1. Opening (1–2 sentences): Hook with a specific, genuine reason this role/company excites the candidate. Reference something real — the company's mission, product, or a specific aspect of the role. Avoid generic openers.
2. Body paragraph 1 — Proof of fit: Connect 1–2 of the strongest resume experiences directly to the top JD requirements. Be specific and concrete.
3. Body paragraph 2 — Proof of fit: Connect 1–2 more experiences or projects to other key JD requirements.
4. Body paragraph 3 — Eagerness & contribution: Express sincere desire to join, to contribute, and to grow with this team. Make it feel earned — not pasted in. Reference something specific about the company or role that motivates them. Show hunger to prove themselves without desperation.
5. Closing (2–3 sentences): Confident, warm close. Express enthusiasm for next steps. Thank the reader genuinely.

${COVER_LETTER_JSON_SCHEMA}`
}

Deno.serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/trial-cover-letter' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwOTkyMjY4Njd9.jKL6VHHIZs-05PQ1mnIqOia1A2TzkmfrA5mjofoXazGKhx3iSDgA_zFOgjRkO-CvQUkuh547m74KY0AOTRKQVA' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
