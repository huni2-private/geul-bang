import jschardet from 'jschardet'

export async function readFileAsUTF8(file) {
  const buffer = await file.arrayBuffer()
  const uint8 = new Uint8Array(buffer)
  const detected = jschardet.detect(uint8)
  const charset = detected?.encoding || 'utf-8'
  const text = new TextDecoder(charset).decode(buffer)
  return new Blob([text], { type: 'text/plain;charset=utf-8' })
}
