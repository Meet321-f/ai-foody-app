import admin from "firebase-admin";
import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";
import { ENV } from "../config/env.js";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "../../.env");
dotenv.config({ path: envPath });

// Initialize Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");

if (!serviceAccount.project_id) {
    console.error("❌ Firebase credentials missing. Please set FIREBASE_SERVICE_ACCOUNT in your .env");
    process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

async function syncToFirebase() {
  console.log("🚀 Starting synchronization to Firebase...");
  
  try {
    // 1. Fetch all Indian recipes from Neon
    console.log("📥 Fetching recipes from Neon DB...");
    const recipes = await db.select().from(coustomeRecipesTable);
    console.log(`✅ Found ${recipes.length} recipes in Neon.`);

    // 2. Batch upload to Firestore
    const collectionRef = firestore.collection("indian_recipes");
    const batch = firestore.batch();
    
    console.log("📤 Uploading recipes to Firestore...");
    
    for (const recipe of recipes) {
      const docRef = collectionRef.doc(recipe.id.toString());
      batch.set(docRef, {
        ...recipe,
        syncedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();
    console.log("🎉 Successfully synced all recipes to Firebase!");
  } catch (error) {
    console.error("❌ Sync failed:", error);
  } finally {
    process.exit(0);
  }
}

syncToFirebase();
