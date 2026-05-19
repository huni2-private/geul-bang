import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

function novelsRef(uid) {
  return collection(db, 'users', uid, 'novels')
}

function novelDoc(uid, novelId) {
  return doc(db, 'users', uid, 'novels', novelId)
}

export function subscribeNovels(uid, callback) {
  const q = query(novelsRef(uid), orderBy('lastReadAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      const novels = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(novels)
    },
    (error) => {
      console.error('소설 목록 구독 실패:', error)
      callback([])
    },
  )
}

export async function createNovel(uid, { title, fileUrl, storagePath, fileSize }) {
  const now = serverTimestamp()
  const ref = await addDoc(novelsRef(uid), {
    title,
    fileUrl,
    storagePath,
    fileSize,
    progressRatio: 0,
    scrollPosition: 0,
    createdAt: now,
    lastReadAt: now,
  })
  return ref.id
}

export async function updateProgress(uid, novelId, { scrollPosition, progressRatio }) {
  await updateDoc(novelDoc(uid, novelId), {
    scrollPosition,
    progressRatio,
    lastReadAt: serverTimestamp(),
  })
}

export async function deleteNovel(uid, novelId) {
  await deleteDoc(novelDoc(uid, novelId))
}
