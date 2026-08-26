import { BLOG_CATEGORY_SLUG, type BlogPost } from "@/lib/blog/types"

export const TECH_RECRUITERS_POST: BlogPost = {
	slug: "what-canadian-tech-recruiters-want-in-six-seconds",
	categorySlug: BLOG_CATEGORY_SLUG.techRecruiters,
	title:
		"What Canadian Tech Recruiters Actually Want (In the First Six Seconds)",
	excerpt:
		"Recruiters do not read your resume at first—they glance. Here’s what they’re actually looking for in that tiny window, and how to make those six seconds count.",
	seoTitle:
		"What Canadian Tech Recruiters Want in Six Seconds | ApplyJet",
	seoDescription:
		"Learn what Canadian tech recruiters scan for in six seconds: clear titles, a matching top third, Canadian-experience signals, numbers over adjectives, and scannable formatting.",
	publishedAt: "2026-08-22",
	readingMinutes: 10,
	tags: ["tech recruiting", "Canada", "resume", "software jobs", "PGWP"],
	coverImage: "/blog/tech-recruiters.png",
	coverImageAlt:
		"Recruiter interviewing a candidate across a desk in a modern office",
	relatedSlugs: [
		"how-ats-scoring-works-in-2026-and-how-to-beat-it",
		"ats-resume-keywords-canada-without-stuffing",
		"applyjet-vs-simplify-vs-tealhq-for-canadian-job-seekers",
	],
	blocks: [
		{
			type: "paragraph",
			text: "Recruiters do not read your resume. Not at first, anyway. They glance at it the way you glance at a menu when you already know what you're ordering: fast, half distracted, looking for a handful of things to confirm before moving on.",
		},
		{
			type: "paragraph",
			text: "Six seconds is the number that gets thrown around, and honestly it might be generous. If you've applied to forty jobs and heard back from two, it's not because your experience is bad. It's because in six seconds, nobody found a reason to slow down.",
		},
		{
			type: "paragraph",
			text: "So what are they actually looking for in that tiny window? Not your personality. Not your objective statement (please remove your objective statement). Here's what's really happening in a recruiter's brain during that first glance.",
		},
		{
			type: "heading",
			level: 2,
			text: "1. Can they place you immediately",
		},
		{
			type: "paragraph",
			text: 'The very first thing a recruiter needs is a fast answer to "what is this person, and can I use them." Job title, most recent company, years of experience. If they have to hunt for your current role or squint at a wall of text to figure out what you actually do, you\'ve already lost momentum you didn\'t have much of to begin with.',
		},
		{
			type: "paragraph",
			text: '"Frontend Developer, React and TypeScript" beats a clever tagline every time. Put your title and your specialty right at the top, in plain language. Recruiters aren\'t grading your creativity here. They\'re pattern matching against an open req, and pattern matching is quick when you make it easy.',
		},
		{
			type: "heading",
			level: 2,
			text: "2. Does the top third match the job",
		},
		{
			type: "paragraph",
			text: "Most recruiters don't read top to bottom. They scan the top third, and if nothing there matches what they're hiring for, the rest of the page might as well not exist. This is exactly why generic resumes struggle so much in the Canadian market. If your top third talks about a different industry, a different tech stack, or a different level of seniority than the posting, you're relying on the recruiter to keep reading out of curiosity. They will not.",
		},
		{
			type: "paragraph",
			text: 'This is also where a lot of international grads get quietly filtered out, not because of visa status, but because their resume doesn\'t lead with anything that screams "I already know how to work in this."',
		},
		{
			type: "heading",
			level: 2,
			text: "3. Canadian experience, or something that reads like it",
		},
		{
			type: "paragraph",
			text: 'We should say this clearly, because it\'s one of the most common frustrations for new grads and PGWP holders: yes, "Canadian experience" is a real and slightly annoying bias in this market. But you can work around it faster than you\'d think. Local internships, co-ops, freelance clients, open source contributions with real collaborators, even volunteer tech work for a Canadian nonprofit all count. Recruiters aren\'t necessarily looking for a specific flag. They\'re looking for evidence you already know how teams, timelines, and workplace norms function here. Give them that evidence anywhere you can find it.',
		},
		{
			type: "heading",
			level: 2,
			text: "4. Numbers, not adjectives",
		},
		{
			type: "paragraph",
			text: '"Hardworking, detail oriented team player" tells a recruiter nothing, and everyone writes it, so it\'s basically invisible at this point. What actually catches an eye in six seconds is a number. Cut load time by 40 percent. Shipped a feature used by 10,000 users. Reduced bug reports by a third after a refactor. Numbers act like little flags planted in the text. Even a skimming eye catches a percentage sign.',
		},
		{
			type: "paragraph",
			text: 'If you genuinely can\'t quantify something, describe the scope instead. "Owned the checkout flow for a product with 200,000 monthly users" still works even without a specific metric attached.',
		},
		{
			type: "heading",
			level: 2,
			text: "5. A format that doesn't fight the reader",
		},
		{
			type: "paragraph",
			text: "This one is less about charm and more about not accidentally sabotaging yourself. Dense paragraphs, tiny fonts, a wall of unbroken text, all of it slows a skim down, and a slow skim is a skim that stops early. Short bullets. Clear section headers. White space that gives the eye somewhere to land. None of this is exciting advice, but it's the difference between getting fully scanned and getting half scanned.",
		},
		{
			type: "paragraph",
			text: "And yes, this matters for the software doing the first pass too. Clean formatting isn't just for the human. It's for the parser reading it before the human ever does.",
		},
		{
			type: "heading",
			level: 2,
			text: "6. Something that makes you memorable, briefly",
		},
		{
			type: "paragraph",
			text: "Once the basics are covered, small things start to matter. A side project that shows initiative. A specific, well known company or product on your resume. A tech stack line that lines up almost perfectly with the job posting. These are the details that make a recruiter pause half a second longer than they planned to, and half a second longer is sometimes the whole game.",
		},
		{
			type: "heading",
			level: 2,
			text: "The uncomfortable summary",
		},
		{
			type: "paragraph",
			text: "Recruiters aren't being lazy when they skim. They're managing volume, often hundreds of applications for a single opening. Your job isn't to convince them you're qualified in six seconds. It's to make the six second version of your resume so obviously relevant that it earns you the next sixty.",
		},
		{
			type: "paragraph",
			text: "That means the top of your resume should basically be a highlight reel: your title, your specialty, a quick signal you belong in the Canadian market, and a couple of numbers that back it up. Everything else can wait for the full read.",
		},
		{
			type: "paragraph",
			text: "If tailoring your top third for every single application sounds exhausting, that's because it is, which is exactly the kind of tedious, repetitive work ApplyJet AI is built to take off your plate. It reads the job posting, compares it against your actual resume, and helps you lead with what that specific recruiter is scanning for, instead of hoping they read far enough to find it themselves.",
		},
		{
			type: "paragraph",
			text: "Six seconds isn't a lot of time. But it's enough, if you use it on purpose.",
		},
	],
}
