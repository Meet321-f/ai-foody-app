import { initializeApp } from "firebase/app";
import { getFirestore, collection, getCountFromServer } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "chet-cd9fc.firebaseapp.com",
  projectId: "chet-cd9fc",
  storageBucket: "chet-cd9fc.firebasestorage.app",
  messagingSenderId: "959897125860",
  appId: "1:959897125860:web:f7a42bcb7070cd7c32bdf1",
  measurementId: "G-J4GBEHW48E"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

async function verify() {
    try {
        const recipesCollection = collection(firestore, "recipes");
        const snapshot = await getCountFromServer(recipesCollection);
        console.log(`Verification: Found ${snapshot.data().count} documents in the 'recipes' collection.`);
        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

verify();
