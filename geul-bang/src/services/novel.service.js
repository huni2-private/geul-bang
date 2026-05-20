import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
  // orderBy는 subscribeNovels에서만 사용
} from 'firebase/firestore'
import { db } from './firebase'

const CHUNK_SIZE = 250_000 // 한국어 기준 ~750KB UTF-8, 1MB 한도 여유 유지

function novelsRef(uid) {
  return collection(db, 'users', uid, 'novels')
}

function novelDoc(uid, novelId) {
  return doc(db, 'users', uid, 'novels', novelId)
}

function chunksRef(uid, novelId) {
  return collection(db, 'users', uid, 'novels', novelId, 'chunks')
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

export async function createNovel(uid, { title, fileSize }) {
  const now = serverTimestamp()
  const ref = await addDoc(novelsRef(uid), {
    title,
    fileSize,
    progressRatio: 0,
    scrollPosition: 0,
    createdAt: now,
    lastReadAt: now,
  })
  return ref.id
}

export async function saveChunks(uid, novelId, text) {
  const batch = writeBatch(db)
  const ref = chunksRef(uid, novelId)
  let count = 0
  for (let i = 0; i * CHUNK_SIZE < text.length; i++) {
    // zero-padding ID → orderBy 없이 lexicographic 정렬 가능
    const id = String(i).padStart(8, '0')
    const chunk = text.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
    batch.set(doc(ref, id), { text: chunk })
    count++
  }
  await batch.commit()
  return count
}

export async function getChunks(uid, novelId) {
  // orderBy 없이 document ID 순서로 조회 (zero-padded ID라 정렬 보장)
  const snap = await getDocs(chunksRef(uid, novelId))
  const sorted = snap.docs.sort((a, b) => a.id.localeCompare(b.id))
  return sorted.map((d) => d.data().text).join('')
}

export async function deleteChunks(uid, novelId) {
  const snap = await getDocs(chunksRef(uid, novelId))
  if (snap.empty) return
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
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
