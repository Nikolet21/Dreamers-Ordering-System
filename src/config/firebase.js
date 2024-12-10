// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

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

export { app, analytics }
