import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBWEwgm69uDZXoZXBgi8I4FOy-mWuf5upY",
  authDomain: "semafis-d6940.firebaseapp.com",
  projectId: "semafis-d6940",
  storageBucket: "semafis-d6940.firebasestorage.app",
  messagingSenderId: "270379141204",
  appId: "1:270379141204:web:f5435cf3e03cf31e87c5c1",
  measurementId: "G-ZJNQ1W0SYH"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Provedor do Google
export const googleProvider = new GoogleAuthProvider();
