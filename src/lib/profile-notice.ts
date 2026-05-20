export const NOTICE_VARIANT = {
	success: "success",
	info: "info",
	warning: "warning",
} as const

export type NoticeVariant = (typeof NOTICE_VARIANT)[keyof typeof NOTICE_VARIANT]

export interface ProfileNotice {
	variant: NoticeVariant
	text: string
}
