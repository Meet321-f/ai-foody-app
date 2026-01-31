import Redis from "ioredis";
import { ENV } from "./env.js";

// Uses REDIS_URL from env if available. 
const redisUrl = ENV.REDIS_URL;

if (!redisUrl) {
  console.warn("⚠️ REDIS_URL not found in environment variables. Redis operations may fail.");
} else {
  // Mask password in logs
  console.log("🔌 Connecting to Redis:", redisUrl.replace(/:[^:@]*@/, ":****@"));
}

const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  // Explicitly use password if provided separately
  password: ENV.REDIS_PASSWORD || undefined, 
  // Enable TLS for 'rediss://' (common in production/Render)
  tls: redisUrl && redisUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on("connect", async () => {
  console.log("✅ Redis Cloud connected successfully");
  
  // Test connection
  try {
    await redisClient.set("startup_test", "connected");
    const testValue = await redisClient.get("startup_test");
    console.log("🚀 Redis Test:", testValue === "connected" ? "SUCCESS" : "FAILED");
  } catch (err) {
    console.error("❌ Redis Test Error:", err.message);
  }
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redisClient;
