import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";
import { eq } from "drizzle-orm";

const recipesToUpdate = [
  {
    name: "Hyderabadi Biryani",
    ingredients: "1 kg Mutton or Chicken (cut into pieces); 1 kg Long grain Basmati Rice; 5 large Onions (sliced thin and fried golden brown/Birista); 1 cup Thick Yogurt (Curd); 2 tbsp Ginger-Garlic Paste; 1 bunch Fresh Mint Leaves; 1 bunch Fresh Coriander Leaves; 4-5 Green Chilies (slit); Whole Spices (4 Bay leaves; 1 tsp Shahi Jeera; 6 Green Cardamoms; 6 Cloves; 2 inch Cinnamon stick); 1 tsp Turmeric Powder; 2 tsp Red Chili Powder; 1 tsp Garam Masala Powder; Saffron strands soaked in 1/2 cup warm milk; 1/2 cup Desi Ghee; 1/2 cup Oil; Salt to taste; Lemon juice; Wheat dough (for sealing the pot)."
  },
  {
    name: "Gongura Mutton",
    ingredients: "500g Mutton/Lamb (curry cut); 4 large bunches Gongura Leaves (Sorrel leaves) - plucked and washed; 2 large Onions (finely chopped); 4-5 Green Chilies (slit); 1 tbsp Ginger-Garlic Paste; 1/2 tsp Turmeric Powder; 1.5 tsp Red Chili Powder; 1 tsp Coriander Powder; Salt to taste; 3 tbsp Oil; For Tempering: 1 tsp Mustard Seeds; 1/2 tsp Cumin Seeds; 3-4 Dry Red Chilies; 5-6 Garlic cloves (crushed); Curry leaves."
  },
  {
    name: "Pesarattu (Green Moong Dosa)",
    ingredients: "1 cup Whole Green Moong Dal (soaked for 4-6 hours); 2 tbsp Raw Rice (optional, for crispiness); 1 inch Ginger piece; 2-3 Green Chilies; 1 tsp Cumin Seeds (Jeera); Salt to taste; Water (as required for batter); Oil or Ghee (for roasting); For Topping: 1/2 cup Finely chopped Onions; 1 tbsp Finely chopped Ginger; Fresh Coriander leaves."
  },
  {
    name: "Gutti Vankaya Kura (Stuffed Brinjal)",
    ingredients: "10-12 Small Purple Brinjals (tender ones); 2 Onions (finely chopped); Tamarind pulp (lemon sized ball soaked); For Masala Paste: 3 tbsp Peanuts (roasted); 2 tbsp Sesame Seeds (roasted); 2 tbsp Dry Coconut (grated); 1 tbsp Coriander Seeds; 1 tsp Cumin Seeds; 1 inch Cinnamon; 2 Cloves; Other Spices: 1 tbsp Ginger-Garlic Paste; 1/2 tsp Turmeric; 1 tsp Red Chili Powder; Salt; Oil (generous amount); Mustard seeds; Curry leaves."
  },
  {
    name: "Chepala Pulusu (Fish Curry)",
    ingredients: "500g Fish pieces (Rohu or Catla preferred); 1 large lemon-sized Tamarind (soaked and juice extracted); 2 large Onions (chopped); 2 Tomatoes (chopped); 4-5 Green Chilies (slit); 1 tbsp Ginger-Garlic Paste; 1/4 tsp Turmeric Powder; 2 tsp Red Chili Powder (spicy variety); 1 tsp Coriander Powder; 1/2 tsp Fenugreek Seeds (Methi); 1 tsp Mustard Seeds; 2 sprigs Curry Leaves; 4 tbsp Oil (Gingelly/Sesame oil preferred); Salt to taste; Fresh Coriander leaves for garnish."
  },
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
  }
];

async function updateRecipes() {
  console.log("Starting bulk update of ingredients...");
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
  console.log("Bulk update complete.");
  process.exit(0);
}

updateRecipes();
