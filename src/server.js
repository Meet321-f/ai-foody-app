import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable, recipesTable, commentsTable, profilesTable, coustomeRecipesTable } from "./db/schema.js";
import { and, eq, desc, gt } from "drizzle-orm";
import job from "./config/cron.js";
import { generateRecipe, getSuggestions, generateFullRecipeData, generateRecipeImage } from "./services/aiService.js";
import { clerkAuth } from "./services/authService.js";
import redisClient from "./config/redis.js";
import cluster from "node:cluster";
import os from "node:os";

const app = express();
const PORT = ENV.PORT || 5001;

// Startup Integrity Checks
console.log("------------------- CREDENTIALS CHECK -------------------");
console.log("OPENROUTER_API_KEY:", ENV.OPENROUTER_API_KEY ? `✅ Detected (Len: ${ENV.OPENROUTER_API_KEY.length})` : "❌ MISSING");
console.log("CLERK_SECRET_KEY:  ", ENV.CLERK_SECRET_KEY ? `✅ Detected (Len: ${ENV.CLERK_SECRET_KEY.length})` : "❌ MISSING");
console.log("---------------------------------------------------------");

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Forking for ${numCPUs} CPUs...`);

  if (ENV.NODE_ENV === "production") job.start();

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
}
// Workers share the TCP connection in this app instance
// Note: We let the app definition run for both (overhead is minimal), but only workers listen.
// Or we can rely on !isPrimary for logic, but to minimize diff:
// We will only guard app.listen.

// Original Cron line removed from here


app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;

    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFavorite = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json(newFavorite[0]);
  } catch (error) {
    console.log("Error adding favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.status(200).json(userFavorites);
  } catch (error) {
    console.log("Error fetching the favorites", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    await db
      .delete(favoritesTable)
      .where(
        and(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, recipeId))
      );

    res.status(200).json({ message: "Favorite removed successfully" });
  } catch (error) {
    console.log("Error removing a favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.id, parseInt(id)));

    if (recipe.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json(recipe[0]);
  } catch (error) {
    console.log("Error fetching recipe by id", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/recipes", async (req, res) => {
  try {
    const { title, description, ingredients, instructions, image, cookTime, servings } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRecipe = await db
      .insert(recipesTable)
      .values({
        title,
        description,
        ingredients,
        instructions,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json(newRecipe[0]);
  } catch (error) {
    console.log("Error adding recipe", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/comments", async (req, res) => {
  try {
    const { userId, recipeId, text, userName } = req.body;

    if (!userId || !recipeId || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newComment = await db
      .insert(commentsTable)
      .values({
        userId,
        recipeId: recipeId,
        text,
        userName,
      })
      .returning();

    res.status(201).json(newComment[0]);
  } catch (error) {
    console.log("Error adding comment", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/comments/:recipeId", async (req, res) => {
  try {
    const { recipeId } = req.params;

    const comments = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.recipeId, recipeId))
      .orderBy(desc(commentsTable.createdAt));

    res.status(200).json(comments);
  } catch (error) {
    console.log("Error fetching comments", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Profile endpoints
app.post("/api/profiles", async (req, res) => {
  try {
    const { userId, name, email, bio, profileImage } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newProfile = await db
      .insert(profilesTable)
      .values({
        userId,
        name,
        email,
        bio,
        profileImage,
      })
      .returning();

    res.status(201).json(newProfile[0]);
  } catch (error) {
    console.log("Error creating profile", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/profiles/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId));

    if (profile.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json(profile[0]);
  } catch (error) {
    console.log("Error fetching profile", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.put("/api/profiles/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, bio, profileImage } = req.body;

    const updatedProfile = await db
      .update(profilesTable)
      .set({
        name,
        email,
        bio,
        profileImage,
        updatedAt: new Date(),
      })
      .where(eq(profilesTable.userId, userId))
      .returning();

    if (updatedProfile.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json(updatedProfile[0]);
  } catch (error) {
    console.log("Error updating profile", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// AI endpoints
app.post("/api/ai/suggestions", clerkAuth, async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.auth.userId;
    console.log(`[AI Suggestions] User ${userId} requested for prompt: ${prompt}`);

    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const result = await getSuggestions(prompt);
    console.log(`[AI Suggestions] Success for User ${userId}`);
    res.status(200).json(result);
  } catch (error) {
    console.error(`[AI Suggestions] Error:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/ai/generate-full-recipe", clerkAuth, async (req, res) => {
  try {
    const { title, context } = req.body;
    const userId = req.auth.userId;
    console.log(`[AI Full Recipe] User ${userId} requested for: ${title}`);

    if (!title) return res.status(400).json({ error: "Title is required" });

    // 1. Check Daily Limit (3 recipes per day) using Redis
    let dailyCount = 0;
    const limitKey = `limit:ai:${userId}`;
    try {
      dailyCount = await redisClient.get(limitKey);
    } catch (e) {
      console.warn("Redis rate limit check failed, proceeding without limit check:", e.message);
    }

    if (dailyCount && parseInt(dailyCount) >= 3) {
      return res.status(403).json({
        success: false,
        error: "Daily limit reached! 👨‍🍳 You can only generate 3 recipes every 24 hours. Please try again later."
      });
    }

    // 2. Sequential Generation: Recipe First, then Image
    // This allows us to use the specific 'imagePrompt' generated by the LLM
    const recipeResult = await generateFullRecipeData(title, context);

    if (!recipeResult.success || !recipeResult.data) {
      return res.status(500).json({ success: false, error: "Failed to generate recipe data" });
    }

    const { 
      ingredient, 
      ingredients,
      steps,
      instructions,
      calories, 
      cookTime, 
      prepTime,
      serveTo, 
      servings,
      imagePrompt 
    } = recipeResult.data;

    // Use the generated imagePrompt, or fallback to title if mapped incorrectly
    const promptForImage = imagePrompt || `${recipeResult.data.title || title} food photography`;
    
    // 3. Generate Image
    const imageResult = await generateRecipeImage(promptForImage);

    // Normalize data for DB and Frontend
    const finalIngredients = ingredient || ingredients || recipeResult.data.ingredients || [];
    const finalInstructions = steps || instructions || recipeResult.data.instructions || [];
    const finalCookTime = cookTime || prepTime || "20 min";
    const finalServings = String(serveTo || servings || "1-2");

    // Save to DB
    const [savedRecipe] = await db.insert(recipesTable).values({
      title: recipeResult.data.title || title,
      description: `Calories: ${calories || "Unknown"}. Serving: ${finalServings}`,
      ingredients: finalIngredients,
      instructions: finalInstructions,
      cookTime: finalCookTime,
      servings: finalServings,
      userId: userId,
      image: imageResult.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop"
    }).returning();

    // Increment Limit in Redis
    try {
      const newCount = await redisClient.incr(limitKey);
      if (newCount === 1) {
        await redisClient.expire(limitKey, 86400); // 24 hours
      }
    } catch (e) {
       console.warn("Redis rate limit increment failed:", e.message);
    }

    res.status(200).json({
      success: true,
      data: {
        ...recipeResult.data,
        id: savedRecipe.id,
        title: recipeResult.data.title || title,
        ingredients: finalIngredients,
        instructions: finalInstructions,
        prepTime: finalCookTime,
        calories: calories || "Unknown",
        image: imageResult.imageUrl
      }
    });

  } catch (error) {
    console.error("Full Recipe Generation Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/ai/generate-recipe", clerkAuth, async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.auth.userId;
    
    console.log(`Generating recipe for User: ${userId}`);

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await generateRecipe(prompt);
    
    if (result.success && result.data) {
      // Save the generated recipe to the database
      const [savedRecipe] = await db.insert(recipesTable).values({
        title: result.data.title,
        description: `Difficulty: ${result.data.difficulty || "Medium"}. Calories: ${result.data.calories || "Unknown"}`,
        ingredients: result.data.ingredients,
        instructions: result.data.instructions,
        cookTime: result.data.prepTime || "20 min",
        servings: "1-2",
        userId: userId, // Track who generated this recipe
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop"
      }).returning();

      res.status(200).json({
        success: true,
        data: {
          ...result.data,
          id: savedRecipe.id // Return the DB ID to the frontend
        }
      });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error("Recipe Generation Error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to generate recipe" 
    });
  }
});

