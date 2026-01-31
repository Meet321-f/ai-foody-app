import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";
import { ilike } from "drizzle-orm";

async function cleanupImages() {
  const DEFAULT_UNSPLASH = "photo-1546069901-ba9599a7e63c";
  
  try {
    console.log(`🔍 Searching for recipes with the generic image: ${DEFAULT_UNSPLASH}`);
    
    const result = await db
      .update(coustomeRecipesTable)
      .set({ image: null })
      .where(ilike(coustomeRecipesTable.image, `%${DEFAULT_UNSPLASH}%`));
    
    console.log("✅ Successfully cleared generic Unsplash images from NeonDB.");
  } catch (error) {
    console.error("❌ Error cleaning up images:", error);
  } finally {
    process.exit(0);
  }
}

cleanupImages();
