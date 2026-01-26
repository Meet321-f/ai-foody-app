import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "chet-cd9fc.firebaseapp.com",
  projectId: "chet-cd9fc",
  storageBucket: "chet-cd9fc.firebasestorage.app",
  messagingSenderId: "959897125860",
  appId: "1:959897125860:web:f7a42bcb7070cd7c32bdf1",
  measurementId: "G-J4GBEHW48E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
