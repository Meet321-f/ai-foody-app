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
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_OPENAI_KEY: process.env.OPENROUTER_OPENAI_KEY || process.env.OPENROUTER_API_KEY,
  OPENROUTER_MISTRAL_KEY: process.env.OPENROUTER_MISTRAL_KEY || process.env.OPENROUTER_API_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || process.env.EXPO_CLERK_SECRET_KEY,
  REDIS_URL: process.env.REDIS_URL,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  
  // Firebase configuration
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
};

// Final validation for Clerk key
if (!ENV.CLERK_SECRET_KEY) {
  console.error("❌ CRITICAL: CLERK_SECRET_KEY (or EXPO_CLERK_SECRET_KEY) is missing from .env");
  process.exit(1);
}
