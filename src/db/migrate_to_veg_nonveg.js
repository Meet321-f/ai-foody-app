import { db } from "../config/db.js";
import { recipesTable, vegRecipesTable, nonVegRecipesTable } from "./schema.js";
import { eq } from "drizzle-orm";

const NON_VEG_KEYWORDS = [
  "chicken", "mutton", "egg", "fish", "meat", "pork", "beef", "shrimp", 
  "prawn", "crab", "bacon", "turkey", "duck", "salmon", "tuna", "lamb"
];

async function migrate() {
  console.log("🚀 Starting migration...");

  try {
    const existingRecipes = await db.select().from(recipesTable);
    console.log(`Found ${existingRecipes.length} recipes in legacy table.`);

    for (const recipe of existingRecipes) {
      const { id, ...recipeData } = recipe;
      
      // Determine if it's veg or non-veg
      let isNonVeg = false;
      
      // Check title
      const titleLower = recipe.title.toLowerCase();
      if (NON_VEG_KEYWORDS.some(kw => titleLower.includes(kw))) {
        isNonVeg = true;
      }

      // Check ingredients if still unsure
      if (!isNonVeg && recipe.ingredients) {
        const ingredientsStr = JSON.stringify(recipe.ingredients).toLowerCase();
        if (NON_VEG_KEYWORDS.some(kw => ingredientsStr.includes(kw))) {
          isNonVeg = true;
        }
      }

      const targetTable = isNonVeg ? nonVegRecipesTable : vegRecipesTable;
      const type = isNonVeg ? "NON-VEG" : "VEG";

      console.log(`Migrating "${recipe.title}" to ${type}...`);

      await db.insert(targetTable).values({
        ...recipeData,
        // Ensure instructions/ingredients are in correct JSON format if they were strings (unlikely given schema, but safe)
      });

      // Optional: Delete from old table after successful migration
      // await db.delete(recipesTable).where(eq(recipesTable.id, recipe.id));
    }

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
  process.exit(0);
}

migrate();
