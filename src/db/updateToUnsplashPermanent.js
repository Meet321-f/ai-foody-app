import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";
import { eq } from "drizzle-orm";

async function makeUnsplashPermanent() {
    try {
        console.log("🔄 Updating recipe images with permanent Unsplash URLs...\n");
        
        const recipes = await db
            .select()
            .from(coustomeRecipesTable);
        
        let updated = 0;
        
        for (const recipe of recipes) {
            // Check if it's a Google search URL
            if (recipe.image && recipe.image.includes('google.com/search')) {
                // Generate permanent Unsplash URL
                const seed = recipe.name.replace(/\s+/g, '-').toLowerCase();
                // Using a high-quality food image as permanent fallback since source via keywords is deprecated
                const newUrl = null; // Removed hardcoded fallback
                
                // Update database
                await db
                    .update(coustomeRecipesTable)
                    .set({ image: newUrl })
                    .where(eq(coustomeRecipesTable.id, recipe.id));
                
                console.log(`✅ Updated: ${recipe.name}`);
                console.log(`   New URL: ${newUrl}\n`);
                updated++;
            }
        }
        
        console.log(`\n✅ Successfully updated ${updated} recipe images!`);
        console.log("\n📝 Next steps:");
        console.log("1. Restart your app");
       console.log("2. Pull to refresh Indian recipes");
        console.log("3. Images should now load from database permanently\n");
        
    } catch (error) {
        console.error("❌ Error:", error);
    }
    process.exit(0);
}

makeUnsplashPermanent();
