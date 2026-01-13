import { pgTable, serial, text, timestamp, integer, json } from "drizzle-orm/pg-core";

export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  recipeId: text("recipe_id").notNull(),
  title: text("title").notNull(),
  image: text("image"),
  cookTime: text("cook_time"),
  servings: text("servings"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipesTable = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  ingredients: json("ingredients"),
  instructions: json("instructions"),
  image: text("image"),
  cookTime: text("cook_time"),
  servings: text("servings"),
  userId: text("user_id"),
  userName: text("user_name"),
  userImage: text("user_image"),
  isPublic: text("is_public").default("false"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const commentsTable = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  recipeId: text("recipe_id").notNull(),
  text: text("text").notNull(),
  userName: text("user_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  name: text("name"),
  email: text("email"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coustomeRecipesTable = pgTable("coustome_recipes", {
  id: serial("id").primaryKey(),
  state: text("state").notNull(),
  name: text("name").notNull(),
  image: text("image"),
  cookTime: text("cook_time"),
  ingredients: text("ingredients"),
  calories: text("calories"),
  steps: text("steps"),
  createdAt: timestamp("created_at").defaultNow(),
});
