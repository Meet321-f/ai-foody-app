import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";
import { eq } from "drizzle-orm";

// Get free API key from https://www.pexels.com/api/
const PEXELS_API_KEY = "YOUR_PEXELS_API_KEY";

async function fetchPexelsImage(recipeName) {
    try {
        const query = encodeURIComponent(`${recipeName} indian food`);
        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${query}&per_page=1`,
            {
                headers: {
                    Authorization: PEXELS_API_KEY
                }
            }
        );
        
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
            return data.photos[0].src.medium; // 350px image
        }
        return null;
    } catch (error) {
        console.error(`Error fetching image for ${recipeName}:`, error);
        return null;
    }
}

async function updateRecipeImages() {
    try {
        const recipes = await db
            .select()
            .from(coustomeRecipesTable)
            .where(eq(coustomeRecipesTable.image, null)); // Or filter for Google URLs
        
        console.log(`Found ${recipes.length} recipes to update\n`);
        
        for (let i = 0; i < recipes.length; i++) {
            const recipe = recipes[i];
            
            // Check if it's a Google search URL
            if (recipe.image && recipe.image.includes('google.com/search')) {
                console.log(`[${i + 1}/${recipes.length}] Updating: ${recipe.name}`);
                
                const imageUrl = await fetchPexelsImage(recipe.name);
                
                if (imageUrl) {
                    await db
                        .update(coustomeRecipesTable)
                        .set({ image: imageUrl })
                        .where(eq(coustomeRecipesTable.id, recipe.id));
                    
                    console.log(`✅ Updated with: ${imageUrl}\n`);
                } else {
                    console.log(`⚠️ No image found, keeping original\n`);
                }
                
                // Rate limiting - Pexels allows 200 requests/hour
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
            }
        }
        
        console.log("\n✅ Database update complete!");
    } catch (error) {
        console.error("Error:", error);
    }
    process.exit(0);
}

updateRecipeImages();
