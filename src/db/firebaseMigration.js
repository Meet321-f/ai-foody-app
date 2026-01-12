import admin from "firebase-admin";
import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";

// Initialize Firebase Admin with Project ID (it will use default credentials or project ID)
// Since we don't have a service account file, we'll try to use the project ID.
// However, Firebase Admin usually needs a service account for full access from a generic server.
// Alternatively, if the project is small, the user might have set rules to 'allow write: if true' temporarily.
// But the previous error was PERMISSION_DENIED, so rules are likely active.

// If we can't get a service account, we can't easily use firebase-admin.
// Let's try to use the Firebase Client SDK again but I will ask the user to check their rules
// OR I can try to use the REST API or just wait for the user to fix rules.
// Actually, I'll try to use the Admin SDK with just the projectId first, but it usually requires GOOGLE_APPLICATION_CREDENTIALS.

// BETTER APPROACH: Use the Client SDK but provide a clear message to the user that they need to set rules to 'allow write: if true' temporarily.
// WAIT, I am an AI, I should try to be more efficient. I'll rewrite the script using Client SDK again but with more robust error handling and instructions.
// Actually, the user wants me to DO THE TASK.

import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";

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

async function migrate() {
    console.log("Starting migration from NeonDB to Firebase Firestore...");

    try {
        console.log("Fetching recipes from NeonDB...");
        const recipes = await db.select().from(coustomeRecipesTable).execute();
        console.log(`Found ${recipes.length} recipes in NeonDB.`);

        if (recipes.length === 0) {
            console.log("No recipes found to migrate.");
            return;
        }

        const recipesCollection = collection(firestore, "recipes");
        const batchSize = 25; // Smaller batch size to be safer
        
        for (let i = 0; i < recipes.length; i += batchSize) {
            const batch = writeBatch(firestore);
            const chunk = recipes.slice(i, i + batchSize);
            
            chunk.forEach((recipe) => {
                const newDocRef = doc(recipesCollection);
                batch.set(newDocRef, {
                    state: recipe.state,
                    name: recipe.name,
                    image: recipe.image,
                    cookTime: recipe.cookTime,
                    ingredients: recipe.ingredients,
                    calories: recipe.calories,
                    steps: recipe.steps,
                    source: "NeonDB",
                    createdAt: recipe.createdAt ? recipe.createdAt.toISOString() : new Date().toISOString()
                });
            });

            try {
                await batch.commit();
                console.log(`Migrated chunk ${Math.floor(i / batchSize) + 1} (${chunk.length} recipes).`);
            } catch (batchError) {
                if (batchError.code === 'permission-denied') {
                    console.error("\n[CRITICAL ERROR] Permission Denied!");
                    console.error("Please check your Firebase Firestore rules. You need to allow writes.");
                    console.error("Temporary Rule Change Required:");
                    console.error("allow read, write: if true;");
                    process.exit(1);
                }
                throw batchError;
            }
        }

        console.log("Migration to Firebase successful!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
