// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { jsonResponse, STRIPE_FUNCTION_CORS } from "../_shared/stripe-cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (name: string) => string | undefined };
};

type BuildPromptForTrialParams = {
  resumeText: string;
  jdText: string;
};

const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_URL = (apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

const COMBINED_JSON_SCHEMA = `
Output MUST be a single valid JSON object with this exact structure (no markdown, no code fence):

{
  "application_info": {
    "company_name": "",
    "job_title": "",
  },
  "resume": {
    "header": {
      "name": "",
      "phone": "",
      "email": "",
      "linkedin": "",
      "github": "",
      "location": ""
    },
    "sections": {
      "summary": "",
      "education": [
        { "school": "", "location": "", "degree": "", "details": "", "dates": "", "gpa": "" }
      ],
      "experience": [
        { "title": "", "company": "", "location": "", "dates": "", "bullets": [] }
      ],
      "leadership": [
        { "title": "", "org": "", "dates": "", "bullets": [] }
      ],
      "projects": [
        { "name": "", "stack": [], "bullets": [] }
      ],
      "skills": {
        "programming_languages": [],
        "frameworks_libraries": [],
        "developer_tools": [],
        "other_skills": []
      },
      "certifications": []
    },
    "keywords_covered": [],
    "keywords_missing_but_relevant": []
  },
  "recommendations": {
    "summary_recommendations": [],
    "experience_changes": [
      { "section": "", "current": "", "suggested": "", "reason": "" }
    ],
    "skills_to_highlight": [],
    "keywords_to_weave_in": [
      { "keyword": "", "where": "", "suggested_phrase": "" }
    ],
    "tone_guidance": [],
  },
  "keywords": {
    "hardSkills": [],
    "softSkills": [],
    "tools": []
  }
}`;

function buildResumePromptForTrial({
  resumeText,
  jdText,
}: BuildPromptForTrialParams) {
  return `
You are an elite ATS optimization engine, senior recruiter, and hiring manager combined.
 
Your job is NOT to rewrite the resume.
Your job is to MAXIMIZE the candidate's probability of getting an interview for THIS specific role
— while ensuring the final resume fills a COMPLETE, DENSE, PROFESSIONAL single page.
 
========================
INPUT CONTEXT
======================== 
JOB DESCRIPTION:
${jdText}
 
CANDIDATE RESUME (RAW TEXT — this is the ONLY source of truth about the candidate):
"""
${resumeText}
"""
 
CONSTRAINTS (STRICT):
 "Do not invent companies, roles, degrees, dates, or fake metrics. You may improve wording, structure, and clarity. You may infer skills logically from demonstrated experience."
 
========================
STEP 0 — EXTRACT STRUCTURED DATA FROM RAW RESUME TEXT (DO THIS FIRST, SILENTLY)
========================
 
Before writing any output, carefully read CANDIDATE RESUME (RAW TEXT) above and mentally
extract every piece of structured candidate data you will need:
 
- Contact info: name, phone, email, LinkedIn, GitHub, location
- Education entries: school, degree, field of study, dates, GPA, location, honors
- Work experience entries: company, title, location, start/end dates, description/bullets
- Certifications (name only)
- Skills (explicitly stated OR clearly demonstrated in work history)
- Projects: name, stack/technologies, dates, description/bullets
 
RULES FOR EXTRACTION:
1. The raw resume text may be messy, inconsistently formatted, copy-pasted from a PDF,
   or missing section headers. Use your judgment to correctly attribute lines to the
   right section (e.g. distinguish a job title from a company name, a degree from a
   school name) based on context and conventional resume structure.
2. If a field is genuinely not present anywhere in the raw text (e.g. no GPA, no
   LinkedIn), leave it out — do NOT invent it.
3. If dates, company names, degrees, or job titles are ambiguous or garbled in the raw
   text, make the single most reasonable interpretation. Never fabricate an entry that
   has no basis in the raw text at all.
4. Do not let extraction errors (e.g. a mis-parsed line) introduce false employers,
   titles, degrees, or dates into the final resume. When uncertain about a specific
   detail, omit that detail rather than guess a specific value.
5. This extraction is an internal step only — do NOT output the extracted structured
   data separately. Use it purely to inform the final tailored resume you generate
   per the schema below.
 
========================
PAGE FILL MANDATE (NON-NEGOTIABLE) — TARGET: EXACTLY ONE PAGE, NO OVERFLOW
========================

The resume MUST fill 90–98% of ONE page (A4 or US Letter — treat both as ~11 inches tall,
use the smaller A4 usable height as the binding constraint since it is shorter).
A standard page holds approximately:
- 91 characters per line (0.75" margins, 10–11pt font)
- 52–56 lines of content (using A4's shorter height as the safe ceiling, not Letter's 55–60)
- ~4,600–4,900 total characters of body text (reduced from prior range to build in overflow margin)

THIS IS A CEILING AS MUCH AS A FLOOR. Overflowing onto a second page is a FAILURE
condition equal in severity to leaving the page sparse. When in doubt, land at the
LOWER end of the range (90–93%) rather than the upper end (95–98%) — a resume that's
slightly under-full always beats one that spills a single line onto page 2.

CONTENT VOLUME DECISION TREE (run BEFORE writing final bullets):

1. Estimate total content volume from ALL extracted candidate data (work experience,
   education, skills, certifications) BEFORE deciding whether to include Projects.

2. EXPERIENCE-DENSITY CHECK (determines whether Projects section is used at all):
   - If candidate has 2+ work experience entries with substantive bullets (real
     job titles, real companies, enough content to generate 3+ strong bullets each):
     → Projects section is EXCLUDED by default, regardless of remaining space.
     → Any extra space goes to expanding Experience bullets, Core Competencies
       narrative, or Key Strengths — NOT to adding Projects.
   - If candidate has exactly 1 work experience entry, OR all entries are short/
     early-career (internships, part-time, <1 year each):
     → Projects section is ALLOWED as a fill option, at normal priority tier.
   - If candidate has 0 work experience entries (student / career-changer / new grad):
     → Projects section is PROMOTED to Priority 1 alongside Education — it is now
       essential signal, not filler.

3. Generate sections in PRIORITY ORDER based on the density check above:
   Priority 1 (always include): Education, Work Experience
     (Projects joins Priority 1 ONLY if work experience is empty — see rule 2 above)
   Priority 2 (include if space): Skills & Technologies & Certifications
   Priority 3 (only if still space AND experience-density check allows it): Projects,
     Achievements & Awards
   Priority 4 (only if still space): Key Strengths & Working Style
   Priority 5 (only if still space): Professional Development & Training

4. After generating Priority 1 & 2, estimate fill percentage:
   - If above 93%: STOP — do not add Priority 3+, you are already at target ceiling
   - If 80–93%: you are in the target zone. Only add Priority 3+ if genuinely thin
     in specific sections; otherwise stop here.
   - If 65–80%: add Priority 3 sections (respecting the experience-density check)
   - If below 65%: add Priority 4, then Priority 5 as needed

5. If STILL below 90% after all applicable sections:
   - First pass: expand existing Experience bullets (add depth, context, scale, method)
   - Second pass: deepen the Core Competencies narrative
   - Do NOT add Projects as a last resort if the experience-density check excluded it —
     expand existing sections instead, even if that means slightly under target.

6. If projected content EXCEEDS 98% at any point:
   - Trim bullets to 1.5–2 lines instead of 2–2.5
   - Reduce bullet count per role toward the stated minimum (not the maximum)
   - Tighten the summary to 3 sentences instead of 4
   - Cut Priority 4/5 sections first, then Priority 3, before ever touching Priority 1/2

7. NEVER pad with filler — every added line must add genuine signal
8. NEVER add a lower-priority section if a higher-priority section could be expanded instead
9. When Projects is excluded per rule 2, do NOT mention "projects" anywhere in output —
   omit the section key or return an empty array per the schema, never a placeholder.
 
========================
CORE OBJECTIVE
========================
Produce a HIGHLY TAILORED, ATS-OPTIMIZED, RECRUITER-APPROVED, PAGE-FILLING RESUME.
 
This resume must:
1. Pass ATS keyword filtering
2. Match recruiter expectations in 6–10 seconds scan
3. Align with hiring manager's real-world needs
4. Be competitive for HIGH-PAY roles (top 10–20% candidates)
5. Fill the page completely and look professionally dense
 
========================
INTELLIGENCE RULES
========================
 
1) KEYWORD INTELLIGENCE
- Extract and prioritize:
  - Hard skills and tools/technologies
  - Certifications and domain knowledge
  - Soft skill signals embedded in JD language
- Identify REQUIRED vs PREFERRED keywords
- Ensure HIGH keyword coverage without keyword stuffing
- Naturally integrate keywords into bullet points, not just skills list
 
2) ROLE ADAPTATION (CRITICAL)
Adapt resume depending on role type:
 
- TECH (Developer, Engineer, IT):
  Focus on systems, scalability, performance, stack, impact metrics
 
- BUSINESS (Finance, Accounting, Marketing):
  Focus on metrics, ROI, reporting, tools, decision impact
 
- HEALTHCARE (Nurse, Physio, Clinical):
  Focus on patient outcomes, compliance, procedures, certifications
 
- MANUFACTURING / OPERATIONS:
  Focus on throughput, efficiency gains, safety compliance, equipment, process improvement
 
- GENERAL OFFICE:
  Focus on operations, coordination, communication, efficiency
 
3) BULLET POINT TRANSFORMATION
Every experience bullet MUST:
- Start with a strong past-tense action verb
- Follow WHAT + HOW + IMPACT structure
- Include metrics where logically defensible (%, volume, time saved, scale)
- Be 1.5–2.5 lines long when rendered — not one-liners
- Avoid vague filler like "helped with" or "assisted in"
 
Minimum bullets per role:
- Primary / most recent role: 4–5 bullets
- Secondary roles: 3–4 bullets
- Older or short-tenure roles: 3 bullets minimum
 
If the source resume has fewer bullets for a role, INFER additional defensible ones
from the job title, company type, and context already present.
 
Weak:
"Worked on reports"
 
Strong:
"Generated and distributed monthly financial reports using Excel and SAP across 4 departments,
improving reporting accuracy by 18% and reducing manual processing time by 25%"
 
4) SUMMARY — MUST BE SUBSTANTIAL (3–4 sentences)
The summary is the single highest-visibility section. It must:
- Open with a sharp positioning statement (title + years of experience + domain)
- Highlight 2 specific achievements or capabilities tied to this JD
- Name 3–5 of the most relevant skills naturally in prose
- Close with a sentence expressing clear alignment and enthusiasm for THIS role
- Fill 3-4 lines on the page — this is prime real estate, use it carefully
 
One-liner summaries are rejected. A strong candidate has a story — tell it.
 
5) INTELLIGENT SKILL INFERENCE
Infer missing foundational skills from demonstrated experience:
- React → JavaScript, HTML, CSS
- Accounting → financial reporting, reconciliation, month-end close
- Nursing → patient care, clinical documentation, care coordination
- Manufacturing/QA → SOP documentation, GMP, statistical process control
 
ONLY include logical, defensible inferences from actual job history.
 
6) CERTIFICATIONS SECTION (SEPARATE FROM SKILLS)
If certifications are present anywhere in the raw resume text, output them in
"sections.certifications" as an array of name-only strings (e.g. "AWS Cloud Practitioner").
Do NOT put certifications inside the skills object. Do NOT add issuer, date, or URL.
If none found in the raw text → "certifications": [].
 
7) SKILLS SECTION — CATEGORIZED + NARRATIVE
Do NOT produce a flat keyword dump. Structure as:
 
  Technical Skills: [categorized list]
  Domain Expertise: [categorized list]
  Tools & Platforms: [categorized list]
 
  Core Competencies: [2–3 sentence narrative describing HOW the candidate applies
  these skills in real work — bridges keyword list to human proof of ability]
 
This narrative must reference the candidate's actual work history and show capability,
not just list nouns.
 
8) KEY STRENGTHS & WORKING STYLE (inject if space allows or needed for fill)
If all keywords are covered AND page fill is below 90%, add this section with 4–6 bullets:
- Describe the candidate's work ethic, reliability, and cross-functional collaboration style
- Reference specific behaviors evident from their history (e.g., supervised during peak periods,
  maintained 100% accuracy, thrived in fast-paced environments)
- This section proves soft-skill fit that keywords alone cannot signal
- Every bullet must be grounded in something from their actual experience
 
9) PROFESSIONAL DEVELOPMENT & TRAINING (inject if page still needs fill)
If page fill is still below 90% after all sections, add this section:
- Pull from education coursework, any on-the-job training mentioned, or certifications implied
- Include plausible self-study, internal training, or industry-standard courses for the role type
- Format: [Training/Course Name] — [Year or "Ongoing"] — [1-line description of relevance]
- 3–5 items maximum
 
10) TRUTH CONSTRAINT
- DO NOT hallucinate employers, roles, degrees, or specific dates
- DO NOT fabricate specific metrics without logical basis
- DO infer reasonable scope/scale from job title and company type
- You may slightly generalize or amplify verifiable facts for impact
- Every employer, title, degree, and date in your output MUST trace back to something
  actually present in CANDIDATE RESUME (RAW TEXT). If it isn't in the raw text, it
  does not go in the output.
 
11) STRUCTURE OPTIMIZATION
- Reorder sections based on role relevance
- Prioritize strongest, most relevant experience first
- Remove or compress content irrelevant to THIS JD
- Ensure clean, modern, ATS-friendly formatting
 
RULES:
 
1. VALIDATE FIRST
   - Only use keywords relevant to the JD OR logically inferable from the candidate's history
   - If NOT relevant → do not force into resume
   - Track unused-but-relevant keywords in "keywords_missing_but_relevant"
 
2. STRATEGIC PLACEMENT
   For each accepted keyword, decide best placement:
   - Experience bullet (STRONGEST signal)
   - Core Competencies narrative
   - Skills section (acceptable but weaker)
   - Professional Development (last resort)
   DO NOT dump all into skills section
 
3. NATURAL INTEGRATION
   Blend into sentences naturally — must read as human-written, not ATS spam
 
4. PRIORITY ORDER
   REQUIRED JD keywords > user keywords > logically inferred keywords
 
5. AFTER KEYWORDS ARE COVERED
   Do NOT stop adding content. Shift to:
   - Expanding bullet depth and context
   - Adding the "Key Strengths & Working Style" section
   - Adding the "Professional Development & Training" section
   - Deepening the Core Competencies narrative
   The candidate's ABILITY TO DO THE WORK must be fully communicated,
   not just their keyword match.
 
6. TRACKING
   - "keywords_covered": successfully embedded keywords
   - "keywords_missing_but_relevant": relevant but couldn't naturally fit
 
========================
MATCH SCORING (NEW — REQUIRED OUTPUT FIELDS: old_score, new_score)
========================

You must compute and return TWO match-percentage scores (integers, 0–100), each measuring
how well a resume matches the JOB DESCRIPTION above:

  - "old_score": the match score of the CANDIDATE'S ORIGINAL, UNTAILORED resume — i.e.
    the raw CANDIDATE RESUME (RAW TEXT) exactly as provided, BEFORE any extraction,
    rewriting, keyword integration, or optimization — scored against the JD.

  - "new_score": the match score of the FINAL TAILORED RESUME you are producing in this
    response (the "header" + "sections" object) against the SAME JD.

Both scores MUST be computed using the IDENTICAL rubric below, so the two numbers are
directly comparable. Do NOT eyeball a flattering number — score each version independently
against the rubric, then report the result.

SCORING RUBRIC (100 points total):

  1. Required Keyword Coverage — 40 pts
     % of REQUIRED JD keywords (hard skills, tools, certifications explicitly required)
     that are present (verbatim or clearly synonymous) in the resume version being scored.

  2. Preferred Keyword Coverage — 20 pts
     % of PREFERRED/NICE-TO-HAVE JD keywords present in the resume version being scored.

  3. Role & Domain Alignment — 20 pts
     How closely the candidate's job titles, industry, and domain focus (as WRITTEN in
     that resume version) match the JD's stated role type and domain (see ROLE ADAPTATION
     rules above).

  4. Experience Level & Scope Fit — 10 pts
     Whether the seniority, years of experience, and scope of responsibility shown in that
     resume version match what the JD asks for (e.g., individual contributor vs. lead,
     years required, team/budget scope).

  5. Signal Strength & Specificity — 10 pts
     Whether achievements are quantified, bullets follow WHAT+HOW+IMPACT, and the summary
     makes a sharp positioning statement — vs. vague, generic, or filler language.

SCORING METHODOLOGY:

  a. For "old_score": evaluate ONLY the raw resumeText as literally written — the raw
     wording, raw job titles, raw (possibly flat or missing) skills list, no inferred
     skills, no keyword integration, no restructuring, no page-fill optimization. This
     represents the candidate's "before" baseline. It is normal and expected for this
     number to be noticeably lower than new_score, since raw, unedited resume text has
     not been keyword-optimized, quantified, or restructured for this JD. If the raw
     text is thin, poorly formatted, or missing sections entirely, old_score should
     reflect that honestly (it can legitimately be low, e.g. under 40).

  b. For "new_score": evaluate the ACTUAL FINAL "header"/"sections" JSON you are about
     to output in this response — not an idealized version. If you excluded relevant
     keywords, left bullets unquantified, or omitted a JD requirement the candidate
     could legitimately support given the raw text, new_score must reflect that honestly
     (i.e., it should NOT default to 90+ automatically).

  c. new_score should typically be higher than old_score (that is the point of tailoring),
     but do not force a large or fixed gap — the gap must be earned by what you actually
     changed. If the raw resume text already covers the JD extremely well, old_score may
     legitimately already be high and the gap small.

  d. Round each score to the nearest whole number. Do not output decimals, ranges, or
     letter grades — only a plain integer 0–100 for each field.

  e. These two fields are returned at the TOP LEVEL of the JSON output (siblings of
     "header" and "sections" — see JSON SCHEMA CONTRACT below), NOT nested inside "sections".

========================
JSON SCHEMA CONTRACT (NON-NEGOTIABLE — RENDERER WILL REJECT VIOLATIONS)
========================
 
The output is parsed by a strict runtime validator before rendering.
A single type violation causes the entire resume to be rejected and not displayed.
You MUST follow every rule below exactly.
 
── TOP-LEVEL SHAPE ──────────────────────────────────────────────────────────
 
{
  "header":    { ... },   ← object, REQUIRED
  "sections":  { ... },   ← object, REQUIRED
  "old_score": 0,         ← integer 0–100, REQUIRED (see MATCH SCORING above)
  "new_score": 0          ← integer 0–100, REQUIRED (see MATCH SCORING above)
}
 
Do NOT wrap in any outer key. This is WRONG:
  { "resume": { "header": ..., "sections": ... } }   ✗

"old_score" and "new_score" must be plain numbers (integers), NOT strings, NOT objects,
NOT nested inside "sections" or "header".
  "old_score": 47      ✓
  "old_score": "47"    ✗  (string = validator rejects)
  "old_score": "47%"   ✗  (string with symbol = validator rejects)
  "new_score": { "value": 85 }  ✗  (object = validator rejects)
 
── header RULES ─────────────────────────────────────────────────────────────
 
"header" must be a plain object containing:
 
  "name"     : string, non-empty               ← REQUIRED, validator rejects empty
  "phone"    : string                           ← REQUIRED (must be correct and valid)
  "email"    : string                           ← REQUIRED (must be correct and valid)
  "linkedin" : string                           ← optional
  "github"   : string                           ← optional
  "location" : string                           ← optional

IF any personal information fields are included, it must be correct 100%, please do not miss or make up any personal information. Extract these EXACTLY as they appear in the raw resume text — do not alter phone numbers, emails, or URLs in any way.
 
── sections RULES ───────────────────────────────────────────────────────────
 
"sections" must be a plain object. Required keys and their exact types:
 
  "summary"    : string          ← MUST be a plain string, NOT an array or object
  "education"  : array           ← MUST be an array (can be empty [])
  "experience" : array           ← MUST be an array (can be empty [])
  "leadership" : array           ← MUST be an array (can be empty [])
  "projects"   : array           ← MUST be an array (can be empty [])
  "skills"     : object | null   ← MUST be an object or omitted — NOT an array, NOT a string
  "certifications": string[]     ← certification names ONLY (no dates, org, or issuer). Use [] if none.
 
CRITICAL TYPE RULES — these are the most common failure modes:
 
  summary    → string ONLY. "summary": "Text here."      ✓
                             "summary": ["Text here."]    ✗  (array = validator rejects)
                             "summary": { "text": "..." } ✗  (object = validator rejects)
 
  education, experience, leadership, projects
             → array ONLY.  "experience": [...]           ✓
                             "experience": {}              ✗  (object = validator rejects)
                             "experience": null            ✗  (null = validator rejects)
             If the candidate has no data for a section → use empty array [].
             NEVER omit these keys entirely.
 
  skills     → object ONLY.  "skills": { "programming_languages": [...] }  ✓
                              "skills": ["SQL", "Python"]                   ✗  (array = rejects)
                              "skills": "SQL, Python"                       ✗  (string = rejects)
             If no skills data → omit the key entirely or set to null.
 
── skills OBJECT SHAPE ──────────────────────────────────────────────────────
 
When skills is present, use this exact key structure:
 
  "skills": {
    "programming_languages" : string[],   ← e.g. ["Python", "SQL", "R"]
    "frameworks_libraries"  : string[],   ← e.g. ["pandas", "Power BI", "dbt"]
    "developer_tools"       : string[],   ← e.g. ["JIRA", "Git", "Tableau"]
    "other_skills"          : string[]    ← e.g. ["ETL", "Agile", "Data Modeling"]
  }
 
All four keys are optional inside the object, but the object itself must not be an array.
 
── certifications ARRAY SHAPE ───────────────────────────────────────────────
 
  "certifications": ["AWS Cloud Practitioner", "Azure Fundamentals"]
 
  • Each entry is a plain string — the certification name only.
  • Do NOT include issuing organization, dates, credential IDs, or URLs.
  • Only include certifications actually found in the raw resume text (or [] if none).
  • Do NOT invent certifications. You may omit certs not relevant to the JD.
  • If the candidate has no certifications → use empty array [].
 
── education ARRAY ITEM SHAPE ───────────────────────────────────────────────
 
Each item in "education" must be an object:
 
  {
    "school"   : string,   ← institution name
    "degree"   : string,   ← degree title only (e.g. "Master of Science in Business Analytics")
    "details"  : string,   ← additional detail line (scholarships, focus areas, honors)
                              Keep SEPARATE from degree — do NOT merge into one string.
                              The renderer wraps these independently; merging causes overflow.
    "dates"    : string,   ← e.g. "2023 – 2025"
    "gpa"      : string,   ← e.g. "3.5" or omit if not available
    "location" : string    ← e.g. "Syracuse, NY"
  }
 
── experience ARRAY ITEM SHAPE ──────────────────────────────────────────────
 
  {
    "title"    : string,     ← job title
    "company"  : string,     ← company name
    "dates"    : string,     ← e.g. "Aug 2024 – Present"
    "location" : string,     ← e.g. "Philadelphia, PA"
    "bullets"  : string[]    ← array of bullet strings, no leading "• " character
  }
 
── leadership ARRAY ITEM SHAPE ──────────────────────────────────────────────
 
  {
    "title"   : string,    ← role or award title
    "org"     : string,    ← organization name
    "dates"   : string,    ← year or date range
    "bullets" : string[]   ← array of bullet strings
  }
 
── projects ARRAY ITEM SHAPE ────────────────────────────────────────────────
 
  {
    "name"    : string,    ← project name
    "stack"   : string[],  ← technologies used, as an array
    "bullets" : string[]   ← array of bullet strings
  }
 
── RENDERER-SPECIFIC WARNINGS ───────────────────────────────────────────────
 
  • Do NOT merge "degree" and "details" into a single string.
    The renderer wraps them on separate lines. A merged string causes text overflow
    and layout collision between education entries.
 
  • Bullet strings must NOT include a leading bullet character ("•", "-", "*").
    The renderer draws its own bullet glyph. A leading character = double bullets.
 
  • "summary" must be a single plain string, not wrapped in any container.
    It is rendered directly with wrapLines() — no iteration expected.

  • "old_score" and "new_score" are plain integers at the TOP LEVEL, not inside "sections".
 
── PRE-OUTPUT SCHEMA SELF-CHECK ─────────────────────────────────────────────
 
Before finalizing JSON, verify each point:
 
  [ ] Root object has exactly "header", "sections", "old_score", "new_score" (no outer wrapper key)
  [ ] header.name is a non-empty string
  [ ] sections.summary is a string
  [ ] sections.education is an array
  [ ] sections.experience is an array
  [ ] sections.leadership is an array (use [] if no leadership data)
  [ ] sections.projects is an array (use [] if no projects data)
  [ ] sections.skills is an object or omitted — never an array or string
  [ ] sections.certifications is an array of strings (use [] if none)
  [ ] education items have "degree" and "details" as SEPARATE string fields
  [ ] No bullet string starts with "•", "-", or "*"
  [ ] Every employer, title, degree, and date traces back to the raw resume text
  [ ] old_score is an integer 0–100, computed against the RAW resumeText per the rubric
  [ ] new_score is an integer 0–100, computed against the FINAL output per the same rubric
  [ ] old_score and new_score are top-level numbers, not strings, not nested
 
If any check fails → fix before outputting.
 
========================
OUTPUT REQUIREMENTS
========================
 
Return STRICT JSON ONLY.
No markdown fences, no preamble, no explanation — raw JSON starting with { and ending with }.
 
Follow EXACT schema defined in the JSON SCHEMA CONTRACT above, including the top-level
"old_score" and "new_score" fields.
 
${COMBINED_JSON_SCHEMA}
 
========================
QUALITY BAR (VERY IMPORTANT)
========================
 
The output must feel like:
- A candidate who understands the job deeply and has done it before
- Not generic, not templated
- Competitive for top-tier roles
- Clear, sharp, results-driven, and PAGE-COMPLETE
 
If the resume feels thin, sparse, or leaves visible white space → you FAILED.
If the resume feels generic and not tailored to THIS JD → you FAILED.
If keywords are crammed into skills only with no bullet integration → you FAILED.
 
========================
FINAL CHECKLIST BEFORE OUTPUT
========================
 
[ ] Is this tailored to THIS specific job description?
[ ] Are keywords naturally embedded in bullets and narrative?
[ ] Are bullets outcome-driven with WHAT + HOW + IMPACT?
[ ] Does each role have 3–5 bullets?
[ ] Is the summary 4–6 sentences with a strong positioning statement?
[ ] Is the skills section categorized with a competency narrative?
[ ] Would a recruiter shortlist this in 6 seconds?
[ ] Does the resume fill 90–100% of a full page?
[ ] Does the JSON pass all schema checks listed above?
[ ] Does every fact in the output trace back to the raw resume text?
[ ] Have old_score and new_score both been honestly computed against the same rubric?
 
Only output JSON when ALL boxes are checked.
`;
}

function validateResume(resume: unknown): boolean {
  if (!resume || typeof resume !== "object") return false;
  const r = resume as Record<string, unknown>;
  const header = r.header;
  if (!header || typeof header !== "object") return false;
  const h = header as Record<string, unknown>;
  if (typeof h.name !== "string" || !h.name.trim()) return false;
  const sections = r.sections;
  if (!sections || typeof sections !== "object") return false;
  const sec = sections as Record<string, unknown>;
  const arrKeys = [
    "education",
    "experience",
    "leadership",
    "projects",
    "summary",
  ];
  for (const key of arrKeys) {
    if (key === "summary" && typeof sec[key] === "string") return true;
    if (!Array.isArray(sec[key])) return false;
  }
  const skills = sec.skills;
  if (skills != null && typeof skills !== "object") return false;
  const certifications = sec.certifications;
  if (certifications != null) {
    if (!Array.isArray(certifications)) return false;
    for (const cert of certifications) {
      if (typeof cert !== "string") return false;
    }
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: STRIPE_FUNCTION_CORS });
  }

  const secret = Deno.env.get("X-SECRET-KEY")!;

  const authHeader = req.headers.get("X-Secret-Key");
  if (authHeader !== secret) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const { jdText, resumeText, visitorAnonId } = await req.json();

  console.log("jdText", jdText);
  console.log("resumeText", resumeText);
  console.log("visitorAnonId", visitorAnonId);
  if (!jdText || !resumeText || !visitorAnonId) {
    console.error("Missing required fields");
    return jsonResponse({ error: "Missing required fields" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // check if visitor exists
  const { data: visitor, error: visitorError } = await supabase
    .from("visitors")
    .select("*")
    .eq("anon_id", visitorAnonId)
    .single();
  if (visitorError) {
    console.error(visitorError);
    return jsonResponse({ error: "Visitor not found" }, 404);
  }

  if (!visitor) {
    console.error("Visitor not found");
    return jsonResponse({ error: "Visitor not found" }, 404);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return jsonResponse({ error: "GEMINI_API_KEY is not set" }, 500);
  }

  const prompt = buildResumePromptForTrial({ jdText, resumeText });
  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  };

  const url = GEMINI_URL(apiKey);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Mark as used trial
    const { error } = await supabase
      .from("visitors")
      .update({ used_resume: true })
      .eq("id", visitor.id);
    if (error) {
      console.error(error);
      return jsonResponse({ error: "Failed to mark as used trial" }, 500);
    }
  } catch (e: unknown) {
    console.error(e);
    return jsonResponse(
      { error: "Failed to generate resume and cover letter" },
      500,
    );
  }

  if (!res.ok) {
    return jsonResponse({ error: "Failed to generate resume" }, 500);
  }

  let data: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
    };
  };
  try {
    data = await res.json();
  } catch {
    console.error("Invalid Gemini response");
    return jsonResponse({ error: "Invalid Gemini response" }, 502);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  console.log("text", text);
  if (!text) {
    console.error("Empty response from Gemini");
    return jsonResponse({ error: "Empty response from Gemini" }, 502);
  }

  let jsonStr = text;
  const match = text.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  if (match) jsonStr = match[1].trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    console.error("Gemini did not return valid JSON");
    return jsonResponse(
      { error: "Gemini did not return valid JSON", raw: text.slice(0, 500) },
      502,
    );
  }

  const obj = parsed as Record<string, unknown>;
  const resume = obj.resume ?? parsed;
  const recommendations = obj.recommendations;
  const applicationInfo = obj.application_info as {
    company_name: string;
    job_title: string;
  };

  console.log(resume);
  if (!validateResume(resume)) {
    console.error(
      "Invalid resume in response: missing header.name or sections",
    );
    return jsonResponse(
      { error: "Invalid resume in response: missing header.name or sections" },
      502,
    );
  }

  const { error: renderResumePdfError } = await supabase.functions.invoke(
    "render-resume-pdf",
    {
      headers: { "X-Secret-Key": secret },
      body: {
        resume: resume,
        visitorId: visitor.id,
        keywords: obj.keywords as {
          hardSkills: string[];
          softSkills: string[];
          tools: string[];
        },
        tokensInput: data.usageMetadata?.promptTokenCount ?? 0,
        tokensOutput: data.usageMetadata?.candidatesTokenCount ?? 0,
      },
    },
  );

  if (renderResumePdfError) {
    console.error(renderResumePdfError);
    return jsonResponse({ error: "Failed to render resume PDF" }, 500);
  }

  return jsonResponse(
    {
      resume: resume,
      recommendations: recommendations,
      applicationInfo: applicationInfo,
    },
    200,
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/trial-resume-and-cover-letter' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwOTkyMjU4NDF9.lXM_wo9WKrzpBbTky2RT_mB-nYjhjPKFW0rq-9AnZ58o2uKMgbHOOMocG_Ya2XDcIZbD0WU8wC9WV0wsVNhVog' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
