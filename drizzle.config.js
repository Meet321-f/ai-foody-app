import { ENV } from "./src/config/env.js";

export default {
  schema: "./src/db/Schema.js",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: "***REMOVED***&channel_binding=require" },
};