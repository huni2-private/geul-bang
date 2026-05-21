// 텍스트 파일 인코딩 감지 및 UTF-8 문자열 변환
export async function readFileAsUTF8(file) {
  const buffer = await file.arrayBuffer()
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {}
  try {
    return new TextDecoder('euc-kr', { fatal: true }).decode(buffer)
  } catch {}
  return new TextDecoder('utf-8', { fatal: false }).decode(buffer)
}
