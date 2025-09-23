import { ENV } from "./src/config/env.js";

export default {
  schema: "./src/db/schema.js",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: "postgresql://neondb_owner:npg_d3Ov5ftxArHJ@ep-orange-king-a9n9k94l-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require" },
};