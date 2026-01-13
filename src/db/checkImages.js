import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";

async function checkImages() {
    try {
        console.log("🔍 Checking first 10 recipes...\n");
        
        const recipes = await db
            .select()
            .from(coustomeRecipesTable)
            .limit(10);
        
        console.log(`Total recipes fetched: ${recipes.length}\n`);
        
        recipes.forEach((recipe, index) => {
            console.log(`\n--- Recipe ${index + 1} ---`);
            console.log(`ID: ${recipe.id}`);
            console.log(`Name: ${recipe.name}`);
            console.log(`State: ${recipe.state}`);
            console.log(`Image: ${recipe.image ? '✅ Present' : '❌ Missing'}`);
            if (recipe.image) {
                console.log(`Image URL: ${recipe.image.substring(0, 100)}...`);
            }
            console.log(`Cook Time: ${recipe.cookTime}`);
            console.log(`Calories: ${recipe.calories}`);
        });
        
        const withImages = recipes.filter(r => r.image);
        const withoutImages = recipes.filter(r => !r.image);
        
        console.log(`\n\n📊 Summary:`);
        console.log(`Recipes with images: ${withImages.length}`);
        console.log(`Recipes without images: ${withoutImages.length}`);
        
    } catch (error) {
        console.error("Error:", error);
    }
    process.exit(0);
}

checkImages();
