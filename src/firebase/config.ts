// Firebase web config. These values are public by design (they identify the
// project; security is enforced by Firestore rules + authorized domains).
// Set to null to run the app without any cloud features.
export interface FirebaseWebConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

export const firebaseConfig: FirebaseWebConfig | null = null
