import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Lock, MoreHorizontal, Puzzle } from "lucide-react"

interface ExtensionChromeMockProps {
	className?: string
	children?: ReactNode
	url?: string
}

export function ExtensionChromeMock({
	className,
	children,
	url = "applyjetai.com/applications/full-stack-developer",
}: ExtensionChromeMockProps) {
	return (
		<motion.div
			className={cn(
				"overflow-hidden rounded-2xl border border-border/80 bg-muted/30 shadow-glow",
				className,
			)}
			initial={{ opacity: 0, y: 16 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-60px" }}
			transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
		>
			<div className="flex h-9 items-center gap-2 border-b border-border/60 bg-background/80 px-3">
				<div className="flex gap-1.5" aria-hidden>
					<span className="size-2.5 rounded-full bg-[#ff5f57]/90" />
					<span className="size-2.5 rounded-full bg-[#febc2e]/90" />
					<span className="size-2.5 rounded-full bg-[#28c840]/90" />
				</div>
				<div className="mx-auto flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border/50 bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">
					<Lock className="size-3 shrink-0 opacity-60" aria-hidden />
					<span className="truncate font-mono">{url}</span>
				</div>
				<Puzzle className="size-4 text-primary" aria-hidden />
				<MoreHorizontal className="size-4 text-muted-foreground" aria-hidden />
			</div>
			<div className="relative bg-[#0a0b10] p-2 sm:p-2.5">
				{children}
			</div>
		</motion.div>
	)
}
