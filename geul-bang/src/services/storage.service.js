import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadNovelFile(uid, novelId, blob, title) {
  const safeName = title.replace(/[^a-zA-Z0-9가-힣._-]/g, '_')
  const path = `novels/${uid}/${novelId}_${safeName}.txt`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, blob, { contentType: 'text/plain;charset=utf-8' })
  const url = await getDownloadURL(storageRef)
  return { url, path }
}

export async function deleteNovelFile(storagePath) {
  const storageRef = ref(storage, storagePath)
  await deleteObject(storageRef)
}
