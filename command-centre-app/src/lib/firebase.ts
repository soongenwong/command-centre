import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAnalytics, Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyBAJ3DUaHijVB_ZDO2D9xdCvzBVCo-40To",
  authDomain: "command-centre-9c86c.firebaseapp.com",
  projectId: "command-centre-9c86c",
  storageBucket: "command-centre-9c86c.firebasestorage.app",
  messagingSenderId: "752552540698",
  appId: "1:752552540698:web:1404e4f041e23e100f2fa3",
  measurementId: "G-SFYFJ5MGT7"
}

// Initialize Firebase
export const app: FirebaseApp = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db: Firestore = getFirestore(app)

// Enable offline persistence for instant updates
if (typeof window !== 'undefined') {
  // Enable offline persistence for better performance
  import('firebase/firestore').then(({ enableIndexedDbPersistence }) => {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support all features required for persistence.')
      }
    })
  })
}

// Initialize Analytics (only in browser)
export const analytics: Analytics | null = typeof window !== 'undefined' ? getAnalytics(app) : null
