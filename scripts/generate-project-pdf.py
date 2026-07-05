#!/usr/bin/env python3
"""Generate a PDF summary of the ApplyJet AI project."""

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / ".pdf-tools"))

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
	HRFlowable,
	PageBreak,
	Paragraph,
	SimpleDocTemplate,
	Spacer,
	Table,
	TableStyle,
)

OUTPUT_PATH = Path(__file__).resolve().parent.parent / "ApplyJet-Project-Summary.pdf"


def build_styles():
	base = getSampleStyleSheet()
	styles = {
		"title": ParagraphStyle(
			"Title",
			parent=base["Title"],
			fontSize=26,
			leading=30,
			textColor=colors.HexColor("#0f172a"),
			spaceAfter=6,
			alignment=TA_CENTER,
		),
		"subtitle": ParagraphStyle(
			"Subtitle",
			parent=base["Normal"],
			fontSize=12,
			leading=16,
			textColor=colors.HexColor("#475569"),
			alignment=TA_CENTER,
			spaceAfter=20,
		),
		"h1": ParagraphStyle(
			"H1",
			parent=base["Heading1"],
			fontSize=16,
			leading=20,
			textColor=colors.HexColor("#1e40af"),
			spaceBefore=18,
			spaceAfter=8,
		),
		"h2": ParagraphStyle(
			"H2",
			parent=base["Heading2"],
			fontSize=13,
			leading=16,
			textColor=colors.HexColor("#334155"),
			spaceBefore=12,
			spaceAfter=6,
		),
		"body": ParagraphStyle(
			"Body",
			parent=base["Normal"],
			fontSize=10.5,
			leading=15,
			textColor=colors.HexColor("#1e293b"),
			alignment=TA_JUSTIFY,
			spaceAfter=8,
		),
		"bullet": ParagraphStyle(
			"Bullet",
			parent=base["Normal"],
			fontSize=10.5,
			leading=14,
			textColor=colors.HexColor("#1e293b"),
			leftIndent=14,
			bulletIndent=0,
			spaceAfter=4,
		),
		"meta": ParagraphStyle(
			"Meta",
			parent=base["Normal"],
			fontSize=9,
			textColor=colors.HexColor("#64748b"),
			alignment=TA_CENTER,
		),
	}
	return styles


def bullet_list(items, style):
	return [Paragraph(f"• {item}", style) for item in items]


