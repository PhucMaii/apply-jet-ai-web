import { ShieldCheck } from "lucide-react"
import { useLandingCopy } from "@/context/landing-copy-context"

export function PrivacyTrustLine() {
	const { privacyTrust } = useLandingCopy()

	return (
		<p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-landing-muted">
			<ShieldCheck
				className="size-4 shrink-0 text-landing-primary"
				aria-hidden
			/>
			<span>{privacyTrust.statement}</span>
		</p>
	)
}
