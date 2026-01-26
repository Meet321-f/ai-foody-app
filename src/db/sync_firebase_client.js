import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your web app's Firebase configuration
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
const db = getFirestore(app);

async function syncToFirebase() {
    console.log("🚀 Starting synchronization to Firebase (chet-cd9fc)...");

    try {
        const filePath = path.join(__dirname, "indian_dta_r.json");
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Data file not found at ${filePath}`);
            process.exit(1);
        }

        const rawData = fs.readFileSync(filePath, "utf-8");
        const recipes = JSON.parse(rawData);
        console.log(`📥 Read ${recipes.length} recipes from local file.`);

        const recipesCollection = collection(db, "indian_recipes");

        console.log("📤 Uploading recipes to Firestore...");
        
        let count = 0;
        for (const recipe of recipes) {
            const docRef = doc(recipesCollection, recipe.id.toString());
            await setDoc(docRef, {
                ...recipe,
                syncedAt: new Date().toISOString()
            });
            count++;
            if (count % 10 === 0) {
                console.log(`✅ Uploaded ${count}/${recipes.length} recipes...`);
            }
        }

        console.log("🎉 Successfully synced all recipes to Firebase!");
    } catch (error) {
        console.error("❌ Sync failed:", error);
    } finally {
        process.exit(0);
    }
}

syncToFirebase();
