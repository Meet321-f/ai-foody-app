import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable, recipesTable, commentsTable, profilesTable, coustomeRecipesTable, vegRecipesTable, nonVegRecipesTable } from "./db/schema.js";
import { and, eq, desc, gt, sql, asc, gte, lte, inArray, ilike } from "drizzle-orm";
import job from "./config/cron.js";
import { generateRecipe, getSuggestions, generateFullRecipeData, generateRecipeImage } from "./services/aiService.js";
import { clerkAuth } from "./services/authService.js";
import redisClient from "./config/redis.js";
import { firestore } from "./config/firebase.js";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";


const app = express();
const PORT = ENV.PORT || 5001;

// SINGLE PROCESS MODE for atomic Redis operations
if (ENV.NODE_ENV === "production") job.start();

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
    const skipImage = true; // Always skip image generation for now as requested
    const userId = req.auth.userId;
    console.log(`[AI Full Recipe] User ${userId} requested for: ${title} (Forced SkipImage)`);

    if (!title) return res.status(400).json({ error: "Title is required" });

    // 1. Check Daily Limit (3 recipes per day) using Redis
    let dailyCount = 0;
    const limitKey = `limit:ai:${userId}`;
    try {
      dailyCount = await redisClient.get(limitKey);
    } catch (e) {
      console.warn("Redis rate limit check failed, proceeding without limit check:", e.message);
    }

    if (dailyCount && parseInt(dailyCount) >= 10) { // Increased to 10 for testing
      return res.status(403).json({
        success: false,
        error: "Daily limit reached! 👨‍🍳 You can only generate 10 recipes every 24 hours. Please try again later."
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
    
    // 3. Generate Image (Only if not skipped)
    let imageResult = { success: false, imageUrl: null };
    if (!skipImage) {
      console.log(`[AI Full Recipe] Generating image for: ${promptForImage}`);
      imageResult = await generateRecipeImage(promptForImage);
    } else {
      console.log(`[AI Full Recipe] Skipping image generation as requested.`);
    }

    // Normalize data for DB and Frontend
    const finalIngredients = ingredient || ingredients || recipeResult.data.ingredients || [];
    const finalInstructions = steps || instructions || recipeResult.data.instructions || [];
    const finalCookTime = cookTime || prepTime || "20 min";
    const finalServings = String(serveTo || servings || "1-2");
    // Verify AI output
    if (!finalIngredients.length || !finalInstructions.length) {
      console.warn("⚠️ AI returned empty ingredients/instructions:", recipeResult.data);
    }

    console.log("📝 Inserting into DB:", {
      title: recipeResult.data.title || title,
      userId,
      ingredientsCount: finalIngredients.length,
      instructionsCount: finalInstructions.length
    });

    // Save to DB
    let savedRecipe;
    try {
      [savedRecipe] = await db.insert(recipesTable).values({
        title: recipeResult.data.title || title,
        description: `Calories: ${calories || "Unknown"}. Serving: ${finalServings}`,
        ingredients: finalIngredients,
        instructions: finalInstructions,
        cookTime: finalCookTime,
        servings: finalServings,
        userId: userId,
        // Check if DB requires null or undefined? strict schema says 'image' is text, so null is fine.
        image: imageResult.imageUrl || null
      }).returning();
      console.log("✅ DB Insert Success! ID:", savedRecipe.id);
    } catch (dbErr) {
      console.error("❌ DB Insert Failed:", dbErr);
      // Fallback: If JSON fields failed, try to save simpler version
       [savedRecipe] = await db.insert(recipesTable).values({
        title: recipeResult.data.title || title,
        description: "AI Generated Recipe (Partial Data)",
        ingredients: [],
        instructions: [],
        cookTime: "N/A",
        servings: "2",
        userId: userId,
        image: null
      }).returning();
    }

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
        image: null,
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

// Custom/Indian Recipes from Firebase Firestore (Cached & Fair Randomized Fetching)
app.get("/api/indian-recipes", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;
    
    console.log(`[Indian Recipes] Fetching from NeonDB (Limit: ${limit}, Offset: ${offset})`);

    const recipes = await db
      .select()
      .from(coustomeRecipesTable)
      .limit(limit)
      .offset(offset);

    res.status(200).json({ recipes });
  } catch (error) {
    console.log("Error fetching indian recipes from NeonDB", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Search Indian Recipes from Firebase Firestore
app.get("/api/indian-recipes/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    console.log(`[Indian Recipes Search] Searching NeonDB for: ${q}`);
    
    const results = await db
      .select()
      .from(coustomeRecipesTable)
      .where(ilike(coustomeRecipesTable.name, `%${q}%`))
      .limit(20);

    console.log(`[Indian Recipes Search] Found ${results.length} results for: ${q}`);
    res.status(200).json({ recipes: results }); 
  } catch (error) {
    console.log("Error searching indian recipes from NeonDB", error);
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

app.get("/api/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const recipeId = parseInt(id);
    
    // Check all three potential custom recipe tables
    const [legacy, veg, nonveg] = await Promise.all([
      db.select().from(recipesTable).where(eq(recipesTable.id, recipeId)).limit(1),
      db.select().from(vegRecipesTable).where(eq(vegRecipesTable.id, recipeId)).limit(1),
      db.select().from(nonVegRecipesTable).where(eq(nonVegRecipesTable.id, recipeId)).limit(1)
    ]);

    const recipe = legacy[0] || veg[0] || nonveg[0];

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.log("Error fetching recipe by id", error);
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
      isPublic,
      dietType // "veg" or "non-veg"
    } = req.body;

    console.log(`[Create Recipe] User: ${userId}, Title: ${title}, Diet: ${dietType}`);

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const targetTable = dietType === "veg" ? vegRecipesTable : (dietType === "non-veg" ? nonVegRecipesTable : recipesTable);

    const [newRecipe] = await db
      .insert(targetTable)
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

    // Fetch from all 3 tables for community
    const [legacyRecipes, vegRecipes, nonVegRecipes] = await Promise.all([
      db.select().from(recipesTable).where(eq(recipesTable.isPublic, "true")),
      db.select().from(vegRecipesTable).where(eq(vegRecipesTable.isPublic, "true")),
      db.select().from(nonVegRecipesTable).where(eq(nonVegRecipesTable.isPublic, "true"))
    ]);

    const allRecipes = [...legacyRecipes, ...vegRecipes, ...nonVegRecipes]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Set Cache (10 Minutes)
    try {
        await redisClient.set(cacheKey, JSON.stringify(allRecipes), "EX", 600);
    } catch (e) {
        console.warn("Redis community cache set failed", e.message);
    }

    res.status(200).json({ success: true, data: allRecipes });
  } catch (error) {
    console.log("Error fetching community recipes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/recipes/user/:userId", clerkAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    console.log(`[User Recipes] Fetching for: ${userId}`);

    const [legacyRecipes, vegRecipes, nonVegRecipes] = await Promise.all([
      db.select().from(recipesTable).where(eq(recipesTable.userId, userId)),
      db.select().from(vegRecipesTable).where(eq(vegRecipesTable.userId, userId)),
      db.select().from(nonVegRecipesTable).where(eq(nonVegRecipesTable.userId, userId))
    ]);

    const allRecipes = [...legacyRecipes, ...vegRecipes, ...nonVegRecipes]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, data: allRecipes });
  } catch (error) {
    console.log("Error fetching user recipes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on PORT: ${PORT}`);
});
