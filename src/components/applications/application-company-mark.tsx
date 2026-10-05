import { getApplicationCompanyInitials } from "@/lib/application-display"
import { cn } from "@/lib/utils"

const MARK_TONES = [
	"bg-indigo-50 text-indigo-700",
	"bg-sky-50 text-sky-700",
	"bg-emerald-50 text-emerald-700",
	"bg-amber-50 text-amber-800",
	"bg-rose-50 text-rose-700",
	"bg-stone-100 text-stone-700",
] as const

function pickTone(seed: string): string {
	let hash = 0
	for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
	return MARK_TONES[hash % MARK_TONES.length] ?? MARK_TONES[0]
}

interface ApplicationCompanyMarkProps {
	companyName: string | null | undefined
	size?: "sm" | "md"
	className?: string
}

export function ApplicationCompanyMark({
	companyName,
	size = "md",
	className,
}: ApplicationCompanyMarkProps) {
	const name = companyName?.trim() ?? ""

	return (
		<span
			className={cn(
				"flex shrink-0 items-center justify-center rounded-md font-semibold tracking-wide",
				size === "md" ? "size-9 text-xs" : "size-7 text-[10px]",
				pickTone(name || "?"),
				className,
			)}
			aria-hidden
		>
			{getApplicationCompanyInitials(name)}
		</span>
	)
}