// Custom/Indian Recipes from NeonDB (Cached)
app.get("/api/indian-recipes", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const cacheKey = `indian:recipes:${limit}:${offset}`;

    // Check Cache
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }
    } catch (e) {
      console.warn("Redis cache get failed", e.message);
    }

    const recipes = await db
      .select()
      .from(coustomeRecipesTable)
      .limit(limit)
      .offset(offset);

    // Set Cache (1 Hour)
    try {
      await redisClient.set(cacheKey, JSON.stringify(recipes), "EX", 3600);
    } catch (e) {
      console.warn("Redis cache set failed", e.message);
    }
    
    res.status(200).json(recipes);
  } catch (error) {
    console.log("Error fetching indian recipes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/indian-recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await db
      .select()
      .from(coustomeRecipesTable)
      .where(eq(coustomeRecipesTable.id, parseInt(id)));

    if (recipe.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json(recipe[0]);
  } catch (error) {
    console.log("Error fetching indian recipe by id", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/ai/history/:userId", clerkAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    console.log(`[AI History] Authenticated User: ${userId}`);

    const history = await db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.userId, userId))
      .orderBy(desc(recipesTable.createdAt));

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error("Error fetching AI history", error);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
});

// Community & Manual Recipes
app.post("/api/recipes", clerkAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { 
      title, 
      description, 
      ingredients, 
      instructions, 
      image, 
      cookTime, 
      servings, 
      userName, 
      userImage, 
      isPublic 
    } = req.body;

    console.log(`[Create Recipe] User: ${userId}, Title: ${title}`);

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const [newRecipe] = await db
      .insert(recipesTable)
      .values({
        title,
        description,
        ingredients,
        instructions,
        image,
        cookTime,
        servings,
        userId,
        userName,
        userImage,
        isPublic: isPublic ? "true" : "false",
      })
      .returning();

    // Invalidate Community Cache
    try {
      await redisClient.del("community:recipes");
    } catch (e) {
      console.warn("Redis cache invalidation failed", e.message);
    }

    res.status(201).json({ success: true, data: newRecipe });
  } catch (error) {
    console.log("Error creating manual recipe", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/community/recipes", async (req, res) => {
  try {
    const cacheKey = "community:recipes";
    
    // Check Cache
    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
        return res.status(200).json({ success: true, data: JSON.parse(cachedData) });
        }
    } catch (e) {
        console.warn("Redis community cache get failed", e.message);
    }

    const recipes = await db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.isPublic, "true"))
      .orderBy(desc(recipesTable.createdAt));

    // Set Cache (10 Minutes)
    try {
        await redisClient.set(cacheKey, JSON.stringify(recipes), "EX", 600);
    } catch (e) {
        console.warn("Redis community cache set failed", e.message);
    }

    res.status(200).json({ success: true, data: recipes });
  } catch (error) {
    console.log("Error fetching community recipes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/recipes/user/:userId", clerkAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    console.log(`[User Recipes] Fetching for: ${userId}`);

    const recipes = await db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.userId, userId))
      .orderBy(desc(recipesTable.createdAt));

    res.status(200).json({ success: true, data: recipes });
  } catch (error) {
    console.log("Error fetching user recipes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

if (!cluster.isPrimary) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Worker ${process.pid} started. Server running on PORT: ${PORT}`);
  });
}
