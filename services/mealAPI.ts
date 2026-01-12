import { Recipe } from "../types";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export const MealAPI = {
  // search meal by name
  searchMealsByName: async (query: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`
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
        `${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`
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
        `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`
      );
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("Error filtering by category:", error);
      return [];
    }
  },

  // GET Indian Recipes from our NeonDB Backend
  getIndianRecipes: async () => {
    try {
      const { API_URL } = await import("../constants/api");
      const response = await fetch(`${API_URL}/indian-recipes`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("Error getting indian recipes:", error);
      return [];
    }
  },

  // GET Indian Recipe by ID
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

  // transform Custom Recipe Data
  transformCustomRecipe: (recipe: any): Recipe | null => {
    if (!recipe) return null;

    let steps = [];
    try {
      steps = JSON.parse(recipe.steps);
    } catch (e) {
      // Fallback if not JSON string
      steps = recipe.steps ? [recipe.steps] : [];
    }

    return {
      id: `custom_${recipe.id}`, // Add prefix to differentiate
      title: recipe.name,
      description: `State: ${recipe.state}. Calories: ${
        recipe.calories || "N/A"
      }`,
      image: recipe.image,
      cookTime: recipe.cookTime,
      servings: 4, // Default our recipes to 4
      category: "Indian",
      area: recipe.state,
      ingredients: recipe.ingredients ? recipe.ingredients.split("; ") : [],
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
