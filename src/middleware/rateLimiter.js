import redisClient from "../config/redis.js";

/**
 * Reusable Atomic Redis Rate Limiter Middleware
 * 
 * Supports:
 * - Atomic INCR + EXPIRE via Lua
 * - Retry-After HTTP Headers
 * - Configurable Fail-Closed path (for paid APIs)
 * - Test Bypass via secret header
 * 
 * @param {Object} options
 * @param {string} options.name - Base name for the Redis key
 * @param {number} options.limit - Max requests allowed
 * @param {number} options.windowSeconds - Time window in seconds
 * @param {string} options.errorMessage - Custom error message
 * @param {boolean} options.failClosed - If true, blocks requests if Redis is down
 */
export const createRateLimiter = ({ 
  name, 
  limit, 
  windowSeconds, 
  errorMessage, 
  failClosed = false 
}) => {
  return async (req, res, next) => {
    // 1. Dev/Test Bypass check
    const bypassSecret = req.headers["x-ratelimit-bypass"];
    if (process.env.NODE_ENV === "development" && bypassSecret === "foody-dev-bypass") {
      return next();
    }

    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized: User ID missing" });
    }

    const key = `limit:${name}:${userId}`;

    try {
      /**
       * LUA SCRIPT (Atomic):
       * Returns: [current_count, ttl_remaining]
       */
      const luaScript = `
        local current = redis.call('INCR', KEYS[1])
        if current == 1 then
          redis.call('EXPIRE', KEYS[1], ARGV[1])
        end
        local ttl = redis.call('TTL', KEYS[1])
        return {current, ttl}
      `;

      const [currentCount, ttl] = await redisClient.eval(luaScript, 1, key, windowSeconds);

      if (currentCount > limit) {
        console.warn(`[RateLimit] Blocked ${userId} on ${name} (${currentCount}/${limit})`);
        
        // RFC 7231: Retry-After header
        res.set("Retry-After", String(ttl > 0 ? ttl : 1));
        res.set("X-RateLimit-Limit", limit);
        res.set("X-RateLimit-Remaining", 0);
        res.set("X-RateLimit-Reset", Math.floor(Date.now() / 1000) + ttl);

        return res.status(429).json({
          success: false,
          error: "Too Many Requests",
          message: errorMessage || `Limit of ${limit} reached. Try again later.`,
          retryAfter: ttl
        });
      }

      // Standard headers
      res.set("X-RateLimit-Limit", limit);
      res.set("X-RateLimit-Remaining", Math.max(0, limit - currentCount));

      next();
    } catch (error) {
      console.error(`[RateLimit] Redis Error for ${name}:`, error.message);
      
      if (failClosed) {
        return res.status(503).json({ 
          success: false, 
          error: "Service Unavailable", 
          message: "Rate limiting service is currently unavailable. Please try again later." 
        });
      }
      
      // Fail-open for non-critical paths
      next();
    }
  };
};

/**
 * Burst Protector Middleware (Shared across all AI endpoints)
 * Hard-coded limit: 5 requests per minute per user
 */
export const burstLimiter = createRateLimiter({
  name: "burst_ai",
  limit: 5,
  windowSeconds: 60,
  errorMessage: "Slow down! You are sending too many requests too quickly.",
  failClosed: true // Protect paid services from rapid-fire attacks
});

/**
 * Pre-configured Rate Limiters
 */

// 1. Suggestions Limit (Separate & Lighter)
// Allow 50 suggestions per day (since brainstorming is common)
export const suggestionsLimit = createRateLimiter({
  name: "ai_sug",
  limit: 50,
  windowSeconds: 24 * 60 * 60,
  errorMessage: "Brainstorming limit reached. Try again tomorrow!",
  failClosed: false // Safe to fail-open for suggestions
});

// 2. Daily AI Recipe Generation Limit (3 per 24h)
export const dailyAiLimit = createRateLimiter({
  name: "ai_gen",
  limit: 3,
  windowSeconds: 24 * 60 * 60,
  errorMessage: "try again , today credit is over",
  failClosed: true // Paid API: Fail-closed to protect quota
});

// 3. Hourly Proxy Chat Limit (30 per hour)
export const proxyChatLimit = createRateLimiter({
  name: "ai_chat",
  limit: 30,
  windowSeconds: 60 * 60,
  errorMessage: "Hourly AI chat limit reached (30/hour).",
  failClosed: true // Paid API
});

// 4. Hourly Proxy Image Limit (10 per hour)
export const proxyImageLimit = createRateLimiter({
  name: "ai_image",
  limit: 10,
  windowSeconds: 60 * 60,
  errorMessage: "Hourly Image generation limit reached (10/hour).",
  failClosed: true // Paid API
});
