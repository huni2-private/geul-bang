import { useEffect, useState } from 'react'
import { subscribeNovels, createNovel, saveChunks, deleteChunks, deleteNovel } from '../services/novel.service'
import { readFileAsText, getFileTitle } from '../utils/fileReader'
import { useAuth } from '../contexts/AuthContext'

// 페이지 재방문 시 스켈레톤 없이 즉시 표시하기 위한 모듈 캐시
const novelsCache = {}

export function useNovels() {
  const user = useAuth()
  const uid = user?.uid
  const [novels, setNovels] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!uid) return
    // 캐시가 있으면 즉시 표시 (스켈레톤 없음)
    if (novelsCache[uid] !== undefined) {
      setNovels(novelsCache[uid])
      setLoading(false)
    } else {
      setLoading(true)
    }
    const timeout = setTimeout(() => setLoading(false), 5000)
    const unsubscribe = subscribeNovels(uid, (data) => {
      clearTimeout(timeout)
      novelsCache[uid] = data
      setNovels(data)
      setLoading(false)
    })
    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [uid])

  // onStep: (msg: string) => void — 단계별 진행 상태를 UI에 전달
  async function uploadNovel(file, onStep) {
    if (!uid || uploading) return false
    setUploading(true)
    let novelId = null
    try {
      onStep?.('파일 읽는 중...')
      const title = getFileTitle(file.name)
      const blob = await readFileAsText(file)
      const text = await blob.text()

      onStep?.('목록에 추가하는 중...')
      novelId = await createNovel(uid, { title, fileSize: file.size })

      onStep?.('소설 내용 저장 중...')
      await saveChunks(uid, novelId, text)

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

  return { novels, loading, uploading, uploadNovel, removeNovel }
}
