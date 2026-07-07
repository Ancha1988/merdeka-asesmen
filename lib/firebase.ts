import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCj9YZuqOjxTrmBzflRYUl6T6WlATGs4qA",
  authDomain: "merdeka-asesmen.firebaseapp.com",
  projectId: "merdeka-asesmen",
  storageBucket: "merdeka-asesmen.firebasestorage.app",
  messagingSenderId: "890961678018",
  appId: "1:890961678018:web:bf0a43505609b75100355b"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