def timeline_table(rows):
	data = [["Date", "Commit", "Description"]]
	data.extend(rows)
	table = Table(data, colWidths=[0.85 * inch, 0.65 * inch, 4.8 * inch])
	table.setStyle(
		TableStyle(
			[
				("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
				("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
				("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
				("FONTSIZE", (0, 0), (-1, 0), 9),
				("FONTSIZE", (0, 1), (-1, -1), 8.5),
				("FONTNAME", (0, 1), (1, -1), "Helvetica-Bold"),
				("VALIGN", (0, 0), (-1, -1), "TOP"),
				("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
				("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#e2e8f0")),
				("LEFTPADDING", (0, 0), (-1, -1), 6),
				("RIGHTPADDING", (0, 0), (-1, -1), 6),
				("TOPPADDING", (0, 0), (-1, -1), 5),
				("BOTTOMPADDING", (0, 0), (-1, -1), 5),
			]
		)
	)
	return table


def tech_table(rows):
	data = [["Category", "Technologies"]]
	data.extend(rows)
	table = Table(data, colWidths=[1.4 * inch, 5.0 * inch])
	table.setStyle(
		TableStyle(
			[
				("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
				("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
				("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
				("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
				("FONTSIZE", (0, 0), (-1, -1), 9),
				("VALIGN", (0, 0), (-1, -1), "TOP"),
				("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
				("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#cbd5e1")),
				("LEFTPADDING", (0, 0), (-1, -1), 8),
				("RIGHTPADDING", (0, 0), (-1, -1), 8),
				("TOPPADDING", (0, 0), (-1, -1), 6),
				("BOTTOMPADDING", (0, 0), (-1, -1), 6),
			]
		)
	)
	return table


def build_story(styles):
	story = []

	story.append(Paragraph("ApplyJet AI", styles["title"]))
	story.append(
		Paragraph(
			"Project Summary &amp; Development Report",
			styles["subtitle"],
		)
	)
	story.append(
		Paragraph(
			f"Generated {date.today().strftime('%B %d, %Y')} · Author: PhucMaii",
			styles["meta"],
		)
	)
	story.append(Spacer(1, 0.15 * inch))
	story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1")))
	story.append(Spacer(1, 0.2 * inch))

	story.append(Paragraph("1. Project Overview", styles["h1"]))
	story.append(
		Paragraph(
			"<b>ApplyJet AI</b> is a full-stack web application for job seekers. "
			"It provides a premium marketing landing site and an authenticated workspace "
			"where users upload a resume once, create job applications, and generate "
			"tailored resumes, cover letters, and HR contact lists — all in the browser.",
			styles["body"],
		)
	)
	story.append(
		Paragraph(
			"The product evolved from a Chrome extension companion site into a "
			"standalone browser-based platform. Users sign up with email/password or "
			"OAuth (Google), manage their autofill profile, track applications, and "
			"upgrade via Stripe for unlimited generations.",
			styles["body"],
		)
	)

	story.append(Paragraph("2. Technology Stack", styles["h1"]))
	story.extend(
		[
			tech_table(
				[
					["Frontend/src", "React 19, Vite 8, TypeScript, React Router 7"],
					["Styling", "Tailwind CSS v4, Framer Motion, custom theme tokens"],
					["3D / Effects", "React Three Fiber, Three.js, mouse spotlight"],
					["Backend", "Supabase (Auth, Postgres, Storage, Edge Functions)"],
					["Payments", "Stripe Checkout, Customer Portal, Webhooks"],
					["Data fetching", "TanStack React Query, React Hook Form"],
					["UI primitives", "Radix UI (Tabs, Label, Slot), Lucide icons"],
					["Onboarding", "Driver.js guided product tour"],
					["PDF parsing", "pdfjs-dist for resume upload processing"],
					["Deployment", "Vercel (vercel.json configured)"],
				]
			),
			Spacer(1, 0.15 * inch),
		]
	)

	story.append(Paragraph("3. Application Architecture", styles["h1"]))
	story.append(Paragraph("3.1 Frontend Routes", styles["h2"]))
	story.extend(
		bullet_list(
			[
				"<b>/</b> — Marketing landing page (hero, how-it-works, pricing, CTAs)",
				"<b>/login</b>, <b>/signup</b>, <b>/auth/callback</b> — Authentication flows",
				"<b>/applications</b> — Protected list of job applications",
				"<b>/applications/new</b> — Create a new application from a job description",
				"<b>/applications/:id</b> — Application detail with generated docs &amp; HR contacts",
				"<b>/profile</b> — User autofill profile, resume upload, billing &amp; usage",
				"<b>/privacy</b>, <b>/terms</b>, <b>/support</b> — Legal and support pages",
			],
			styles["bullet"],
		)
	)

	story.append(Paragraph("3.2 Key Source Directories", styles["h2"]))
	story.extend(
		bullet_list(
			[
				"<b>src/pages/</b> — Page-level components for each route",
				"<b>src/components/landing/</b> — Marketing sections and hero visuals",
				"<b>src/components/applications/</b> — Application CRUD, detail views, document previews",
				"<b>src/components/profile/</b> — Profile editors (contact, work, education, projects, skills)",
				"<b>src/components/onboarding/</b> — Welcome modal and guided tour",
				"<b>src/lib/skill-extractor/</b> — Job description skill matching engine",
				"<b>src/context/auth-context.tsx</b> — Supabase session management",
				"<b>supabase/functions/</b> — Stripe checkout, portal, and webhook handlers",
			],
			styles["bullet"],
		)
	)

	story.append(PageBreak())
	story.append(Paragraph("4. Core Features Built", styles["h1"]))

	story.append(Paragraph("4.1 Authentication &amp; User Management", styles["h2"]))
	story.extend(
		bullet_list(
			[
				"Email/password sign-up and login via Supabase Auth",
				"OAuth integration (Google) with auth callback handler",
				"Protected routes redirect unauthenticated users to /login",
				"Auth trigger auto-creates profiles, users, and subscription rows on signup",
			],
			styles["bullet"],
		)
	)

	story.append(Paragraph("4.2 Profile &amp; Resume Management", styles["h2"]))
	story.extend(
		bullet_list(
			[
				"Resume upload (PDF/DOCX) with automatic profile pre-fill",
				"Editable profile sections: contact, work experience, education, projects, links, skills, disclosure",
				"Autosave on profile edits — changes persist without manual save clicks",
				"Projects editor allowing users to input personal/side projects",
				"Private Supabase Storage bucket for resume files with RLS policies",
			],
			styles["bullet"],
		)
	)

	story.append(Paragraph("4.3 Job Applications Workflow", styles["h2"]))
	story.extend(
		bullet_list(
			[
				"Create applications by pasting job title, company, and full job description",
				"Application list table with status badges and empty states",
				"Application detail page with overview, status updates, and inline editing",
				"AI-generated tailored resume per application",
				"AI-generated role-specific cover letter (works without job URL)",
				"HR contact finder — discover recruiters at the target company",
				"Delete application control with confirmation modal",
				"Document preview for generated resume and cover letter",
				"Match score showing skill overlap between profile and job description",
			],
			styles["bullet"],
		)
	)

	story.append(Paragraph("4.4 Skill Extractor Engine", styles["h2"]))
	story.append(
		Paragraph(
			"A custom skill-matching library parses job descriptions, detects sections "
			"(requirements, qualifications, etc.), extracts candidate skills, and matches "
			"them against a skill dictionary with fuzzy matching, alias resolution, and "
			"confidence scoring.",
			styles["body"],
		)
	)

	story.append(Paragraph("4.5 Billing, Usage &amp; Pro Features", styles["h2"]))
	story.extend(
		bullet_list(
			[
				"Three-tier pricing: Free ($0), Job Hunt Pack ($3.99 one-time), Pro ($9.99/mo)",
				"Stripe Checkout for Pro subscription and Job Hunt Pack purchase",
				"Stripe Customer Portal for self-service billing management",
				"Stripe webhook syncs subscription state into Postgres",
				"Usage tracking UI: resume generations, cover letters, HR contact searches",
				"Pro feature guard — limits free users and prompts upgrade when exhausted",
				"Usage metric cards with warning/exhausted states at 80%/100% thresholds",
			],
			styles["bullet"],
		)
	)

	story.append(Paragraph("4.6 Onboarding &amp; UX", styles["h2"]))
	story.extend(
		bullet_list(
			[
				"Multi-step onboarding tour powered by Driver.js (16 steps)",
				"Guides users: welcome → upload resume → review profile sections → create application → generate resume",
				"Welcome modal for first-time users",
				"Premium landing page with 3D hero canvas, trust strip, pricing, and comparison sections",
				"Rebrand from extension-first to browser-first product positioning",
				"Mouse spotlight cursor-follow glow effect on landing page",
				"Responsive layout with modern Tailwind design system",
			],
			styles["bullet"],
		)
	)

	story.append(PageBreak())
	story.append(Paragraph("5. Database &amp; Backend", styles["h1"]))
	story.extend(
		bullet_list(
			[
				"<b>profiles</b> — Display name and plan mirror for auth.users",
				"<b>users</b> — Full autofill profile (name, address, salary, summary, etc.)",
				"<b>resumes</b> — Metadata for uploaded resume files in Storage",
				"<b>applications</b> — Job applications with title, company, description, status",
				"<b>subscriptions</b> — Stripe customer/subscription IDs, plan, status, period end",
				"<b>user_usage</b> — Generation limits and usage counters per metric",
				"Row Level Security (RLS) on all tables — users can only access their own data",
				"Supabase Edge Functions: stripe-checkout, stripe-customer-portal, stripe-webhook",
			],
			styles["bullet"],
		)
	)

	story.append(Paragraph("6. Development Timeline", styles["h1"]))
	story.append(
		Paragraph(
			"Chronological commit history from April–June 2026 (24 commits):",
			styles["body"],
		)
	)
	story.append(Spacer(1, 0.1 * inch))
	story.append(
		timeline_table(
			[
				["2026-04-02", "6df3d88", "Initial project setup — React + Vite + Supabase scaffold"],
				["2026-04-03", "d2c1b97", "Email/password authentication"],
				["2026-05-07", "7d2d68c", "Extension download CTA routing"],
				["2026-05-20", "ce5bc41", "Theme redesign for improved visual polish"],
				["2026-05-21", "3ab6a1c", "Application detail page with resume &amp; cover letter generation"],
				["2026-05-22", "5f070e5", "HR contact finder feature"],
				["2026-06-02", "6a171be", "Profile autosave"],
				["2026-06-02", "595541a", "Pro feature guard for usage limits"],
				["2026-06-02", "81e24ee", "User usage dashboard UI"],
				["2026-06-02", "39eb889", "OAuth auth callback handler"],
				["2026-06-03", "479d965", "Rebrand from extension to standalone website"],
				["2026-06-03", "95845b2", "Projects input section in profile"],
				["2026-06-05", "9ee19cc", "Delete application functionality"],
				["2026-06-07", "1355e76", "Onboarding tour initialization"],
				["2026-06-07", "160b66f", "Landing page rebrand and copy refresh"],
				["2026-06-23", "92613ee", "Job Hunt Pack one-time purchase tier"],
			]
		)
	)

	story.append(Spacer(1, 0.2 * inch))
	story.append(Paragraph("7. Summary", styles["h1"]))
	story.append(
		Paragraph(
			"Over approximately three months, this project was built from scratch into a "
			"production-ready job application platform. The work spans frontend UI/UX "
			"(landing page, onboarding, profile editors, application management), backend "
			"infrastructure (Supabase schema, RLS, Storage, Edge Functions), payment "
			"integration (Stripe subscriptions and one-time purchases), and AI-powered "
			"document generation workflows. The codebase contains 200+ source files with "
			"a clean modular architecture, typed Supabase client, and a reusable skill "
			"matching engine.",
			styles["body"],
		)
	)

	story.append(Spacer(1, 0.3 * inch))
	story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1")))
	story.append(Spacer(1, 0.1 * inch))
	story.append(
		Paragraph(
			"ApplyJet AI · applyjet-ai · React + Supabase + Stripe",
			styles["meta"],
		)
	)

	return story


def main():
	styles = build_styles()
	doc = SimpleDocTemplate(
		str(OUTPUT_PATH),
		pagesize=letter,
		leftMargin=0.75 * inch,
		rightMargin=0.75 * inch,
		topMargin=0.75 * inch,
		bottomMargin=0.75 * inch,
		title="ApplyJet AI — Project Summary",
		author="PhucMaii",
	)
	doc.build(build_story(styles))
	print(f"PDF written to: {OUTPUT_PATH}")


if __name__ == "__main__":
	main()
