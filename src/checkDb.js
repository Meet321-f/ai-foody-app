import { db } from "./config/db.js";
import { coustomeRecipesTable } from "./db/schema.js";

async function checkDb() {
  try {
    const results = await db.select().from(coustomeRecipesTable).limit(5);
    console.log("DB_CHECK_SUCCESS:", results.length, "recipes found");
    console.log("PREVIEW:", JSON.stringify(results[0], null, 2));
    process.exit(0);
  } catch (error) {
    console.error("DB_CHECK_FAILURE:", error.message);
    process.exit(1);
  }
}

checkDb();
