import { useEffect } from "react"

interface DocumentMetaInput {
	title: string
	description: string
}

/**
 * Client-side document title + meta description for SPA marketing pages.
 * Restores previous values on unmount.
 */
export function useDocumentMeta({ title, description }: DocumentMetaInput) {
	useEffect(() => {
		const previousTitle = document.title
		document.title = title

		const descriptionEl = document.querySelector('meta[name="description"]')
		const previousDescription =
			descriptionEl?.getAttribute("content") ?? null
		descriptionEl?.setAttribute("content", description)

		const ogTitle = document.querySelector('meta[property="og:title"]')
		const previousOgTitle = ogTitle?.getAttribute("content") ?? null
		ogTitle?.setAttribute("content", title)

		const ogDescription = document.querySelector(
			'meta[property="og:description"]',
		)
		const previousOgDescription =
			ogDescription?.getAttribute("content") ?? null
		ogDescription?.setAttribute("content", description)

		return () => {
			document.title = previousTitle
			if (descriptionEl && previousDescription !== null) {
				descriptionEl.setAttribute("content", previousDescription)
			}
			if (ogTitle && previousOgTitle !== null) {
				ogTitle.setAttribute("content", previousOgTitle)
			}
			if (ogDescription && previousOgDescription !== null) {
				ogDescription.setAttribute("content", previousOgDescription)
			}
		}
	}, [title, description])
}
