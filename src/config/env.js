
import dotenv from "dotenv";
dotenv.config(); // ✅ Load .env manually before using process.env

export const ENV = {
  PORT: process.env.PORT || 5001,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
};
