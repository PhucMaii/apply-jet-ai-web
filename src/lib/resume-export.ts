const EXPORT_ROOT_SELECTOR = "[data-resume-preview-export-root]"
const EXPORT_PAGE_SELECTOR = "[data-resume-preview-page]"

interface ExportResumePdfOptions {
	fileName?: string
}

function sanitizeFileName(raw: string): string {
	return raw
		.replace(/[\\/:*?"<>|]+/g, "-")
		.replace(/\s+/g, " ")
		.trim()
}

function collectStyleMarkup(): string {
	const styleTags = Array.from(document.querySelectorAll("style"))
		.map((tag) => tag.outerHTML)
		.join("\n")

	const linkTags = Array.from(
		document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
	)
		.map((tag) => tag.outerHTML)
		.join("\n")

	return `${linkTags}\n${styleTags}`
}

function getPrintableHtml(root: HTMLElement): string {
	const pages = root.querySelectorAll<HTMLElement>(EXPORT_PAGE_SELECTOR)
	const pageMarkup = Array.from(pages)
		.map((page) => {
			// Export only the paper content (article), not preview labels like "Page X of Y".
			const paper = page.querySelector("article")
			return paper ? paper.outerHTML : page.outerHTML
		})
		.join("\n")

	return `
		<div class="resume-export-container">
			${pageMarkup}
		</div>
	`
}

export async function exportResumePreviewAsPdf(
	options: ExportResumePdfOptions = {},
): Promise<void> {
	const exportRoot = document.querySelector<HTMLElement>(EXPORT_ROOT_SELECTOR)
	if (!exportRoot) {
		throw new Error("Resume preview is not ready for export.")
	}

	const fileNameBase = sanitizeFileName(options.fileName || "resume")
	const printTitle = fileNameBase.length > 0 ? fileNameBase : "resume"
	const styles = collectStyleMarkup()
	const content = getPrintableHtml(exportRoot)

	const iframe = document.createElement("iframe")
	iframe.style.position = "fixed"
	iframe.style.right = "0"
	iframe.style.bottom = "0"
	iframe.style.width = "0"
	iframe.style.height = "0"
	iframe.style.border = "0"
	iframe.setAttribute("aria-hidden", "true")
	document.body.appendChild(iframe)

	const doc = iframe.contentDocument
	if (!doc) {
		iframe.remove()
		throw new Error("Could not create export document.")
	}

	doc.open()
	doc.write(`<!doctype html>
		<html>
			<head>
				<meta charset="utf-8" />
				<title>${printTitle}</title>
				${styles}
				<style>
					@page {
						size: Letter;
						margin: 0;
					}
					html,
					body {
						margin: 0;
						padding: 0;
						background: #ffffff;
					}
					.resume-export-container {
						display: block;
					}
					.resume-export-container > * {
						break-after: page;
						page-break-after: always;
					}
					.resume-export-container > *:last-child {
						break-after: auto;
						page-break-after: auto;
					}
					/* Remove preview-only shadow treatment in PDF output. */
					.resume-export-container article {
						box-shadow: none !important;
					}
					/* Remove preview-only active section highlight. */
					.resume-export-container .resume-preview-section-active {
						border-left-color: transparent !important;
						background-color: transparent !important;
					}
					.resume-export-container .outline,
					.resume-export-container [class*="outline-"] {
						outline: none !important;
						outline-offset: 0 !important;
					}
				</style>
			</head>
			<body>
				${content}
			</body>
		</html>`)
	doc.close()

	await new Promise<void>((resolve) => {
		iframe.onload = () => resolve()
		window.setTimeout(() => resolve(), 300)
	})

	const printWindow = iframe.contentWindow
	if (!printWindow) {
		iframe.remove()
		throw new Error("Could not open export window.")
	}

	printWindow.focus()
	printWindow.print()

	window.setTimeout(() => {
		iframe.remove()
	}, 1000)
}
