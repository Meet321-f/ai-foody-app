import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
// import { ENV } from "./env.js"; ❌ Not needed anymore
import * as schema from "../db/Schema.js";

// ✅ Use only ONE sql declaration
const sql = neon("***REMOVED***");

export const db = drizzle(sql, { schema });
