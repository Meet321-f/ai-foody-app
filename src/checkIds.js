import { db } from "./config/db.js";
import { recipesTable } from "./db/schema.js";

async function checkIds() {
  try {
    const recipes = await db.select().from(recipesTable).limit(20);
    console.log("RECIPE_IDS_CHECK:");
    recipes.forEach(r => {
      console.log(`ID: ${r.id}, UserID: ${r.userId}, isPublic: ${r.isPublic}`);
    });
    process.exit(0);
  } catch (error) {
    console.error("ID_CHECK_FAILURE:", error.message);
    process.exit(1);
  }
}

checkIds();
