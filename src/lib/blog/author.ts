export interface BlogAuthor {
	name: string
	role: string
	avatarSrc: string
	avatarAlt: string
	linkedinUrl: string
}

/** Shared author for all ApplyJet blog posts */
export const BLOG_AUTHOR: BlogAuthor = {
	name: "Bin Mai",
	role: "Founder of ApplyJet AI",
	avatarSrc: "/blog/bin-mai.png",
	avatarAlt: "Bin Mai, Founder of ApplyJet AI",
	linkedinUrl: "https://linkedin.com/in/binmai0102",
}
