export const COVER_LETTER_TONES = ["Professional", "Friendly", "Direct"] as const

export type CoverLetterTone = (typeof COVER_LETTER_TONES)[number]

export function isCoverLetterTone(value: string): value is CoverLetterTone {
	return (COVER_LETTER_TONES as readonly string[]).includes(value)
}

export const COVER_LETTER_TONE_META: Record<
	CoverLetterTone,
	{ description: string }
> = {
	Professional: {
		description: "Formal and polished—best for corporate and traditional roles.",
	},
	Friendly: {
		description: "Warm and approachable—great for startups and culture-first teams.",
	},
	Direct: {
		description: "Concise and confident—ideal when brevity matters.",
	},
}
