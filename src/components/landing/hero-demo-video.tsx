import { useCallback, useId, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Play } from "lucide-react"
import { LANDING_COPY } from "@/lib/landing-copy"
import { LANDING_EASE_OUT } from "@/lib/landing-motion"
import { cn } from "@/lib/utils"

const { video } = LANDING_COPY.hero

const YOUTUBE_THUMB_MAX = `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`
const YOUTUBE_THUMB_HQ = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`
const YOUTUBE_EMBED_SRC =
	`https://www.youtube-nocookie.com/embed/${video.youtubeId}` +
	`?autoplay=1&rel=0&modestbranding=1&playsinline=1`

interface HeroDemoVideoProps {
	className?: string
}

export function HeroDemoVideo({ className }: HeroDemoVideoProps) {
	const reduceMotion = useReducedMotion()
	const titleId = useId()
	const [isPlaying, setIsPlaying] = useState(false)
	const [thumbSrc, setThumbSrc] = useState(YOUTUBE_THUMB_MAX)

	const handlePlay = useCallback(() => {
		setIsPlaying(true)
	}, [])

	return (
		<motion.figure
			initial={reduceMotion ? false : { opacity: 0, y: 24 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: LANDING_EASE_OUT, delay: 0.15 }}
			className={cn("relative w-full min-w-0", className)}
			aria-labelledby={titleId}
		>
			<div className="mb-3 flex flex-wrap items-end justify-between gap-2 px-0.5">
				<div className="min-w-0">
					<p className="text-xs font-semibold uppercase tracking-[0.14em] text-landing-primary">
						{video.eyebrow}
					</p>
					<p
						id={titleId}
						className="mt-1 font-display text-lg font-medium tracking-tight text-landing-ink sm:text-xl"
					>
						{video.title}
					</p>
				</div>
				<p className="max-w-[16rem] text-right text-xs leading-snug text-landing-muted sm:text-[0.8125rem]">
					{video.description}
				</p>
			</div>

			<div
				className={cn(
					"group relative overflow-hidden rounded-2xl",
					"border border-landing-border/90 bg-landing-ink",
					"shadow-[0_1px_2px_rgba(26,26,46,0.06),0_24px_56px_-28px_rgba(26,26,46,0.45)]",
					"ring-1 ring-black/5",
				)}
			>
				{/* Soft ambient glow behind the frame */}
				<div
					className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-landing-primary/10 blur-3xl"
					aria-hidden
				/>

				{/* Browser chrome bar for product feel */}
				<div className="flex items-center gap-2 border-b border-white/10 bg-landing-ink px-3.5 py-2.5">
					<span className="flex gap-1.5" aria-hidden>
						<span className="size-2.5 rounded-full bg-white/20" />
						<span className="size-2.5 rounded-full bg-white/20" />
						<span className="size-2.5 rounded-full bg-white/20" />
					</span>
					<span className="ml-1 truncate rounded-md bg-white/8 px-2.5 py-1 text-[10px] font-medium tracking-wide text-landing-muted-on-dark sm:text-[11px]">
						applyjetai.com · walkthrough
					</span>
				</div>

				<div className="relative aspect-video w-full bg-neutral-950">
					{isPlaying ? (
						<iframe
							title={video.playLabel}
							src={YOUTUBE_EMBED_SRC}
							className="absolute inset-0 size-full border-0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowFullScreen
							loading="lazy"
							referrerPolicy="strict-origin-when-cross-origin"
						/>
					) : (
						<button
							type="button"
							onClick={handlePlay}
							className={cn(
								"absolute inset-0 flex size-full cursor-pointer items-center justify-center",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary",
								"focus-visible:ring-offset-2 focus-visible:ring-offset-landing-ink",
							)}
							aria-label={video.playLabel}
						>
							<img
								src={thumbSrc}
								alt=""
								width={1280}
								height={720}
								decoding="async"
								fetchPriority="high"
								className="absolute inset-0 size-full object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
								onError={() => setThumbSrc(YOUTUBE_THUMB_HQ)}
							/>

							{/* Readable gradient over thumbnail */}
							<div
								className={cn(
									"absolute inset-0 bg-gradient-to-t from-landing-ink/80 via-landing-ink/25 to-landing-ink/10",
									"transition-opacity duration-300 group-hover:from-landing-ink/70",
								)}
								aria-hidden
							/>

							<span
								className={cn(
									"relative z-10 flex size-16 items-center justify-center rounded-full sm:size-[4.5rem]",
									"bg-landing-primary text-white shadow-[0_12px_40px_-8px_rgba(79,70,229,0.75)]",
									"ring-4 ring-white/25",
									"transition duration-300 ease-out",
									"group-hover:scale-105 group-hover:bg-landing-primary-hover",
									"group-active:scale-95",
								)}
							>
								<Play
									className="size-7 translate-x-0.5 fill-current sm:size-8"
									aria-hidden
								/>
							</span>

							<span className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-3 sm:bottom-4 sm:left-4 sm:right-4">
								<span className="rounded-md bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm sm:text-xs">
									{video.caption}
								</span>
								<span className="hidden rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm sm:inline">
									YouTube
								</span>
							</span>
						</button>
					)}
				</div>
			</div>
		</motion.figure>
	)
}
