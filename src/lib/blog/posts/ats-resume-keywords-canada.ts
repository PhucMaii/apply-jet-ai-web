import { BLOG_CATEGORY_SLUG, type BlogPost } from "@/lib/blog/types"

export const ATS_RESUME_KEYWORDS_POST: BlogPost = {
	slug: "ats-resume-keywords-canada-without-stuffing",
	categorySlug: BLOG_CATEGORY_SLUG.atsResume,
	title:
		"ATS Resume Keywords in Canada: How to Match the Job Without Stuffing",
	excerpt:
		"Too few keywords and the ATS ignores you. Too many and a recruiter can smell it. Here's how to match a posting's language without stuffing.",
	seoTitle:
		"ATS Resume Keywords in Canada Without Stuffing | ApplyJet",
	seoDescription:
		"Learn how to match ATS keywords for Canadian job postings without stuffing: mirror the posting's exact terms, attach them to real accomplishments, and avoid the overcorrection trap.",
	publishedAt: "2026-08-20",
	readingMinutes: 10,
	tags: ["ATS", "resume keywords", "Canada jobs", "PGWP"],
	coverImage: "/blog/ats-keywords.png",
	coverImageAlt:
		"Job seeker working on a laptop at a conference table",
	relatedSlugs: [
		"how-ats-scoring-works-in-2026-and-how-to-beat-it",
		"what-canadian-tech-recruiters-want-in-six-seconds",
		"applyjet-vs-simplify-vs-tealhq-for-canadian-job-seekers",
	],
	blocks: [
		{
			type: "paragraph",
			text: "There are two kinds of resumes that get rejected by an ATS. One has too few keywords, and reads like it was written for a completely different job. The other has too many, and reads like someone pasted the job posting into their bullet points and called it a day. Both fail, just for opposite reasons.",
		},
		{
			type: "paragraph",
			text: 'Somewhere between "forgot to mention I know Python" and "Python Python Python detail oriented Python team player" is the version that actually works. That\'s what we\'re covering here: how to match a job posting\'s language closely enough to score well, without turning your resume into something a recruiter can smell from across the room.',
		},
		{
			type: "heading",
			level: 2,
			text: "Why keyword matching matters as much as it does",
		},
		{
			type: "paragraph",
			text: 'Roughly half of your ATS score comes down to how closely your resume\'s wording lines up with the job description\'s wording. Not vaguely similar wording either. Specific tools, specific skills, specific phrasing. If a posting says "stakeholder management" and you wrote "worked with clients," the system may not connect the two, even though you obviously mean the same thing. Machines aren\'t reading for vibes. They\'re pattern matching against a list.',
		},
		{
			type: "paragraph",
			text: "That's the entire reason keyword stuffing exists as a strategy in the first place. People figured out the pattern matching part and decided more must be better. It isn't, and here's why.",
		},
		{
			type: "heading",
			level: 2,
			text: "Why stuffing backfires",
		},
		{
			type: "paragraph",
			text: 'Modern screening doesn\'t stop at "does this word appear." Semantic analysis checks whether your resume actually reads coherently, and a bullet point like "responsible for Python, SQL, AWS, Docker, Kubernetes, and stakeholder management" scores worse on that layer than a real sentence describing what you did with those tools. It also reads terribly to an actual human, and eventually a human does read this thing, assuming you make it that far.',
		},
		{
			type: "paragraph",
			text: "There's a second problem too, and it's more of a Canadian job market specific one. Recruiters here, especially at smaller and mid sized companies, tend to skim resumes personally even when an ATS is involved, and a keyword stuffed resume is one of the fastest ways to get quietly deprioritized. It doesn't just look like an ATS trick. It looks like you didn't actually do the things you're claiming, just listed them.",
		},
		{
			type: "heading",
			level: 2,
			text: "The actual method: mirror, don't dump",
		},
		{
			type: "paragraph",
			text: "Here's the version that works, and it's honestly not that complicated once you see it laid out.",
		},
		{
			type: "heading",
			level: 3,
			text: "Step 1: Pull the real keywords from the posting",
		},
		{
			type: "paragraph",
			text: 'Read the job description and note every specific tool, skill, methodology, and qualification it mentions. Not adjectives like "passionate" or "driven." Actual nouns: React, stakeholder reporting, Agile, bilingual, SQL, six sigma, whatever the posting actually names. These are the terms the ATS is checking for and the terms a recruiter is scanning for.',
		},
		{
			type: "heading",
			level: 3,
			text: "Step 2: Check what you already have that matches",
		},
		{
			type: "paragraph",
			text: '"Built internal dashboards" and "developed data visualization tools" might be the same accomplishment described two different ways. You probably already did most of what the posting wants, just described differently. Find where your real experience already overlaps.',
		},
		{
			type: "heading",
			level: 3,
			text: "Step 3: Rewrite using their exact terms, not synonyms",
		},
		{
			type: "paragraph",
			text: 'This is the part people skip. If the posting says "cross functional collaboration," don\'t write "worked well with other teams." Write "cross functional collaboration," because that\'s the literal phrase both the ATS and the recruiter are pattern matching against. Swapping in a synonym feels more natural to write, but it costs you points for no real benefit.',
		},
		{
			type: "heading",
			level: 3,
			text: "Step 4: Attach it to something specific",
		},
		{
			type: "paragraph",
			text: 'This is what separates matching from stuffing. Don\'t just drop the term into a list. Use it inside an actual sentence describing a real accomplishment. "Led cross functional collaboration between engineering and design to ship a redesigned checkout flow" does everything a stuffed bullet does, plus it reads like a person wrote it, because a person did.',
		},
		{
			type: "heading",
			level: 3,
			text: "Step 5: Repeat only where it's true, not everywhere it fits",
		},
		{
			type: "paragraph",
			text: "A term you can genuinely back up is worth repeating once or twice across the resume, in different sections, if it's relevant in more than one place. A term you're stretching to include should appear exactly once, if at all. Don't force a keyword into your resume just because the posting mentioned it. That's how stuffing starts.",
		},
		{
			type: "heading",
			level: 2,
			text: "A quick before and after",
		},
		{
			type: "paragraph",
			text: 'Stuffed: "Experienced in React, TypeScript, Node.js, REST APIs, Agile, Scrum, and cross functional collaboration."',
		},
		{
			type: "paragraph",
			text: 'Matched: "Built and shipped customer facing features in React and TypeScript, working cross functionally with design and product in a two week Agile sprint cycle."',
		},
		{
			type: "paragraph",
			text: "Same keywords. Completely different score, and completely different read for a human. The second version proves you used these tools. The first one just claims it.",
		},
		{
			type: "heading",
			level: 2,
			text: "The Canadian specific wrinkle",
		},
		{
			type: "paragraph",
			text: 'If you\'re applying in Canada as a recent grad or a PGWP holder, there\'s an extra layer to be careful with. A lot of job seekers, trying to compensate for the well documented "Canadian experience" bias, overcorrect by cramming their resume with every buzzword from the posting to seem like a stronger local fit. It has the opposite effect. What actually helps is naming real, specific Canadian context wherever you legitimately have it: the city or province you worked in, a Canadian company or client name, a local certification or program. That\'s a far stronger signal than an extra row of keywords, and it\'s honest instead of performative.',
		},
		{
			type: "heading",
			level: 2,
			text: "The tedious part, again",
		},
		{
			type: "paragraph",
			text: "Doing this properly for one job posting takes maybe twenty minutes if you're being careful. Doing it for every application you send out, especially in a market where you might need to apply to dozens of postings to land a handful of interviews, adds up to hours of repetitive, easy to mess up work.",
		},
		{
			type: "paragraph",
			text: "That repetitive matching, reading the posting, comparing it against your resume, rewriting the right bullets in the right language, is exactly what ApplyJet AI automates. It flags the real gaps between your resume and a specific posting, and helps you close them without turning your bullet points into a keyword dump.",
		},
		{
			type: "paragraph",
			text: "Matching a job isn't about saying more. It's about saying the right things, in the right words, and actually meaning them.",
		},
	],
}
