import { ref } from 'vue'
import type { User } from 'firebase/auth'
import { cloudEnabled, getFirebase } from '../firebase'

const user = ref<User | null>(null)
const authReady = ref(false)
let listening = false

async function ensureListener() {
  if (listening) return
  listening = true
  const fb = await getFirebase()
  if (!fb) {
    authReady.value = true
    return
  }
  const { onAuthStateChanged } = await import('firebase/auth')
  onAuthStateChanged(fb.auth, (u) => {
    user.value = u
    authReady.value = true
  })
}

export function useAuth() {
  void ensureListener()

  async function signInWithGoogle() {
    const fb = await getFirebase()
    if (!fb) return
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
    try {
      await signInWithPopup(fb.auth, new GoogleAuthProvider())
    } catch (e) {
      console.error('Sign-in failed', e)
    }
  }

  async function signOut() {
    const fb = await getFirebase()
    if (!fb) return
    const { signOut: fbSignOut } = await import('firebase/auth')
    await fbSignOut(fb.auth)
  }

  return { user, authReady, cloudEnabled: cloudEnabled(), signInWithGoogle, signOut }
}
