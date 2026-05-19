// 파일 포맷별 텍스트 추출 — txt / pdf / docx 지원
import { readFileAsUTF8 } from './encoding'

async function readPdf(file) {
  const pdfjsLib = await import('pdfjs-dist')
  // 워커를 unpkg CDN으로 지정해 번들 크기 절약
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map((item) => item.str).join(''))
  }
  return new Blob([pages.join('\n\n')], { type: 'text/plain;charset=utf-8' })
}

async function readDocx(file) {
  const { default: mammoth } = await import('mammoth')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return new Blob([result.value], { type: 'text/plain;charset=utf-8' })
}

export function getFileTitle(filename) {
  return filename.replace(/\.(txt|pdf|docx?)$/i, '')
}

export async function readFileAsText(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return readPdf(file)
  if (ext === 'docx' || ext === 'doc') return readDocx(file)
  return readFileAsUTF8(file)
}
