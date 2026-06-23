const url = import.meta.env.VITE_SUPABASE_URL ?? ""
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""

/** Stripe Price ID for Pro subscription (recurring). Set in Dashboard. */
const stripeProPriceId = import.meta.env.VITE_STRIPE_PRICE_PRO ?? ""
const stripeJobHuntPackPriceId = import.meta.env.VITE_STRIPE_PRICE_JOB_HUNT_PACK ?? ""

export const env = {
	supabaseUrl: url,
	supabaseAnonKey: anon,
	isSupabaseConfigured: Boolean(url && anon),
	extensionDownloadUrl: "https://chromewebstore.google.com/detail/applyjet-ai/epeoejbbnmghpbafefmjdjdeilngnnbg",
	edgeFunctionExampleName:
		import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_NAME ?? "hello",
	stripeProPriceId,
	stripeJobHuntPackPriceId,
	isStripePriceConfigured: Boolean(stripeProPriceId),
	xsecretkey: import.meta.env.VITE_X_SECRET_KEY ?? "",
	edgeGenerateResume:
		import.meta.env.VITE_EDGE_GENERATE_RESUME ?? "generate-resume",
	edgeGenerateCoverLetter:
		import.meta.env.VITE_EDGE_GENERATE_COVER_LETTER ?? "generate-coverletter",
} as const
