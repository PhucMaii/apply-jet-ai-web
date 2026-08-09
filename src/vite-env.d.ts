/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_SUPABASE_URL: string
	readonly VITE_SUPABASE_ANON_KEY: string
	readonly VITE_EXTENSION_DOWNLOAD_URL?: string
	readonly VITE_SUPABASE_EDGE_FUNCTION_NAME?: string
	/** Stripe recurring Price ID (e.g. price_xxx) for Pro checkout */
	readonly VITE_STRIPE_PRICE_PRO?: string
	/** Stripe one-time Price IDs for credit packs */
	readonly VITE_STRIPE_PRICE_INTERN_PACK?: string
	readonly VITE_STRIPE_PRICE_JUNIOR_PACK?: string
	readonly VITE_STRIPE_PRICE_ADVANCED_PACK?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
