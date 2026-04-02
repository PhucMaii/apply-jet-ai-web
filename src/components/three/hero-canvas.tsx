import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Sparkles } from "@react-three/drei"
import { Suspense, useRef } from "react"
import type { Mesh } from "three"
import { useReducedMotion } from "framer-motion"

function ResumeFloat() {
	const meshRef = useRef<Mesh>(null)
	useFrame((_, delta) => {
		if (!meshRef.current) return
		meshRef.current.rotation.y += delta * 0.12
	})

	return (
		<Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.55}>
			<group ref={meshRef}>
				<mesh castShadow position={[0, 0, 0]}>
					<boxGeometry args={[1.15, 1.55, 0.07]} />
					<meshStandardMaterial
						color="#312e81"
						metalness={0.45}
						roughness={0.35}
						emissive="#4f46e5"
						emissiveIntensity={0.18}
					/>
				</mesh>
				{[-0.35, -0.1, 0.15].map((y, i) => (
					<mesh key={i} position={[0, y, 0.05]}>
						<boxGeometry args={[0.75, 0.04, 0.01]} />
						<meshStandardMaterial
							color="#a5b4fc"
							emissive="#818cf8"
							emissiveIntensity={0.25}
							transparent
							opacity={0.85}
						/>
					</mesh>
				))}
			</group>
		</Float>
	)
}

function AiRing() {
	const ref = useRef<Mesh>(null)
	useFrame((_, delta) => {
		if (!ref.current) return
		ref.current.rotation.z += delta * 0.25
	})

	return (
		<Float speed={2.2} rotationIntensity={0.9} floatIntensity={0.25}>
			<mesh ref={ref} rotation={[Math.PI / 2.15, 0.2, 0]}>
				<torusGeometry args={[1.95, 0.035, 24, 128]} />
				<meshStandardMaterial
					color="#6366f1"
					emissive="#22d3ee"
					emissiveIntensity={0.55}
					metalness={0.2}
					roughness={0.25}
					transparent
					opacity={0.92}
				/>
			</mesh>
		</Float>
	)
}

function Scene() {
	return (
		<>
			<ambientLight intensity={0.38} />
			<directionalLight
				castShadow
				position={[6, 8, 4]}
				intensity={1.15}
				color="#e0e7ff"
			/>
			<pointLight position={[-5, 1.5, 3]} intensity={0.85} color="#22d3ee" />
			<Sparkles
				count={48}
				scale={7}
				size={2.2}
				speed={0.35}
				color="#a5b4fc"
				opacity={0.4}
			/>
			<ResumeFloat />
			<AiRing />
		</>
	)
}

export function HeroCanvas() {
	const reduceMotion = useReducedMotion()

	if (reduceMotion) {
		return (
			<div
				className="relative flex h-[300px] w-full items-center justify-center md:h-[400px]"
				aria-hidden
			>
				<div className="absolute inset-10 rounded-[2rem] bg-gradient-to-br from-primary/30 via-accent/15 to-transparent blur-3xl" />
				<div className="relative h-52 w-40 rounded-xl border border-border bg-gradient-to-b from-muted to-background shadow-glow" />
				<div className="absolute h-56 w-56 rounded-full border border-primary/40 opacity-60" />
			</div>
		)
	}

	return (
		<div className="h-[300px] w-full md:h-[420px]">
			<Canvas
				shadows
				dpr={[1, 1.75]}
				gl={{
					alpha: true,
					antialias: true,
					powerPreference: "high-performance",
				}}
				onCreated={({ gl }) => {
					gl.setClearColor(0x000000, 0)
				}}
				camera={{ position: [0, 0, 5.8], fov: 42 }}
			>
				<Suspense fallback={null}>
					<Scene />
				</Suspense>
			</Canvas>
		</div>
	)
}
