import { Recipe } from "../types";
import { API_URL } from "../constants/api";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export const MealAPI = {
  // Helper for retrying requests (Good for cold starts or network blips)
  fetchWithRetry: async (
    url: string,
    options: RequestInit = {},
    retries = 2, // Reduced retries for faster fallback
    backoff = 500, // Faster backoff
    timeout = 10000, // Default 10s timeout
  ) => {
    for (let i = 0; i < retries; i++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        console.log(`[Fetch] Attempt ${i + 1} to: ${url}`);
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMsg = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.error || errorMsg;
          } catch (e) {
            // Not a JSON response, fallback to default status text
          }
          throw new Error(errorMsg);
        }
        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        if (i === retries - 1) {
          console.error(`[Fetch] Final failure for ${url}:`, err);
          throw err;
        }
        console.warn(`[Fetch] Attempt ${i + 1} failed for ${url}. Retrying...`);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
    throw new Error("Max retries reached");
  },

  // search meal by name
  searchMealsByName: async (query: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("Error searching meals by name:", error);
      return [];
    }
  },

  // lookup full meal details by id
  getMealById: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
      const data = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error("Error getting meal by id:", error);
      return null;
    }
  },

  // lookup a single random meal
  getRandomMeal: async () => {
    try {
      const response = await fetch(`${BASE_URL}/random.php`);
      const data = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error("Error getting random meal:", error);
      return null;
    }
  },

  // get multiple random meals
  getRandomMeals: async (count = 6) => {
    try {
      const promises = Array(count)
        .fill(null)
        .map(() => MealAPI.getRandomMeal());
      const meals = await Promise.all(promises);
      return meals.filter((meal) => meal !== null);
    } catch (error) {
      console.error("Error getting random meals:", error);
      return [];
    }
  },

  // list all meal categories
  getCategories: async () => {
    try {
      const response = await fetch(`${BASE_URL}/categories.php`);
      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  },

  // filter by main ingredient
  filterByIngredient: async (ingredient: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`,
      );
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("Error filtering by ingredient:", error);
      return [];
    }
  },

  // filter by category
  filterByCategory: async (category: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`,
      );
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("Error filtering by category:", error);
      return [];
    }
  },

  // GET Indian Recipes from our NeonDB Backend
  getIndianRecipes: async (limit: number = 10, userId: string = "guest") => {
    try {
      const { API_URL } = await import("../constants/api");
      let url = `${API_URL}/indian-recipes?limit=${limit}&userId=${userId}`;
      console.log(`🔍 Fetching Indian recipes from: ${url}`);

      const response = await MealAPI.fetchWithRetry(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      const recipesArr = data.recipes || data || [];
      console.log(`✅ Fetched ${recipesArr.length} Indian recipes`);
      return recipesArr;
    } catch (error) {
      const err = error as Error;
      console.error("❌ Error getting indian recipes:", err);
      return [];
    }
  },

  // Search Indian Recipes from our Backend
  searchIndianRecipes: async (query: string) => {
    try {
      const { API_URL } = await import("../constants/api");
      let url = `${API_URL}/indian-recipes/search?q=${encodeURIComponent(query)}`;
      console.log(`🔍 Searching Indian recipes: ${url}`);

      const response = await MealAPI.fetchWithRetry(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      const recipesArr = data.recipes || data || [];
      console.log(
        `✅ Found ${recipesArr.length} Indian recipes matching "${query}"`,
      );
      return recipesArr;
    } catch (error) {
      console.error("❌ Error searching indian recipes:", error);
      return [];
    }
  },

  // GET AI Recipe by ID from NeonDB
  getAiRecipeById: async (id: string) => {
    try {
      const { API_URL } = await import("../constants/api");
      let url = `${API_URL}/recipes/${id}`;
      console.log(`🔍 Fetching AI recipe detail: ${url}`);

      const response = await MealAPI.fetchWithRetry(url);
      const data = await response.json();
      return data || null;
    } catch (error) {
      console.error("❌ Error getting ai recipe by id:", error);
      return null;
    }
  },

  // GET Indian Recipe by ID from NeonDB
  getIndianRecipeById: async (id: string) => {
    try {
      const { API_URL } = await import("../constants/api");
      let url = `${API_URL}/indian-recipes/${id}`;
      console.log(`🔍 Fetching Indian recipe detail: ${url}`);

      const response = await MealAPI.fetchWithRetry(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      console.log(`✅ Fetched recipe detail for ID: ${id}`);
      return data || null;
    } catch (error) {
      console.error("❌ Error getting indian recipe by id:", error);
      return null;
    }
  },

  // Get AI Recipe Suggestions
  getAiSuggestions: async (prompt: string, token: string) => {
    try {
      const { API_URL } = await import("../constants/api");
      let url = `${API_URL}/ai/suggestions`;
      console.log(`🔍 Requesting AI suggestions: ${url}`);

      const body = JSON.stringify({ prompt });
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      return await (
        await MealAPI.fetchWithRetry(
          url,
          {
            method: "POST",
            headers,
            body,
          },
          2,
          1000,
          60000,
        )
      ) // 60s timeout
        .json();
    } catch (error) {
      console.error("❌ Error getting AI suggestions:", error);
      throw error;
    }
  },

  // Generate Full AI Recipe
  generateFullAiRecipe: async (
    title: string,
    skipImage: boolean,
    token: string,
    context: string = "",
  ) => {
    try {
      const { API_URL } = await import("../constants/api");
      let url = `${API_URL}/ai/generate-full-recipe`;
      console.log(`🔍 Generating full AI recipe: ${url}`);

      const body = JSON.stringify({ title, skipImage, context });
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      return await (
        await MealAPI.fetchWithRetry(
          url,
          {
            method: "POST",
            headers,
            body,
          },
          2,
          1000,
          60000,
        )
      ) // 60s timeout
        .json();
    } catch (error) {
      console.error("❌ Error generating full AI recipe:", error);
      throw error;
    }
  },

  // transform AI Recipe from recipesTable
  transformAiRecipe: (recipe: any): Recipe | null => {
    if (!recipe) return null;

    let ingredients = [];
    if (typeof recipe.ingredients === "string") {
      try {
        ingredients = JSON.parse(recipe.ingredients);
      } catch (e) {
        ingredients = recipe.ingredients.split("; ");
      }
    } else {
      ingredients = recipe.ingredients || [];
    }

    let instructions = [];
    if (typeof recipe.instructions === "string") {
      try {
        instructions = JSON.parse(recipe.instructions);
      } catch (e) {
        instructions = recipe.instructions.split(". ");
      }
    } else {
      instructions = recipe.instructions || [];
    }

    return {
      id: recipe.id.toString().startsWith("ai_")
        ? recipe.id
        : `ai_${recipe.id}`,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image,
      cookTime: recipe.cookTime || "25 min",
      servings: recipe.servings || 2,
      category: "AI Chef Special",
      ingredients,
      instructions,
      originalData: recipe,
      isAi: true,
    };
  },

  // transform Custom Recipe Data
  transformCustomRecipe: (recipe: any): Recipe | null => {
    if (!recipe) return null;

    const DEFAULT_UNSPLASH = "photo-1546069901-ba9599a7e63c";

    // Handle instructions/steps (support both fields)
    let rawSteps = recipe.steps || recipe.instructions;
    let steps = [];

    if (typeof rawSteps === "string") {
      try {
        // Try parsing if it's a JSON array string
        if (rawSteps.trim().startsWith("[")) {
          steps = JSON.parse(rawSteps);
        } else {
          // Otherwise split by newline or periods
          steps = rawSteps.split(/\r?\n/).filter((s) => s.trim());
          if (steps.length <= 1) {
            steps = rawSteps.split(". ").filter((s) => s.trim());
          }
        }
      } catch (e) {
        steps = [rawSteps];
      }
    } else if (Array.isArray(rawSteps)) {
      steps = rawSteps;
    } else {
      steps = rawSteps ? [rawSteps] : [];
    }

    // Handle ingredients (support parsing from string or array)
    let ingredients = [];
    if (typeof recipe.ingredients === "string") {
      try {
        if (recipe.ingredients.trim().startsWith("[")) {
          ingredients = JSON.parse(recipe.ingredients);
        } else {
          ingredients = recipe.ingredients
            .split(";")
            .map((i: string) => i.trim())
            .filter((i: string) => i);
        }
      } catch (e) {
        ingredients = [recipe.ingredients];
      }
    } else if (Array.isArray(recipe.ingredients)) {
      ingredients = recipe.ingredients;
    }

    return {
      id: recipe.id.toString().startsWith("custom_")
        ? recipe.id
        : `custom_${recipe.id}`,
      title: recipe.title || recipe.name, // Support both title and name
      description: recipe.description || `State: ${recipe.state || "India"}.`,
      image: (() => {
        const img =
          recipe.image ||
          recipe.imageUrl ||
          recipe.photo ||
          recipe.thumbnail ||
          recipe.img ||
          recipe.img_url ||
          null;

        // If it's the known default salad image, treat it as null to show our gradient placeholder
        if (typeof img === "string" && img.includes(DEFAULT_UNSPLASH)) {
          return null;
        }
        return img;
      })(),
      cookTime: recipe.cookTime || recipe.prepTime || "30 min",
      servings: recipe.servings || 4,
      category: "Indian",
      area: recipe.state || recipe.area || "India",
      ingredients: ingredients,
      instructions: steps,
      originalData: recipe,
      isCustom: true,
    };
  },

  // transform TheMealDB meal data to our app format
  transformMealData: (meal: any): Recipe | null => {
    if (!meal) return null;

    // extract ingredients from the meal object
    const ingredients: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        const measureText =
          measure && measure.trim() ? `${measure.trim()} ` : "";
        ingredients.push(`${measureText}${ingredient.trim()}`);
      }
    }

    // extract instructions
    const instructions = meal.strInstructions
      ? meal.strInstructions
          .split(/\r?\n/)
          .filter((step: string) => step.trim())
      : [];

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      description: meal.strInstructions
        ? meal.strInstructions.substring(0, 120) + "..."
        : "Delicious meal from TheMealDB",
      image: meal.strMealThumb,
      cookTime: "30 minutes",
      servings: 4,
      category: meal.strCategory || "Main Course",
      area: meal.strArea,
      ingredients,
      instructions,
      originalData: meal,
    };
  },
};
