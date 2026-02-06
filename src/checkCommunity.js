import { db } from "./config/db.js";
import { recipesTable, vegRecipesTable, nonVegRecipesTable } from "./db/schema.js";
import { eq } from "drizzle-orm";

async function checkCommunity() {
  try {
    const legacy = await db.select().from(recipesTable);
    const veg = await db.select().from(vegRecipesTable);
    const nonveg = await db.select().from(nonVegRecipesTable);
    
    console.log("COMMUNITY_STATS:");
    console.log("Legacy:", legacy.length);
    console.log("Veg:", veg.length);
    console.log("Non-Veg:", nonveg.length);
    
    const publicLegacy = legacy.filter(r => r.isPublic === "true");
    console.log("Public Legacy:", publicLegacy.length);
    
    if (publicLegacy.length > 0) {
        console.log("SAMPLE_LEGACY:", JSON.stringify(publicLegacy[0], null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error("COMMUNITY_CHECK_FAILURE:", error.message);
    process.exit(1);
  }
}

checkCommunity();
