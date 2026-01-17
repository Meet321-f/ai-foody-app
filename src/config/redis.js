import Redis from "ioredis";
import { ENV } from "./env.js";

// Uses REDIS_URL from env if available, or defaults to the provided Redis Cloud instance
const redisUrl = ENV.REDIS_URL || "redis://:uIWYyRq49ObbfOKZFmAl0dvR6DPkDmLa@redis-13020.crce276.ap-south-1-3.ec2.cloud.redislabs.com:13020";

const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
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
