import {
  signInAnonymously,
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase'

export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function loginAnonymously() {
  const result = await signInAnonymously(auth)
  return result.user
}

export async function linkGoogle() {
  const provider = new GoogleAuthProvider()
  const result = await linkWithPopup(auth.currentUser, provider)
  return result.user
}
