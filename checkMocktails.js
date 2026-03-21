import { db } from "./src/config/db.js";
import { mocktailsTable } from "./src/db/schema.js";

async function check() {
  try {
    const data = await db.select().from(mocktailsTable).limit(5);
    console.log("MOCKTAILS SAMPLES:");
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
