// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getDatabase, onValue, push, ref, get, child } from 'firebase/database'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDBo14Ud_75H8hOhupkBSpjoUbGhByS-EM',
  authDomain: 'live-activities.firebaseapp.com',
  projectId: 'live-activities',
  storageBucket: 'live-activities.appspot.com',
  messagingSenderId: '327588436817',
  appId: '1:327588436817:web:ebe9c282a97fa03eb65170',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getDatabase()

export { db, ref, push, onValue, get, child }
