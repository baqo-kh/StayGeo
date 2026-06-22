import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBkzA3PtBdsDHqIP3JYiCJUwVXBE26WTi8",
  authDomain: "staygeo-5c01e.firebaseapp.com",
  projectId: "staygeo-5c01e",
  storageBucket: "staygeo-5c01e.firebasestorage.app",
  messagingSenderId: "936866102157",
  appId: "1:936866102157:web:72f524c762bb0ca4149bc4",
  measurementId: "G-Z6Q79LYD52"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);