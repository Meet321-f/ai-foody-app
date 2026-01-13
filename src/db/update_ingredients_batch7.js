import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";
import { eq } from "drizzle-orm";

const recipesToUpdate = [
  {
    name: "Idli Sambar",
    ingredients: "BASE: 1 cup Toor Dal; FLAVOR: Lemon size Tamarind (Chincha); SPICES: 2-3 tbsp Sambar Powder; VEGETABLES: 1 cup chopped Drumstick (Shevga) / Brinjal / Carrot; TEMPERING: 1 tsp each Mustard seeds (Mohri) & Curry leaves."
  },
  {
    name: "Hyderabadi Biryani",
    ingredients: "MAIN: 2 cups Basmati Rice; PROTEIN: 500g Chicken / Paneer / Veggies; BASE: 1 cup Curd (Dahi); AROMATICS: 1 cup Fried Onions (Birista); FLAVOR: Pinch / handful Saffron (Keshar) & Mint leaves; SPICES: 2 tsp Shahi Jeera & Whole Garam Masala."
  },
  {
    name: "Chakhwi",
    ingredients: "MAIN: 1 cup Sliced Bamboo Shoot (Baas); BASE: 2 pieces Berma (Fermented Fish/Soybean); VEGETABLES: 1/2 cup Jackfruit seeds / Raw Papaya; UNIQUE: 1/4 tsp Baking Soda; SPICES: Crushed Green Chili & Ginger."
  },
  {
    name: "Baati Chokha",
    ingredients: "BAATI: 2 cups Wheat Flour (Gahu Pitha); FILLING: 1 cup Sattu (Roasted Gram Flour); CHOKHA: 2 each Roasted Brinjal (Vange) & Potato; FLAVOR: 3 tbsp Mustard Oil (Mohriche Tel) - Strong flavor; SPICES: 1 tsp each Kalonji & Ajwain."
  },
  {
    name: "Kafuli",
    ingredients: "GREENS: 2 bunches Spinach (Palak) & Fenugreek (Methi); THICKENER: 2 tbsp Rice Paste (Chawal ka ghol); BASE: 1/2 cup Curd (Dahi); SPICES: 1 tsp Jakhya (Wild Mustard) - Authentic; COOKING FAT: 2 tbsp Ghee / Mustard Oil."
  },
  {
    name: "Shorshe Ilish",
    ingredients: "MAIN: 500g Hilsa Fish (Ilish); BASE: 3 tbsp Mustard Seed Paste (Mohri) - Yellow & Black mix; COOKING FAT: 4 tbsp Mustard Oil (Mohriche Tel) - Crucial; SPICES: 4-5 Slit Green Chilies (Hirvi Mirchi); SPICES: 1/2 tsp Nigella Seeds (Kalonji)."
  }
];

async function updateRecipes() {
  console.log("Starting bulk update of ingredients (Batch 7)...");
  for (const r of recipesToUpdate) {
    try {
      const result = await db
        .update(coustomeRecipesTable)
        .set({ ingredients: r.ingredients })
        .where(eq(coustomeRecipesTable.name, r.name))
        .returning();
      
      if (result.length > 0) {
        console.log(`✅ Updated: ${r.name}`);
      } else {
        console.log(`❌ NotFound: ${r.name}`);
      }
    } catch (error) {
      console.error(`🛑 Error updating ${r.name}:`, error.message);
    }
  }
  process.exit(0);
}

updateRecipes();
