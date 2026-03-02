import { db } from "../config/db.js";
import { mocktailsTable } from "./schema.js";

async function run() {
  try {
    const record = {
      id: 2,
      name: "Winter Special - Mulled Apple Juice",
      imageUrl: null,
      time: "15 mins",
      ingredients: "🍎 Apple Juice – 2 cups, 🌿 Cinnamon Stick – 1 piece, 🌰 Cloves – 2 pieces, ⭐ Star Anise – 1 piece, 🍯 Honey – 1 tbsp (optional), 🍊 Orange Slices – 2 slices (for garnish)",
      calories: "120 kcal",
      instructions: "Pour apple juice into a saucepan and heat over medium flame. Add cinnamon stick, cloves, and star anise into the juice. Let it simmer gently for 7–10 minutes. Do not boil. Turn off the heat and stir in honey if desired. Strain the drink into mugs to remove whole spices. Garnish with orange slices or a cinnamon stick. Serve warm and enjoy.",
      createdAt: new Date("2026-03-01 11:50:00")
    };

    console.log("Inserting record:", record.name);
    await db.insert(mocktailsTable).values(record);
    console.log("✅ Successfully inserted Mulled Apple Juice into mocktails table!");
  } catch (error) {
    console.error("❌ Error inserting record:", error);
  } finally {
    process.exit(0);
  }
}

run();
