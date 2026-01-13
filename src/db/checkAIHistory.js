import { db } from "../config/db.js";
import { recipesTable } from "./schema.js";
import { desc } from "drizzle-orm";

async function checkRecentAI() {
  try {
    const recent = await db
      .select({
        id: recipesTable.id,
        title: recipesTable.title,
        userId: recipesTable.userId,
        createdAt: recipesTable.createdAt
      })
      .from(recipesTable)
      .orderBy(desc(recipesTable.createdAt))
      .limit(10);

    console.log("--- Recent AI Recipes ---");
    recent.forEach(r => {
      console.log(`ID: ${r.id} | Title: ${r.title} | UserID: ${r.userId} | Created At: ${r.createdAt}`);
    });
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}

checkRecentAI();
