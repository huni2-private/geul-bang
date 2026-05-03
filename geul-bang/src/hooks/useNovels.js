import { useEffect, useState } from 'react'
import { subscribeNovels, createNovel, deleteNovel } from '../services/novel.service'
import { uploadNovelFile, deleteNovelFile } from '../services/storage.service'
import { readFileAsUTF8 } from '../utils/encoding'
import { useAuth } from '../contexts/AuthContext'

export function useNovels() {
  const user = useAuth()
  const [novels, setNovels] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeNovels(user.uid, setNovels)
    return unsubscribe
  }, [user])

  async function uploadNovel(file) {
    if (!user || uploading) return
    setUploading(true)
    try {
      const title = file.name.replace(/\.txt$/i, '')
      const blob = await readFileAsUTF8(file)
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

  return { novels, uploading, uploadNovel, removeNovel }
}
