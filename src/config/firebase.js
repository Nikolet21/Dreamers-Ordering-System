// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getDatabase } from 'firebase/database'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBHDeoTy6Img7x0Dhj2JnQCCieywvo_C6o',
  authDomain: 'dreamers-ordering-system-85424.firebaseapp.com',
  databaseURL:
    'https://dreamers-ordering-system-85424-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'dreamers-ordering-system-85424',
  storageBucket: 'dreamers-ordering-system-85424.firebasestorage.app',
  messagingSenderId: '1073689900183',
  appId: '1:1073689900183:web:13e3f9a2fc2893e5a5e5d2',
  measurementId: 'G-4DG26HRHT5',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const realdb = getDatabase(app)

export { app, analytics, auth, db, storage, realdb }
