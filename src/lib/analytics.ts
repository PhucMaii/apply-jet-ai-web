type AnalyticsPayload = Record<string, string | number | boolean | undefined>

declare global {
	interface Window {
		gtag?: (...args: unknown[]) => void
		dataLayer?: unknown[]
		posthog?: {
			capture: (event: string, properties?: AnalyticsPayload) => void
		}
	}
}

const SIGNUP_STARTED_KEY = "applyjet_signup_started"

function emit(event: string, properties?: AnalyticsPayload) {
	if (import.meta.env.DEV) {
		console.debug("[analytics]", event, properties)
	}

	window.gtag?.("event", event, properties)
	window.posthog?.capture(event, properties)
}

export function initAnalytics() {
	const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
	if (!measurementId || typeof document === "undefined") return

	if (document.getElementById("ga4-script")) return

	window.dataLayer = window.dataLayer ?? []
	window.gtag = function gtag(...args: unknown[]) {
		window.dataLayer?.push(args)
	}
	window.gtag("js", new Date())
	window.gtag("config", measurementId)

	const script = document.createElement("script")
	script.id = "ga4-script"
	script.async = true
	script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
	document.head.appendChild(script)
}

export function trackCtaClick({
	location,
	label,
	destination = "/signup",
}: {
	location: string
	label: string
	destination?: string
}) {
	emit("cta_click", { location, label, destination })
}

export function trackSignupStarted({
	source,
	method = "page_view",
}: {
	source: string
	method?: "page_view" | "email" | "google"
}) {
	if (sessionStorage.getItem(SIGNUP_STARTED_KEY)) return

	sessionStorage.setItem(SIGNUP_STARTED_KEY, "1")
	emit("signup_started", { source, method })
}

export function trackSignupCompleted({
	method,
}: {
	method: "email" | "google"
}) {
	emit("signup_completed", { method })
}
