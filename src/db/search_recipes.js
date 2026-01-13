import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";
import { sql } from "drizzle-orm";

async function searchRecipes() {
  try {
    const searchTerms = ["Sambar", "Biryani", "Chakhwi", "Baati", "Kafuli", "Ilish", "Shorshe", "Chokha"];
    const results = {};
    
    const allRecipes = await db.select().from(coustomeRecipesTable);
    
    searchTerms.forEach(term => {
      results[term] = allRecipes
        .filter(r => r.name.toLowerCase().includes(term.toLowerCase()))
        .map(r => r.name);
    });
    
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Error searching recipes:", error);
  }
  process.exit(0);
}

searchRecipes();
