/**
 * Product feature flags. Flip to re-enable without restoring deleted code.
 * Keep PGWP code in the repo; hide it from the product when false.
 */
export const FEATURES = {
	pgwp: false,
} as const
