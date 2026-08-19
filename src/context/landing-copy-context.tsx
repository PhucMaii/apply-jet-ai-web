import { createContext, useContext, type ReactNode } from "react"
import { LANDING_COPY, type LandingCopy } from "@/lib/landing-copy"

export type { LandingCopy }

const LandingCopyContext = createContext<LandingCopy>(LANDING_COPY)

export function LandingCopyProvider({
	copy,
	children,
}: {
	copy: LandingCopy
	children: ReactNode
}) {
	return (
		<LandingCopyContext.Provider value={copy}>
			{children}
		</LandingCopyContext.Provider>
	)
}

export function useLandingCopy(): LandingCopy {
	return useContext(LandingCopyContext)
}
