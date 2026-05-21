import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LINKS, ROUTES } from "@/lib/constants"

export function FinalCta() {
	return (
		<section className="pb-24 pt-6">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<motion.div
					className="rounded-3xl border border-border/80 bg-muted/25 px-6 py-10 text-center sm:px-10"
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.45 }}
				>
					<h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
						Stop submitting into the silent filter.
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
						Download the extension, sync your resume, and walk each posting with
						tailored documents and long answers—built from the JD, aimed at
						what ATS and humans actually read.
					</p>
					<div className="mt-8 flex flex-wrap justify-center gap-3">
						<Button size="lg" surface="dark" className="gap-2 shadow-glow" asChild>
							<a
								href={LINKS.extensionDownload}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Download className="size-4" aria-hidden />
								Download extension
							</a>
						</Button>
						<Button size="lg" variant="secondary" surface="dark" asChild>
							<Link to={ROUTES.signup}>Get started</Link>
						</Button>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
