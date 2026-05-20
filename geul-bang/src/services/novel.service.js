import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  serverTimestamp,
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
  return onSnapshot(
    novelsRef(uid),
    (snap) => {
      const novels = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(novels, null)
    },
    (error) => {
      console.error('소설 목록 구독 실패:', error)
      callback([], error)
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

// 5개씩 병렬 저장 — write stream 한도(동시) 지키면서 순차보다 5배 빠름
export async function saveChunks(uid, novelId, text, onProgress) {
  const ref = chunksRef(uid, novelId)
  const chunks = []
  for (let i = 0; i * CHUNK_SIZE < text.length; i++) {
    chunks.push({ id: String(i).padStart(8, '0'), text: text.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE) })
  }
  const total = chunks.length || 1
  const BATCH = 5
  for (let i = 0; i < total; i += BATCH) {
    await Promise.all(
      chunks.slice(i, i + BATCH).map(({ id, text: chunk }) => setDoc(doc(ref, id), { text: chunk }))
    )
    onProgress?.(Math.round(Math.min((i + BATCH) / total * 100, 100)))
  }
  return total
}

export async function getChunks(uid, novelId) {
  const snap = await getDocs(chunksRef(uid, novelId))
  console.log(`[getChunks] novelId=${novelId}, 청크 수=${snap.docs.length}`)
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
