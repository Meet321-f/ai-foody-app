import Redis from "ioredis";
import { ENV } from "./env.js";

// Uses REDIS_URL from env if available, or defaults to localhost:6379
const redisClient = new Redis(ENV.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redisClient;
