import { Recipe } from "../types";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export const MealAPI = {
  // Helper for retrying requests (Good for cold starts or network blips)
  fetchWithRetry: async (
    url: string,
    options: RequestInit = {},
    retries = 3,
    backoff = 1000,
  ) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          // If 404, maybe it's not ready yet, or truly missing. We retry 500s mostly.
          // But user said "not found" appears when it shouldn't, so we might want to retry 404s briefly.
          if (response.status === 404) {
            throw new Error(`HTTP 404: Not Found`);
          }
          throw new Error(`HTTP ${response.status}`);
        }
        return response;
      } catch (err) {
        if (i === retries - 1) throw err;
        console.warn(
          `Attempt ${i + 1} failed for ${url}. Retrying in ${backoff}ms...`,
        );
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
      const url = `${API_URL}/indian-recipes?limit=${limit}&userId=${userId}`;
      console.log(`🔍 Fetching Indian recipes from: ${url}`);

      const response = await MealAPI.fetchWithRetry(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log(`✅ Fetched ${data.length} Indian recipes from NeonDB`);
      return data || [];
    } catch (error) {
      const err = error as Error;
      console.error("❌ Error getting indian recipes:", err);
      console.error("Error details:", err.message || error);
      return [];
    }
  },

  // Search Indian Recipes from our Backend
  searchIndianRecipes: async (query: string) => {
    try {
      const { API_URL } = await import("../constants/api");
      const url = `${API_URL}/indian-recipes/search?q=${encodeURIComponent(query)}`;
      console.log(`🔍 Searching Indian recipes: ${url}`);

      const response = await MealAPI.fetchWithRetry(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log(`✅ Found ${data.length} Indian recipes matching "${query}"`);
      return data || [];
    } catch (error) {
      console.error("❌ Error searching indian recipes:", error);
      return [];
    }
  },

  // GET Indian Recipe by ID from NeonDB
  getAiRecipeById: async (id: string) => {
    try {
      const { API_URL } = await import("../constants/api");
      const response = await MealAPI.fetchWithRetry(`${API_URL}/recipes/${id}`);
      const data = await response.json();
      return data || null;
    } catch (error) {
      console.error("Error getting ai recipe by id:", error);
      return null;
    }
  },

  // GET Indian Recipe by ID from NeonDB
  getIndianRecipeById: async (id: string) => {
    try {
      const { API_URL } = await import("../constants/api");
      const response = await fetch(`${API_URL}/indian-recipes/${id}`);
      const data = await response.json();
      return data || null;
    } catch (error) {
      console.error("Error getting indian recipe by id:", error);
      return null;
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
      image: recipe.image,
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
