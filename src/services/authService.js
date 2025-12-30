import { createClerkClient } from "@clerk/clerk-sdk-node";
import { ENV } from "../config/env.js";

const clerkClient = createClerkClient({ secretKey: ENV.CLERK_SECRET_KEY });

/**
 * Middleware to verify Clerk Bearer Tokens securely.
 * Handles the 'Failed to resolve JWK' issue by ensuring valid SDK initialization.
 */
export const clerkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false, 
        error: "Authorization header missing or invalid." 
      });
    }

    if (!ENV.CLERK_SECRET_KEY) {
      console.error("CRITICAL: CLERK_SECRET_KEY is missing from .env!");
      return res.status(500).json({ success: false, error: "Server authentication error. Contact admin." });
    }

    const token = authHeader.split(" ")[1];

    // Verify token with explicit error handling for JWK resolution
    const sessionClaims = await clerkClient.verifyToken(token).catch(err => {
        if (err.message.includes("JWK")) {
          console.error("Clerk Configuration Error: Backend cannot reach Clerk API or Secret Key is invalid.");
        }
        console.error("JWT Verification Detail:", err.message);
        throw new Error("Invalid or expired session token.");
    });

    req.auth = {
      userId: sessionClaims.sub,
      sessionClaims: sessionClaims
    };

    next();
  } catch (error) {
    console.error("Clerk Auth Middleware Error:", error.message);
    return res.status(401).json({ 
      success: false, 
      error: error.message || "Unauthorized"
    });
  }
};
