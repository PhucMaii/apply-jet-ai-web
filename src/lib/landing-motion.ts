export const LANDING_EASE_OUT = [0.22, 1, 0.36, 1] as [
	number,
	number,
	number,
	number,
]

export const landingFadeUp = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: LANDING_EASE_OUT },
	},
}

export const landingRevealViewport = {
	once: true,
	margin: "-80px",
} as const
