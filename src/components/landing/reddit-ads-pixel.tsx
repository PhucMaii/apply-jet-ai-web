import { useEffect } from "react"
import { REDDIT_ADS_PIXEL_ID } from "@/lib/constants"

declare global {
	interface Window {
		rdt?: (...args: unknown[]) => void
	}
}

const PIXEL_SCRIPT_ID = "reddit-ads-pixel"

/**
 * Loads the Reddit pixel once and tracks PageVisit.
 * Mount only on the ads landing page.
 */
export function RedditAdsPixel({
	pixelId = REDDIT_ADS_PIXEL_ID,
}: {
	pixelId?: string
}) {
	useEffect(() => {
		if (typeof window === "undefined" || typeof document === "undefined") {
			return
		}

		if (!window.rdt) {
			const rdt = function (...args: unknown[]) {
				const fn = window.rdt as
					| ((...a: unknown[]) => void) & {
							sendEvent?: (...a: unknown[]) => void
							callQueue?: unknown[][]
					  }
				if (fn?.sendEvent) {
					fn.sendEvent(...args)
					return
				}
				fn.callQueue = fn.callQueue ?? []
				fn.callQueue.push(args)
			} as typeof window.rdt & {
				callQueue?: unknown[][]
				sendEvent?: (...args: unknown[]) => void
			}
			(rdt as { callQueue?: unknown[][] }).callQueue = []
			window.rdt = rdt

			if (!document.getElementById(PIXEL_SCRIPT_ID)) {
				const script = document.createElement("script")
				script.id = PIXEL_SCRIPT_ID
				script.async = true
				script.src = "https://www.redditstatic.com/ads/pixel.js"
				const first = document.getElementsByTagName("script")[0]
				first?.parentNode?.insertBefore(script, first)
			}
		}

		window.rdt?.("init", pixelId, {
			optOut: false,
			useDecimalCurrencyValues: true,
		})
		window.rdt?.("track", "PageVisit")
	}, [pixelId])

	return null
}
