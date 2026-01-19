import { db } from "../config/db.js";
import { sql } from "drizzle-orm";

async function fixSchema() {
    console.log("Starting schema fix for 'recipes' table...");
    
    try {
        // Add missing columns if they don't exist
        // Note: Neon/Postgres allows adding multiple columns in one ALTER TABLE
        await db.execute(sql`
            ALTER TABLE "recipes" 
            ADD COLUMN IF NOT EXISTS "user_id" text,
            ADD COLUMN IF NOT EXISTS "user_name" text,
            ADD COLUMN IF NOT EXISTS "user_image" text,
            ADD COLUMN IF NOT EXISTS "is_public" text DEFAULT 'false';
        `);
        
        console.log("Schema fix completed successfully! Missing columns added to 'recipes' table.");
        process.exit(0);
    } catch (error) {
        console.error("Schema fix failed:", error);
        process.exit(1);
    }
}

fixSchema();
