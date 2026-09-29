import { createContext, useContext, useMemo, type ReactNode } from "react"
import { LANDING_COPY, type LandingCopy } from "@/lib/landing-copy"
import { applyLandingFeatureFlags } from "@/lib/landing-copy-features"

export type { LandingCopy }

const LandingCopyContext = createContext<LandingCopy>(
	applyLandingFeatureFlags(LANDING_COPY),
)

export function LandingCopyProvider({
	copy,
	children,
}: {
	copy: LandingCopy
	children: ReactNode
}) {
	const value = useMemo(() => applyLandingFeatureFlags(copy), [copy])

	return (
		<LandingCopyContext.Provider value={value}>
			{children}
		</LandingCopyContext.Provider>
	)
}

export function useLandingCopy(): LandingCopy {
	return useContext(LandingCopyContext)
}
