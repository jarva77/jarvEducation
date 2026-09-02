import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import { firebaseConfig } from './config'

interface FirebaseServices {
  app: FirebaseApp
  auth: Auth
  db: Firestore
}

let servicesPromise: Promise<FirebaseServices | null> | undefined

/**
 * Lazily loads the Firebase SDK (dynamic import keeps it out of the main
 * bundle) and initializes it. Resolves to null when no config is present.
 */
export function getFirebase(): Promise<FirebaseServices | null> {
  servicesPromise ??= (async () => {
    if (!firebaseConfig) return null
    const [{ initializeApp }, { getAuth }, { getFirestore }] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ])
    const app = initializeApp(firebaseConfig)
    return { app, auth: getAuth(app), db: getFirestore(app) }
  })()
  return servicesPromise
}

/** Synchronous check: is a Firebase config present? */
export const cloudEnabled = () => firebaseConfig !== null
