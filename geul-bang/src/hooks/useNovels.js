import { useEffect, useState } from 'react'
import { subscribeNovels, createNovel, saveChunks, deleteChunks, deleteNovel } from '../services/novel.service'
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
      const text = await blob.text()
      const novelId = await createNovel(user.uid, { title, fileSize: file.size })
      await saveChunks(user.uid, novelId, text)
    } finally {
      setUploading(false)
    }
  }

  async function removeNovel(novel) {
    if (!user) return
    await deleteChunks(user.uid, novel.id)
    await deleteNovel(user.uid, novel.id)
  }

  return { novels, loading, uploading, uploadNovel, removeNovel }
}
