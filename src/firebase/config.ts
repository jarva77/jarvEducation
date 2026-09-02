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

export const firebaseConfig: FirebaseWebConfig | null = {
  apiKey: 'AIzaSyDhG_wkVBRhej7RR5aiJE_nbJ9A6oowD-U',
  authDomain: 'jarveducation.firebaseapp.com',
  projectId: 'jarveducation',
  storageBucket: 'jarveducation.firebasestorage.app',
  messagingSenderId: '397595571521',
  appId: '1:397595571521:web:563d5b14dff47007249dc0',
}
