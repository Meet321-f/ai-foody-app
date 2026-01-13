import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";
import { inArray } from "drizzle-orm";

const namesToCheck = ["Idli Sambar", "Hyderabadi Biryani", "Chakhwi", "Baati Chokha", "Kafuli", "Shorshe Ilish"];

async function verify() {
  try {
    const results = await db.select().from(coustomeRecipesTable).where(inArray(coustomeRecipesTable.name, namesToCheck));
    console.log(results.map(r => r.name));
  } catch (error) {
    console.error("Error verifying:", error);
  }
  process.exit(0);
}

verify();
