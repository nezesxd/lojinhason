import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3IPrt3xVPUE3S1dImKsAV5MiP-8OhcBE",
  authDomain: "teste-gm-c3955.firebaseapp.com",
  databaseURL: "https://teste-gm-c3955-default-rtdb.firebaseio.com",
  projectId: "teste-gm-c3955",
  storageBucket: "teste-gm-c3955.firebasestorage.app",
  messagingSenderId: "701174174796",
  appId: "1:701174174796:web:98d9605e919b78addb50e9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
