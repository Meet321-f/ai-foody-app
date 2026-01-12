import * as SQLite from "expo-sqlite";

// Open the database securely with error handling
let db: SQLite.SQLiteDatabase;
try {
  db = SQLite.openDatabaseSync("foody.db");
} catch (error) {
  console.error("Critical: Failed to open database", error);
  // Fallback or re-throw if critical
  throw error;
}

export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  image: string;
}

export const initDB = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT,
        email TEXT,
        image TEXT
      );
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT
      );
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT,
        image TEXT,
        description TEXT
      );
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT,
        image TEXT,
        data TEXT
      );
      CREATE TABLE IF NOT EXISTS custom_recipes (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT,
        image TEXT,
        data TEXT
      );
    `);
    console.log("Database initialized");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

export const getUserProfile = (): UserProfile | null => {
  try {
    const result = db.getAllSync("SELECT * FROM user_profile LIMIT 1");
    if (result.length > 0) {
      return result[0] as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

export const saveUserProfile = (name: string, email: string, image: string) => {
  try {
    // Check if profile exists
    const existing = db.getAllSync("SELECT * FROM user_profile LIMIT 1");

    if (existing.length > 0) {
      db.runSync(
        "UPDATE user_profile SET name = ?, email = ?, image = ? WHERE id = ?",
        [name, email, image, (existing[0] as any).id]
      );
    } else {
      db.runSync(
        "INSERT INTO user_profile (name, email, image) VALUES (?, ?, ?)",
        [name, email, image]
      );
    }
    console.log("User profile saved");
  } catch (error) {
    console.error("Error saving user profile:", error);
  }
};

export const getAppSetting = (key: string): string | null => {
  try {
    const result = db.getAllSync(
      "SELECT value FROM app_settings WHERE key = ?",
      [key]
    );
    if (result.length > 0) {
      return (result[0] as any).value;
    }
    return null;
  } catch (error) {
    console.error("Error getting app setting:", error);
    return null;
  }
};

export const setAppSetting = (key: string, value: string) => {
  try {
    const result = db.getAllSync(
      "SELECT value FROM app_settings WHERE key = ?",
      [key]
    );
    if (result.length > 0) {
      db.runSync("UPDATE app_settings SET value = ? WHERE key = ?", [
        value,
        key,
      ]);
    } else {
      db.runSync("INSERT INTO app_settings (key, value) VALUES (?, ?)", [
        key,
        value,
      ]);
    }
    console.log(`Setting ${key} saved`);
  } catch (error) {
    console.error("Error saving app setting:", error);
  }
};

// --- Categories ---
export const getCategories = (): any[] => {
  try {
    return db.getAllSync("SELECT * FROM categories");
  } catch (error) {
    console.error("Error getting categories:", error);
    return [];
  }
};

export const saveCategories = (categories: any[]) => {
  try {
    db.runSync("DELETE FROM categories"); // Clear old cache
    const statement = db.prepareSync(
      "INSERT INTO categories (name, image, description) VALUES ($name, $image, $description)"
    );
    for (const cat of categories) {
      statement.executeSync({
        $name: cat.name,
        $image: cat.image,
        $description: cat.description,
      });
    }
    console.log("Categories saved to DB");
  } catch (error) {
    console.error("Error saving categories:", error);
  }
};

// --- Recipes ---
export const getRecipes = (): any[] => {
  try {
    const rows = db.getAllSync("SELECT * FROM recipes");
    return rows
      .map((row: any) => {
        try {
          return JSON.parse(row.data); // Data stored as JSON string
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Error getting recipes:", error);
    return [];
  }
};

export const saveRecipes = (recipes: any[]) => {
  try {
    db.runSync("DELETE FROM recipes");
    const statement = db.prepareSync(
      "INSERT INTO recipes (title, image, data) VALUES ($title, $image, $data)"
    );
    for (const recipe of recipes) {
      statement.executeSync({
        $title: recipe.title,
        $image: recipe.image,
        $data: JSON.stringify(recipe),
      });
    }
    console.log("Recipes saved to DB");
  } catch (error) {
    console.error("Error saving recipes:", error);
  }
};

// --- Custom Indian Recipes ---
export const getCustomRecipes = (): any[] => {
  try {
    const rows = db.getAllSync("SELECT * FROM custom_recipes");
    return rows
      .map((row: any) => {
        try {
          return JSON.parse(row.data);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Error getting custom recipes:", error);
    return [];
  }
};

export const saveCustomRecipes = (recipes: any[]) => {
  try {
    const statement = db.prepareSync(
      "INSERT OR REPLACE INTO custom_recipes (id, title, image, data) VALUES ($id, $title, $image, $data)"
    );
    for (const recipe of recipes) {
      statement.executeSync({
        $id: recipe.id.toString(),
        $title: recipe.title,
        $image: recipe.image,
        $data: JSON.stringify(recipe),
      });
    }
    console.log("Custom recipes saved to DB");
  } catch (error) {
    console.error("Error saving custom recipes:", error);
  }
};
