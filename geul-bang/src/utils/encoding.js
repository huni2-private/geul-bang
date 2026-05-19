import jschardet from 'jschardet'

export async function readFileAsUTF8(file) {
  const buffer = await file.arrayBuffer()
  const uint8 = new Uint8Array(buffer)
  // jschardet는 바이너리 문자열을 요구함 — Uint8Array를 직접 넘기면 .split() 에러
  const sample = uint8.slice(0, 65536)
  let binaryStr = ''
  for (let i = 0; i < sample.length; i++) {
    binaryStr += String.fromCharCode(sample[i])
  }
  const detected = jschardet.detect(binaryStr)
  const charset = detected?.encoding || 'utf-8'
  const text = new TextDecoder(charset).decode(buffer)
  return new Blob([text], { type: 'text/plain;charset=utf-8' })
}
