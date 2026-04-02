import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"
import { useEffect } from "react"

/**
 * Soft radial glow that follows the pointer for a premium “spotlight” feel.
 */
export function MouseSpotlight() {
	const mouseX = useMotionValue(-200)
	const mouseY = useMotionValue(-200)
	const springX = useSpring(mouseX, { stiffness: 90, damping: 28, mass: 0.4 })
	const springY = useSpring(mouseY, { stiffness: 90, damping: 28, mass: 0.4 })

	const background = useMotionTemplate`radial-gradient(520px circle at ${springX}px ${springY}px, color-mix(in oklab, var(--color-primary) 26%, transparent), transparent 58%)`

	useEffect(() => {
		const onMove = (e: MouseEvent) => {
			mouseX.set(e.clientX)
			mouseY.set(e.clientY)
		}
		window.addEventListener("mousemove", onMove, { passive: true })
		return () => window.removeEventListener("mousemove", onMove)
	}, [mouseX, mouseY])

	return (
		<motion.div
			className="pointer-events-none fixed inset-0 z-0 opacity-70 mix-blend-screen"
			aria-hidden
			style={{ background }}
		/>
	)
}
