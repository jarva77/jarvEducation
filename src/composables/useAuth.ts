import { ref } from 'vue'
import type { User } from 'firebase/auth'
import { cloudEnabled, getFirebase } from '../firebase'
import { claimSignupSlot, deleteAccountData } from '../services/cloud'

function isFirebaseErrorCode(e: unknown, code: string): boolean {
  return typeof e === 'object' && e !== null && 'code' in e && (e as { code?: unknown }).code === code
}

const user = ref<User | null>(null)
const authReady = ref(false)
const signupBlocked = ref(false)
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
    const { GoogleAuthProvider, signInWithPopup, signOut: fbSignOut } = await import('firebase/auth')
    try {
      signupBlocked.value = false
      const cred = await signInWithPopup(fb.auth, new GoogleAuthProvider())
      const allowed = await claimSignupSlot(cred.user.uid)
      if (!allowed) {
        await fbSignOut(fb.auth)
        signupBlocked.value = true
      }
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

  // Deletes the account and every trace of it — cloud data first (while the
  // session is still valid), then local data, and the Auth account itself
  // last. If a Firestore delete fails (eg. security rules don't allow it),
  // this throws and the Auth account is deliberately left intact so the
  // user isn't logged out of a still-existing account with orphaned data.
  async function deleteAccount() {
    const fb = await getFirebase()
    const currentUser = fb?.auth.currentUser
    if (!fb || !currentUser) throw new Error('Not signed in')

    await deleteAccountData(currentUser.uid)

    const { GoogleAuthProvider, deleteUser, reauthenticateWithPopup } = await import('firebase/auth')
    try {
      await deleteUser(currentUser)
    } catch (e) {
      if (!isFirebaseErrorCode(e, 'auth/requires-recent-login')) throw e
      // session too old to allow account deletion — sign in again, then retry
      await reauthenticateWithPopup(currentUser, new GoogleAuthProvider())
      await deleteUser(currentUser)
    }

    try {
      localStorage.clear()
    } catch {
      /* storage unavailable */
    }
  }

  return {
    user,
    authReady,
    signupBlocked,
    cloudEnabled: cloudEnabled(),
    signInWithGoogle,
    signOut,
    deleteAccount,
  }
}
