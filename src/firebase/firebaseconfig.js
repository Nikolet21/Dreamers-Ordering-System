import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBHDeoTy6Img7x0Dhj2JnQCCieywvo_C6o",
  authDomain: "dreamers-ordering-system-85424.firebaseapp.com",
  databaseURL: "https://dreamers-ordering-system-85424-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dreamers-ordering-system-85424",
  storageBucket: "dreamers-ordering-system-85424.appspot.com",
  messagingSenderId: "1073689900183",
  appId: "1:1073689900183:web:13e3f9a2fc2893e5a5e5d2",
  measurementId: "G-4DG26HRHT5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
