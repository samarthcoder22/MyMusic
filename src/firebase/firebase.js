import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBfinRxJWM6v58HhRJCteQbpWNfXn2Nwg0",
  authDomain: "mymusic-65b2b.firebaseapp.com",
  projectId: "mymusic-65b2b",
  storageBucket: "mymusic-65b2b.firebasestorage.app",
  messagingSenderId: "163430384185",
  appId: "1:163430384185:web:477d8f63377fe9a7e03e8",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;