import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
// import { ENV } from "./env.js"; ❌ Not needed anymore
import * as schema from "../db/schema.js";

// ✅ Use only ONE sql declaration
const sql = neon("postgresql://neondb_owner:npg_d3Ov5ftxArHJ@ep-orange-king-a9n9k94l-pooler.gwc.azure.neon.tech/neondb?sslmode=require");

export const db = drizzle(sql, { schema });
