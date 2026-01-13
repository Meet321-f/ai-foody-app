import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";
import { eq } from "drizzle-orm";

const recipesToUpdate = [
  {
    name: "Thukpa",
    ingredients: "200g Egg Noodles or Plain Noodles (boiled); 2 tbsp Vegetable Oil; 1/2 cup Onion (finely chopped); 1 tbsp Ginger (minced); 1 tbsp Garlic (minced); 1 cup Boneless Chicken (cut into strips) - OR Mixed Veggies (Carrot, Cabbage, Beans, Spinach); 4-5 cups Chicken or Vegetable Stock (very important for taste); 2 Tomatoes (chopped); 1 tsp Soy Sauce; 1/2 tsp Vinegar (optional); 1/2 tsp Black Pepper Powder; 1 tsp Cumin Powder; 1/2 tsp Turmeric Powder; Salt to taste; 2 Green Chilies (slit); Fresh Coriander and Spring Onions for garnish; Lemon wedges."
  },
  {
    name: "Zan (Millet Porridge)",
    ingredients: "1 cup Finger Millet Flour (Ragi/Mandua flour); 4-5 cups Water (hot); 1 tbsp Butter or Ghee; 1 cup Green Leafy Vegetables (Mustard greens, Spinach, or Lai Patta) - washed and chopped; 1/2 cup Green Peas (optional); 100g Smoked Pork or Chicken (cut into small pieces - optional for non-veg version); 1 tsp Ginger (crushed); Salt to taste; 1-2 Dry Red Chilies (roasted and crushed)."
  },
  {
    name: "Pika Pila",
    ingredients: "2 cups Bamboo Shoots (fresh or fermented, sliced thinly); 200g Pork Fat (Lard) - cut into small chunks; 1/2 tsp Baking Soda (Cooking Soda) - essential for texture; 3-4 King Chilies (Bhut Jolokia/Raja Mircha) - fresh or dried; Salt to taste; (Note: This is a pickle-like dish, no water is added)."
  },
  {
    name: "Lukter",
    ingredients: "250g Smoked Dry Meat (Beef or Pork) - dried over fireplace; 3-4 tbsp Dry King Chili Flakes (Bhut Jolokia flakes); 2 tbsp Fresh Ginger (crushed or roughly chopped); 1 tbsp Garlic cloves (crushed); Salt to taste; (Note: No oil is used, it is a dry mixture)."
  },
  {
    name: "Pehak",
    ingredients: "1 cup Fermented Soya Beans (local sticky beans); 4-5 Dry Red Chilies (King Chili preferred for heat) - roasted over flame; Salt to taste; 1/2 cup Warm Water (to adjust consistency); (Optional: A few cloves of garlic)."
  },
  {
    name: "Litti Chokha",
    ingredients: "DOUGH: 3 cups Whole Wheat Flour; 1/4 cup Ghee; 1 tsp Ajwain (Carom seeds); 1/2 tsp Salt; Water. FILLING (Sattu): 2 cups Sattu (Roasted Gram Flour); 1 Onion (finely chopped); 1 tbsp Ginger (chopped); 1 tbsp Garlic (chopped); 2-3 Green Chilies; 1/2 cup Fresh Coriander; 1 tsp Ajwain; 1/2 tsp Mangraila (Nigella seeds); 1 tbsp Mustard Oil (Raw); 1 tbsp Lemon Juice; 1 tbsp Pickle Masala (Mango Achaar masala). CHOKHA: 2 large Brinjals (Eggplant); 4 Tomatoes; 2 Boiled Potatoes; Garlic, Chilies, Salt, and Raw Mustard Oil. DIP: 1 cup Melted Ghee."
  },
  {
    name: "Sattu Paratha",
    ingredients: "DOUGH: 2 cups Whole Wheat Flour; 1 tbsp Oil; Salt; Water. FILLING: 1.5 cups Sattu; 1 medium Onion (finely chopped); 1 tsp Ginger-Garlic (minced); 1/2 tsp Ajwain (Carom seeds); 1/2 tsp Kalonji (Nigella seeds); 2 Green Chilies (minced); 1 tbsp Mustard Oil (Raw); 1 tsp Lemon juice or Amchur powder; Salt to taste; Water (sprinkle to moisten filling); Ghee/Oil for frying."
  },
  {
    name: "Champaran Meat",
    ingredients: "1 kg Mutton (curry cut with bones and fat); 4-5 whole Garlic Bulbs (washed, root removed, skin intact); 500g Onions (thinly sliced); 1 cup Mustard Oil (Raw or lightly smoked); 2 tbsp Ginger-Garlic Paste; 2 tbsp Kashmiri Red Chili Powder; 1 tbsp Turmeric Powder; 2 tbsp Coriander Powder; 1 tbsp Cumin Powder; Whole Spices (4 Bay leaves, 4 Dry Red Chilies, 6 Cloves, 6 Cardamoms, 2 Cinnamon sticks, 10 Black Peppercorns); Salt to taste; Wheat dough (for sealing pot)."
  },
  {
    name: "Thekua",
    ingredients: "2 cups Whole Wheat Flour (Atta); 1/2 cup Semolina (Suji) - optional for crunch; 1 cup Jaggery (Gur) or Sugar dissolved in 1/2 cup warm water; 1/2 cup Desiccated Coconut (grated); 1 tsp Cardamom Powder; 1 tsp Fennel Seeds (Saunf); 3 tbsp Ghee (for Moyan/binding); Ghee or Oil for deep frying."
  },
  {
    name: "Chana Ghugni",
    ingredients: "1 cup Black Chickpeas (Kala Chana) - soaked overnight; 2 Onions (chopped); 1 Tomato (chopped); 1 tbsp Ginger-Garlic Paste; 2 Green Chilies; 1 tsp Cumin Seeds; 1 Bay leaf; 1/2 tsp Turmeric Powder; 1 tsp Coriander Powder; 1 tsp Meat Masala (or Garam Masala); 1 tsp Red Chili Powder; Salt to taste; 2 tbsp Mustard Oil; Coriander leaves."
  },
  {
    name: "Chila",
    ingredients: "1.5 cups Rice Flour; 1/4 cup Urad Dal Paste (soaked and ground) - optional (makes it soft); 2 cups Water (adjust for batter consistency); 2 Green Chilies (finely chopped); 1/2 cup Coriander Leaves (chopped); 1 tsp Cumin Seeds (Jeera); Salt to taste; 1 pinch Turmeric Powder; Oil for cooking."
  },
  {
    name: "Fara",
    ingredients: "DOUGH: 2 cups Rice Flour; 1 cup Cooked Rice (mashed); 1.5 cups Hot Water; Salt. TEMPERING: 2 tbsp Oil; 1 tsp Mustard Seeds; 2 tsp White Sesame Seeds (Til); 2-3 Dried Red Chilies; 8-10 Curry Leaves; Fresh Coriander."
  },
  {
    name: "Dubki Kadhi",
    ingredients: "DUMPLINGS (Dubki): 1 cup Urad Dal (soaked 4 hours and ground to thick paste); 1 Green Chili; 1/2 inch Ginger; Salt. KADHI BASE: 1 cup Sour Curd/Yogurt; 2 tbsp Gram Flour (Besan); 1/2 tsp Turmeric Powder; 3 cups Water. TEMPERING: 1 tbsp Oil; 1/2 tsp Mustard Seeds; 1/2 tsp Cumin Seeds; 2 Dry Red Chilies; Curry Leaves; 1 pinch Asafoetida (Hing)."
  },
  {
    name: "Bafauri",
    ingredients: "1 cup Chana Dal (soaked 3-4 hours and coarsely ground); 1 medium Onion (finely chopped); 2 Green Chilies (minced); 1 tsp Ginger-Garlic Paste; 1/2 tsp Turmeric Powder; 1/2 tsp Red Chili Powder; 1 tsp Coriander Seeds (crushed); 1/2 tsp Ajwain; Salt to taste; 1 tbsp Coriander leaves; Baking Soda (pinch - optional)."
  },
  {
    name: "Muthia",
    ingredients: "1 cup Cooked Rice (leftover is fine); 1 cup Rice Flour; 2 tbsp Besan (Gram Flour); 1 tsp Ginger-Green Chili Paste; 1/2 tsp Turmeric Powder; 1 tsp Sesame Seeds; 1/2 cup Fenugreek Leaves (Methi) or Coriander; Salt; 1 tbsp Oil (for dough). TEMPERING: 1 tbsp Oil; 1 tsp Mustard Seeds; 1 tsp Sesame Seeds; Curry leaves."
  }
];

async function updateRecipes() {
  console.log("Starting bulk update of ingredients (Batch 2 - Fixed Names)...");
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
