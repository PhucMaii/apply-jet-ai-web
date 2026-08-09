const url = import.meta.env.VITE_SUPABASE_URL ?? ""
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""

/** Stripe Price ID for Pro subscription (recurring). Set in Dashboard. */
const stripeProPriceId = import.meta.env.VITE_STRIPE_PRICE_PRO ?? ""
const stripeInternPackPriceId =
	import.meta.env.VITE_STRIPE_PRICE_INTERN_PACK ?? ""
const stripeJuniorPackPriceId =
	import.meta.env.VITE_STRIPE_PRICE_JUNIOR_PACK ?? ""
const stripeAdvancedPackPriceId =
	import.meta.env.VITE_STRIPE_PRICE_ADVANCED_PACK ?? ""

export const env = {
	supabaseUrl: url,
	supabaseAnonKey: anon,
	isSupabaseConfigured: Boolean(url && anon),
	extensionDownloadUrl:
		"https://chromewebstore.google.com/detail/applyjet-ai/epeoejbbnmghpbafefmjdjdeilngnnbg",
	edgeFunctionExampleName:
		import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_NAME ?? "hello",
	stripeProPriceId,
	stripeInternPackPriceId,
	stripeJuniorPackPriceId,
	stripeAdvancedPackPriceId,
	isStripePriceConfigured: Boolean(stripeProPriceId),
	isStripePacksConfigured: Boolean(
		stripeInternPackPriceId &&
			stripeJuniorPackPriceId &&
			stripeAdvancedPackPriceId,
	),
	xsecretkey: import.meta.env.VITE_X_SECRET_KEY ?? "",
	edgeGenerateResume:
		import.meta.env.VITE_EDGE_GENERATE_RESUME ?? "generate-resume",
	edgeGenerateCoverLetter:
		import.meta.env.VITE_EDGE_GENERATE_COVER_LETTER ?? "generate-coverletter",
} as const
