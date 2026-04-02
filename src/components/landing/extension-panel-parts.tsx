/* eslint-disable react-refresh/only-export-components -- shared panel primitives + tokens */
import { motion } from "framer-motion"
import {
	Bookmark,
	ChevronDown,
	LayoutGrid,
	PencilLine,
	Plus,
	Sparkles,
	User,
} from "lucide-react"
import { APP_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"

export const EXTENSION_DISPLAY_NAME = APP_NAME

export const PANEL_BG = "#0f1115"
export const CARD_BG = "#1a1d23"
export const RAIL_BG = "#14161c"

export const resumeSkills = [
	"API integration",
	"JavaScript",
	"TypeScript",
	"CSS",
	"PostgreSQL",
	"Docker",
] as const

export const jobWantsSkills = [
	"Vue.js",
	"Leadership",
	"Jest",
	"Cypress",
	"Git",
] as const

const easeOutExpo = [0.22, 1, 0.36, 1] as [number, number, number, number]

export function ResumeFitRing({
	percent,
	animationKey = "default",
}: {
	percent: number
	animationKey?: string | number
}) {
	const r = 36
	const c = 2 * Math.PI * r
	const dash = (percent / 100) * c
	const label = `${percent % 1 === 0 ? percent : percent.toFixed(1)}%`

	return (
		<div className="relative mx-auto size-[7.5rem]">
			<svg
				className="size-full -rotate-90"
				viewBox="0 0 88 88"
				aria-hidden
			>
				<circle
					cx="44"
					cy="44"
					r={r}
					fill="none"
					stroke="color-mix(in oklab, white 8%, transparent)"
					strokeWidth="8"
				/>
				<motion.circle
					key={animationKey}
					cx="44"
					cy="44"
					r={r}
					fill="none"
					stroke="#22c55e"
					strokeWidth="8"
					strokeLinecap="round"
					initial={{ strokeDasharray: `0 ${c}` }}
					animate={{ strokeDasharray: `${dash} ${c}` }}
					transition={{ duration: 1.2, ease: easeOutExpo }}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
				<motion.span
					key={`${animationKey}-label`}
					className="font-display text-base font-bold tabular-nums leading-tight text-white sm:text-lg"
					initial={{ opacity: 0, scale: 0.92 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.35, duration: 0.35 }}
				>
					{label}
				</motion.span>
			</div>
		</div>
	)
}

export function ExtensionPanelHeader() {
	return (
		<div
			className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2.5"
			style={{ backgroundColor: PANEL_BG }}
		>
			<span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/25">
				<Sparkles className="size-3.5" aria-hidden />
			</span>
			<span className="font-display text-sm font-semibold tracking-tight text-white">
				{EXTENSION_DISPLAY_NAME}
			</span>
		</div>
	)
}

export function ExtensionNavRail() {
	return (
		<nav
			className="flex w-[3.25rem] shrink-0 flex-col items-center gap-2 border-l border-white/[0.06] py-3"
			style={{ backgroundColor: RAIL_BG }}
			aria-label="Extension navigation"
		>
			<button
				type="button"
				className="flex size-10 flex-col items-center justify-center gap-0.5 rounded-lg text-white/35 transition-colors hover:bg-white/[0.04] hover:text-white/55"
			>
				<User className="size-4" aria-hidden />
				<span className="text-[8px] font-medium leading-none">User</span>
			</button>
			<button
				type="button"
				className="flex size-10 flex-col items-center justify-center gap-0.5 rounded-lg bg-primary/25 text-primary ring-1 ring-primary/40"
			>
				<LayoutGrid className="size-4" aria-hidden />
				<span className="text-[8px] font-semibold leading-none">Tailor</span>
			</button>
			<button
				type="button"
				className="flex size-10 flex-col items-center justify-center gap-0.5 rounded-lg text-white/35 transition-colors hover:bg-white/[0.04] hover:text-white/55"
			>
				<PencilLine className="size-4" aria-hidden />
				<span className="text-[8px] font-medium leading-none">Apps</span>
			</button>
		</nav>
	)
}

export function ExtensionJobHeaderCard({
	title,
	company,
}: {
	title: string
	company: string
}) {
	return (
		<div
			className="rounded-xl border border-white/[0.06] p-3"
			style={{ backgroundColor: CARD_BG }}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<h3 className="font-display text-base font-semibold leading-tight text-white">
						{title}
					</h3>
					<p className="mt-0.5 text-xs text-white/50">{company}</p>
				</div>
				<button
					type="button"
					className="flex shrink-0 items-center gap-1 rounded-lg border border-primary/35 bg-primary/10 px-2.5 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/15"
				>
					<Bookmark className="size-3.5" aria-hidden />
					Save
				</button>
			</div>
		</div>
	)
}

export function ExtensionResumeFitCard({
	percent,
	animationKey,
}: {
	percent: number
	animationKey?: string | number
}) {
	return (
		<div
			className="rounded-xl border border-white/[0.06] p-3 pt-4"
			style={{ backgroundColor: CARD_BG }}
		>
			<p className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
				Resume fit
			</p>
			<div className="mt-2">
				<ResumeFitRing percent={percent} animationKey={animationKey} />
			</div>
			<p className="mt-3 text-center text-xs text-white/55">
				You match 6 of 11 skills this job wants.
			</p>
			<div className="mt-3 flex flex-wrap justify-center gap-1.5">
				<span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/25">
					Skills 80%
				</span>
				<span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[11px] font-medium text-sky-400 ring-1 ring-sky-500/25">
					Tools 40%
				</span>
				<span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-medium text-amber-400 ring-1 ring-amber-500/25">
					Soft 0%
				</span>
			</div>
		</div>
	)
}

export function ExtensionSkillsCompareCard() {
	return (
		<div
			className="space-y-3 rounded-xl border border-white/[0.06] p-3"
			style={{ backgroundColor: CARD_BG }}
		>
			<div>
				<p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
					From your original resume
				</p>
				<div className="mt-2 flex flex-wrap gap-1.5">
					{resumeSkills.map((skill) => (
						<span
							key={skill}
							className="rounded-full border border-emerald-500/45 bg-emerald-500/[0.07] px-2 py-0.5 text-[11px] text-emerald-200/90"
						>
							{skill}
						</span>
					))}
				</div>
			</div>
			<div>
				<p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
					Job wants — add if you have it
				</p>
				<div className="mt-2 flex flex-wrap gap-1.5">
					{jobWantsSkills.map((skill) => (
						<span
							key={skill}
							className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/55"
						>
							<Plus className="size-3 text-white/35" aria-hidden />
							{skill}
						</span>
					))}
				</div>
			</div>
		</div>
	)
}

export function ExtensionJobDescriptionSnippet({
	title,
	body,
}: {
	title: string
	body: string
}) {
	return (
		<div
			className="rounded-xl border border-white/[0.06]"
			style={{ backgroundColor: CARD_BG }}
		>
			<div className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left">
				<span className="text-xs font-medium text-white/80">{title}</span>
				<ChevronDown className="size-4 shrink-0 text-white/35" aria-hidden />
			</div>
			<div className="max-h-[4.5rem] overflow-y-auto thin-scrollbar border-t border-white/[0.05] px-3 py-2">
				<p className="text-[11px] leading-relaxed text-white/45">{body}</p>
			</div>
		</div>
	)
}

export function extensionPanelClassName(extra?: string) {
	return cn(
		"flex max-h-[min(28rem,65vh)] min-h-[16rem] overflow-hidden rounded-xl border border-white/[0.08] shadow-[0_0_0_1px_rgba(99,102,241,0.12),0_24px_48px_-24px_rgba(0,0,0,0.6)]",
		extra,
	)
}
