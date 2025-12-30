import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable, recipesTable, commentsTable, profilesTable } from "./db/schema.js";
import { and, eq, desc } from "drizzle-orm";
import job from "./config/cron.js";
import { generateRecipe } from "./services/aiService.js";
import { clerkAuth } from "./services/authService.js";

const app = express();
const PORT = ENV.PORT || 5001;

// Startup Integrity Checks
console.log("------------------- CREDENTIALS CHECK -------------------");
console.log("OPENROUTER_API_KEY:", ENV.OPENROUTER_API_KEY ? `✅ Detected (Len: ${ENV.OPENROUTER_API_KEY.length})` : "❌ MISSING");
console.log("CLERK_SECRET_KEY:  ", ENV.CLERK_SECRET_KEY ? `✅ Detected (Len: ${ENV.CLERK_SECRET_KEY.length})` : "❌ MISSING");
console.log("---------------------------------------------------------");

if (ENV.NODE_ENV === "production") job.start();

app.use(express.json());

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
        and(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, parseInt(recipeId)))
      );

    res.status(200).json({ message: "Favorite removed successfully" });
  } catch (error) {
    console.log("Error removing a favorite", error);
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
        recipeId: parseInt(recipeId),
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
      .where(eq(commentsTable.recipeId, parseInt(recipeId)))
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

app.get("/api/ai/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

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

app.listen(PORT, () => {
  console.log("Server is running on PORT:", PORT);
});
