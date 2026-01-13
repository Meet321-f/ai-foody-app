import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";
import { eq } from "drizzle-orm";

const recipesToUpdate = [
  {
    name: "Bai",
    ingredients: "BASE: 1 bunch Seasonal Greens (Mustard/Spinach), 1 cup chopped Cauliflower & Beans; FLAVOR: 2 tbsp Bekang (Fermented Soybean) or Pork Sauce 'Sa-um', 4-5 Green Chilies (Bird's Eye); THICKENER: 2 tbsp mashed Rice (Cooked); AROMATICS: Crushed Ginger & Garlic."
  },
  {
    name: "Smoked Pork with Bamboo Shoot",
    ingredients: "MAIN: 500g Smoked Pork (or Beef/Soy Chunks); FLAVOR: 1/2 cup Dried Bamboo Shoot (Baans), 1 tbsp Akhuni (Fermented Soya - Optional); SPICE: 1-2 Raja Mircha (Ghost Pepper); AROMATICS: Roughly pounded Ginger & Garlic."
  },
  {
    name: "Dalma",
    ingredients: "LENTILS: 1 cup Toor Dal (Arhar); VEGETABLES: 1 cup large cubes Pumpkin (Kaddu), 1/2 cup each Raw Banana & Brinjal, 1-2 pieces Drumstick & Potato; TEMPERING: 1 tbsp Panch Phoron (Mustard, Fennel, Fenugreek, Cumin, Nigella); GARNISH: 2 tbsp Fresh Grated Coconut."
  },
  {
    name: "Sarson Da Saag & Makki Roti",
    ingredients: "GREENS: 2 bunches Mustard Greens (Sarson), 1 bunch each Spinach (Palak) & Bathua; THICKENER: 2 tbsp Makki Atta (For Saag) + 2 cups (For Roti); FAT: Generous amount White Butter (Makhan) / Ghee; AROMATICS: Finely chopped Ginger, Garlic, Green Chili."
  },
  {
    name: "Dal Baati Churma",
    ingredients: "BAATI DOUGH: 2 cups Wheat Flour (Atta) & 1/2 cup Sooji; DAL: 1 cup Panchmel Dal (Moong, Urad, Chana, Toor, Masoor); ESSENTIALS: 1-2 cups Ghee (For dipping Baati & Churma); SPICES: Whole Coriander & Red Chili for Tadka."
  },
  {
    name: "Thukpa",
    ingredients: "BASE: 1 packet Egg Noodles / Wheat Noodles; BROTH: 4 cups Chicken/Veg Stock; VEGETABLES: 1 cup julienned Carrot, Cabbage, Onion; SEASONING: 1 tbsp each Soy Sauce & Vinegar; SPICE: Pinch of Timur (Sichuan Pepper) for authentic taste."
  }
];

async function updateRecipes() {
  console.log("Starting bulk update of ingredients (Batch 6)...");
  for (const r of recipesToUpdate) {
    try {
      const result = await db
        .update(coustomeRecipesTable)
        .set({ ingredients: r.ingredients })
        .where(eq(coustomeRecipesTable.name, r.name))
        .returning();
      
      if (result.length > 0) {
        console.log(`✅ Updated: ${r.name} (${result.length} row(s))`);
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
