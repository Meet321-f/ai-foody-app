import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, "../../.env");
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ CRITICAL: ${key} is missing from .env`);
    process.exit(1);
  }
  return value;
}

export const ENV = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || "development",

  DATABASE_URL: requireEnv("DATABASE_URL"),
  OPENROUTER_API_KEY: requireEnv("OPENROUTER_API_KEY"),
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || process.env.EXPO_CLERK_SECRET_KEY,
};

// Final validation for Clerk key
if (!ENV.CLERK_SECRET_KEY) {
  console.error("❌ CRITICAL: CLERK_SECRET_KEY (or EXPO_CLERK_SECRET_KEY) is missing from .env");
  process.exit(1);
}
