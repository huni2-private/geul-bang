// 웹소설 .txt에서 챕터 구분 줄을 자동 감지해 목록을 반환

// 지원 패턴: "제 1화", "제1화", "1화", "Chapter 1", "CHAPTER 1", "제 1장", "제1장", "1장"
const CHAPTER_RE = /^[\s﻿]*(제\s*\d+\s*[화장]|Chapter\s*\d+|\d+\s*[화장])[^\n]{0,40}/im

export function detectChapters(text) {
  if (!text) return []
  const lines = text.split('\n')
  const chapters = []

  let charOffset = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (CHAPTER_RE.test(line)) {
      const title = line.trim().slice(0, 60) || `챕터 ${chapters.length + 1}`
      chapters.push({ title, lineIndex: i, charOffset })
    }
    charOffset += line.length + 1 // +1 for '\n'
  }

  return chapters
}
