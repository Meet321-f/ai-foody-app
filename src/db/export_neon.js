import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportNeonData() {
    console.log("📥 Fetching recipes from Neon DB...");
    try {
        const recipes = await db.select().from(coustomeRecipesTable);
        console.log(`✅ Found ${recipes.length} recipes.`);

        const filePath = path.join(__dirname, "indian_dta_r.json");
        fs.writeFileSync(filePath, JSON.stringify(recipes, null, 2));
        console.log(`💾 Data saved to ${filePath}`);
    } catch (error) {
        console.error("❌ Export failed:", error);
        process.exit(1);
    }
}

exportNeonData().then(() => process.exit(0));
