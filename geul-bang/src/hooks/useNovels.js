import { useEffect, useState } from 'react'
import { subscribeNovels, createNovel, deleteNovel } from '../services/novel.service'
import { uploadNovelFile, deleteNovelFile } from '../services/storage.service'
import { readFileAsText, getFileTitle } from '../utils/fileReader'
import { useAuth } from '../contexts/AuthContext'

export function useNovels() {
  const user = useAuth()
  const [novels, setNovels] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    // 10초 안에 Firestore 응답 없으면 강제로 로딩 해제
    const timeout = setTimeout(() => setLoading(false), 5000)
    const unsubscribe = subscribeNovels(user.uid, (data) => {
      clearTimeout(timeout)
      setNovels(data)
      setLoading(false)
    })
    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [user])

  async function uploadNovel(file) {
    if (!user || uploading) return
    setUploading(true)
    try {
      const title = getFileTitle(file.name)
      const blob = await readFileAsText(file)
      const tempId = crypto.randomUUID()
      const { url, path } = await uploadNovelFile(user.uid, tempId, blob, title)
      await createNovel(user.uid, {
        title,
        fileUrl: url,
        storagePath: path,
        fileSize: file.size,
      })
    } finally {
      setUploading(false)
    }
  }

  async function removeNovel(novel) {
    if (!user) return
    await deleteNovelFile(novel.storagePath)
    await deleteNovel(user.uid, novel.id)
  }

  return { novels, loading, uploading, uploadNovel, removeNovel }
}
