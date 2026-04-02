import * as pdfjsLib from "pdfjs-dist"
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url"

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

const SCALE = 2.5
const JPEG_QUALITY = 0.92

export async function pdfFileToBase64Images(file: File): Promise<string[]> {
  const buf = await file.arrayBuffer()
  const doc = await pdfjsLib.getDocument({ data: buf }).promise

  const out: string[] = []

  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n)
    const viewport = page.getViewport({ scale: SCALE })

    const canvas = document.createElement("canvas")
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)

    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) continue

    await page.render({ canvas, canvasContext: ctx, viewport }).promise

    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY)
    out.push(dataUrl.split(",")[1] ?? "")
  }

  await doc.destroy()
  return out
}