import { motion } from "framer-motion"
import { Building2, Cpu, ShieldCheck, Zap } from "lucide-react"

const items = [
	{
		icon: Zap,
		label: "Most applications are filtered out before a human reads them",
	},
	{
		icon: Cpu,
		label: "Tailored resume + cover + long answers per posting",
	},
	{
		icon: ShieldCheck,
		label: "Your materials stay in your account—no mystery uploads",
	},
	{
		icon: Building2,
		label: "Works on the job sites where you already apply",
	},
] as const

export function TrustStrip() {
	return (
		<section className="border-y border-border/60 bg-muted/15">
			<div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{items.map((item, i) => (
						<motion.div
							key={item.label}
							className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-1"
							initial={{ opacity: 0, y: 6 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.05 * i, duration: 0.4 }}
						>
							<span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/25">
								<item.icon className="size-4" aria-hidden />
							</span>
							<p className="text-sm font-medium text-muted-foreground">
								{item.label}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
