import { Link } from "react-router-dom"
import {
	Briefcase,
	FileSearch,
	Scale,
	Timer,
	Users,
	type LucideIcon,
} from "lucide-react"
import { blogCategoryPath, ROUTES } from "@/lib/constants"
import type { BlogCategory } from "@/lib/blog/types"
import { cn } from "@/lib/utils"

const CATEGORY_ICONS: Record<BlogCategory["icon"], LucideIcon> = {
	fileSearch: FileSearch,
	briefcase: Briefcase,
	timer: Timer,
	users: Users,
	scale: Scale,
}

interface BlogCategoryChipProps {
	category: BlogCategory
	active?: boolean
	className?: string
}

export function BlogCategoryChip({
	category,
	active = false,
	className,
}: BlogCategoryChipProps) {
	const Icon = CATEGORY_ICONS[category.icon]

	return (
		<Link
			to={blogCategoryPath(category.slug)}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5",
				"text-xs font-semibold transition-colors",
				active
					? "border-landing-primary/40 bg-landing-primary/10 text-landing-primary"
					: "border-landing-border bg-landing-paper text-landing-muted hover:border-landing-primary/30 hover:text-landing-ink",
				className,
			)}
		>
			<Icon className="size-3.5 shrink-0 opacity-80" aria-hidden />
			{category.shortName}
		</Link>
	)
}

interface BlogCategoryNavProps {
	categories: readonly BlogCategory[]
	activeSlug?: string
	showAll?: boolean
}

export function BlogCategoryNav({
	categories,
	activeSlug,
	showAll = true,
}: BlogCategoryNavProps) {
	return (
		<nav
			className="flex flex-wrap gap-2"
			aria-label="Blog categories"
		>
			{showAll ? (
				<Link
					to={ROUTES.blog}
					className={cn(
						"inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
						!activeSlug
							? "border-landing-primary/40 bg-landing-primary/10 text-landing-primary"
							: "border-landing-border bg-landing-paper text-landing-muted hover:text-landing-ink",
					)}
				>
					All posts
				</Link>
			) : null}
			{categories.map((category) => (
				<BlogCategoryChip
					key={category.slug}
					category={category}
					active={activeSlug === category.slug}
				/>
			))}
		</nav>
	)
}
