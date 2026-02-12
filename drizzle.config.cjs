const { config } = require("dotenv");
const { join } = require("path");

// Load .env manually for CJS
config({ path: join(__dirname, ".env") });

module.exports = {
  schema: "./src/db/schema.js",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
};
