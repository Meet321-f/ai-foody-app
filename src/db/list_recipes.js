import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";

async function listRecipes() {
  try {
    const recipes = await db.select().from(coustomeRecipesTable);
    console.log(recipes.map(r => r.name).join("\n"));
  } catch (error) {
    console.error("Error listing recipes:", error);
  }
  process.exit(0);
}

listRecipes();
