// 텍스트 파일 인코딩 감지 및 UTF-8 변환 (jschardet 미사용)
export async function readFileAsUTF8(file) {
  const buffer = await file.arrayBuffer()
  // UTF-8 strict → EUC-KR strict → UTF-8 lenient 순서로 시도
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
    return new Blob([text], { type: 'text/plain;charset=utf-8' })
  } catch {}
  try {
    const text = new TextDecoder('euc-kr', { fatal: true }).decode(buffer)
    return new Blob([text], { type: 'text/plain;charset=utf-8' })
  } catch {}
  const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
  return new Blob([text], { type: 'text/plain;charset=utf-8' })
}
