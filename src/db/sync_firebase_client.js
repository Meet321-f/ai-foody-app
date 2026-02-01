import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { ENV } from "../config/env.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
  measurementId: ENV.FIREBASE_MEASUREMENT_ID
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
