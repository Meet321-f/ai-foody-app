import AsyncStorage from "@react-native-async-storage/async-storage";
import { Recipe } from "../types";

const FAVORITES_KEY_PREFIX = "favorites_v2_";
const AI_HISTORY_KEY_PREFIX = "ai_history_v2_";

export const UserStorageService = {
  /**
   * Save a recipe to user's favorites
   */
  saveFavorite: async (userId: string, recipe: Recipe): Promise<void> => {
    if (!userId) return;
    try {
      const key = `${FAVORITES_KEY_PREFIX}${userId}`;
      const existing = await UserStorageService.getFavorites(userId);

      // Check if already exists to avoid duplicates
      if (existing.some((r) => r.id.toString() === recipe.id.toString())) {
        return;
      }

      const updated = [recipe, ...existing];
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving favorite locally:", error);
    }
  },

  /**
   * Remove a recipe from user's favorites
   */
  removeFavorite: async (userId: string, recipeId: string): Promise<void> => {
    if (!userId) return;
    try {
      const key = `${FAVORITES_KEY_PREFIX}${userId}`;
      const existing = await UserStorageService.getFavorites(userId);

      const updated = existing.filter(
        (r) => r.id.toString() !== recipeId.toString()
      );
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error("Error removing favorite locally:", error);
    }
  },

  /**
   * Get all favorites for a user
   */
  getFavorites: async (userId: string): Promise<Recipe[]> => {
    if (!userId) return [];
    try {
      const key = `${FAVORITES_KEY_PREFIX}${userId}`;
      const json = await AsyncStorage.getItem(key);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error("Error getting favorites locally:", error);
      return [];
    }
  },

  /**
   * Check if a recipe is favorited by user
   */
  isFavorite: async (userId: string, recipeId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const favorites = await UserStorageService.getFavorites(userId);
      return favorites.some((r) => r.id.toString() === recipeId.toString());
    } catch (error) {
      return false;
    }
  },

  /**
   * Save a generated AI recipe to user's history
   */
  saveAiRecipe: async (userId: string, recipe: Recipe): Promise<void> => {
    if (!userId) return;
    try {
      const key = `${AI_HISTORY_KEY_PREFIX}${userId}`;
      const existing = await UserStorageService.getAiHistory(userId);

      // Check for duplicates
      if (existing.some((r) => r.id.toString() === recipe.id.toString())) {
        return;
      }

      const updated = [recipe, ...existing];
      // Limit history to last 50 items to save space
      const limited = updated.slice(0, 50);

      await AsyncStorage.setItem(key, JSON.stringify(limited));
    } catch (error) {
      console.error("Error saving AI recipe locally:", error);
    }
  },

  /**
   * Get AI recipe history for a user
   */
  getAiHistory: async (userId: string): Promise<Recipe[]> => {
    if (!userId) return [];
    try {
      const key = `${AI_HISTORY_KEY_PREFIX}${userId}`;
      const json = await AsyncStorage.getItem(key);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error("Error getting AI history locally:", error);
      return [];
    }
  },

  /**
   * Clear all data for a user (useful for testing or cache clearing)
   */
  clearUserData: async (userId: string): Promise<void> => {
    if (!userId) return;
    try {
      await AsyncStorage.removeItem(`${FAVORITES_KEY_PREFIX}${userId}`);
      await AsyncStorage.removeItem(`${AI_HISTORY_KEY_PREFIX}${userId}`);
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  },
};
