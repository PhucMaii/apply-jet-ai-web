import { MapleLeafIcon } from "@/components/brand/maple-leaf-icon"
import { CANADA_RED } from "@/lib/canada-brand"
import { motion } from "framer-motion"
import { FileUp, Briefcase, Mail } from "lucide-react"
import { useLandingCopy } from "@/context/landing-copy-context"

const trustIcons = [MapleLeafIcon, FileUp, Briefcase, Mail] as const

export function TrustStrip() {
	const { trustStrip } = useLandingCopy()

	return (
		<section className="border-y border-border/60 bg-muted/15">
			<div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{trustStrip.map((label, index) => {
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
								<span
									className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/25"
									style={
										index === 0
											? {
													backgroundColor: `${CANADA_RED}14`,
													color: CANADA_RED,
													boxShadow: `inset 0 0 0 1px ${CANADA_RED}40`,
												}
											: undefined
									}
								>
									<Icon
										className={index === 0 ? "size-5" : "size-4"}
										aria-hidden
									/>
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
