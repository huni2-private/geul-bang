import { useEffect, useState } from 'react'
import { subscribeNovels, createNovel, saveChunks, deleteChunks, deleteNovel } from '../services/novel.service'
import { readFileAsText, getFileTitle } from '../utils/fileReader'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

// 페이지 재방문 시 스켈레톤 없이 즉시 표시하기 위한 모듈 캐시
const novelsCache = {}

export function useNovels() {
  const user = useAuth()
  const uid = user?.uid
  const showToast = useToast()
  const [novels, setNovels] = useState(() => novelsCache[null] ?? [])
  const [uploading, setUploading] = useState(false)
  const [dbError, setDbError] = useState(null)

  useEffect(() => {
    if (!uid) return
    setDbError(null)
    if (novelsCache[uid] !== undefined) {
      setNovels(novelsCache[uid])
    }
    const unsubscribe = subscribeNovels(uid, (data, error) => {
      if (error) {
        setDbError(error)
        showToast?.(`데이터베이스 연결 오류: ${error.code || error.message}`, 'error', 10000)
      }
      novelsCache[uid] = data
      setNovels(data)
    })
    return unsubscribe
  }, [uid, showToast])

  // onStep: (msg: string) => void — 단계별 진행 상태를 UI에 전달
  async function uploadNovel(file, onStep) {
    if (!uid || uploading) return false
    setUploading(true)
    let novelId = null
    try {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1)
      onStep?.(`파일 읽는 중... (${sizeMB}MB)`)
      const title = getFileTitle(file.name)
      const blob = await readFileAsText(file)
      const text = await blob.text()

      onStep?.('Firestore 연결 중...')
      novelId = await createNovel(uid, { title, fileSize: file.size })

      onStep?.('소설 내용 저장 중... (0%)')
      await saveChunks(uid, novelId, text, (pct) => onStep?.(`소설 내용 저장 중... (${pct}%)`))

      return true
    } catch (e) {
      if (novelId) {
        try { await deleteNovel(uid, novelId) } catch {}
      }
      throw e
    } finally {
      setUploading(false)
    }
  }

  async function removeNovel(novel) {
    if (!uid) return
    await deleteChunks(uid, novel.id)
    await deleteNovel(uid, novel.id)
  }

  return { novels, uploading, dbError, uploadNovel, removeNovel }
}
