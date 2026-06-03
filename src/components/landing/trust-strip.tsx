import { motion } from "framer-motion"
import { Briefcase, FileUp, Mail, Monitor } from "lucide-react"
import { LANDING_COPY } from "@/lib/landing-copy"

const trustIcons = [Monitor, FileUp, Briefcase, Mail] as const

export function TrustStrip() {
	return (
		<section className="border-y border-border/60 bg-muted/15">
			<div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{LANDING_COPY.trustStrip.map((label, index) => {
						const Icon = trustIcons[index]
						return (
							<motion.div
								key={label}
								className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-1"
								initial={{ opacity: 0, y: 6 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.05 * index, duration: 0.4 }}
							>
								<span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/25">
									<Icon className="size-4" aria-hidden />
								</span>
								<p className="text-sm font-medium text-muted-foreground">
									{label}
								</p>
							</motion.div>
						)
					})}
				</div>
			</div>
		</section>
	)
}
