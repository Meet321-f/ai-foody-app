import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";
import { eq } from "drizzle-orm";

const recipesToUpdate = [
  {
    name: "Goan Fish Curry",
    ingredients: "500g Kingfish or Pomfret (sliced); 1 cup Fresh Grated Coconut (Essential); 1 tbsp Coriander Seeds; 1 tsp Cumin Seeds; 6-8 Kashmiri Dry Red Chilies (for color, less heat); 1/2 tsp Turmeric Powder; 4 cloves Garlic; 1 small ball of Tamarind (or 3-4 Kokum petals); 1 medium Onion (finely sliced); 2 Green Chilies (slit); Salt to taste; Water; Coconut Oil (optional, for authentic touch)."
  },
  {
    name: "Chicken Xacuti",
    ingredients: "1 kg Chicken (curry cut); 1 cup Fresh Grated Coconut (to be roasted); 2 tbsp Poppy Seeds (Khus Khus); 1 tbsp Coriander Seeds; 1 tsp Cumin Seeds; 8-10 Dried Red Chilies; Whole Spices (4 Cloves, 1 inch Cinnamon, 1 Star Anise, 1/4 tsp Nutmeg powder, 1 Mace blade); 1 tsp Turmeric Powder; 8-10 Garlic cloves; 1 inch Ginger; 2 large Onions (chopped); 3 tbsp Oil; Salt to taste; Fresh Coriander leaves."
  },
  {
    name: "Pork Vindaloo",
    ingredients: "1 kg Pork (shoulder cut with fat layer); 1 cup Goan Vinegar (Palm Vinegar is best) OR Malt Vinegar (Do not use water for grinding); 10-12 Kashmiri Dry Red Chilies; 1 tsp Cumin Seeds; 10 Black Peppercorns; 6 Cloves; 2 inch Cinnamon Stick; 10 cloves Garlic; 2 inch Ginger; 1 tsp Turmeric Powder; 3 Onions (sliced); 1 tsp Sugar or Jaggery (to balance acid); Salt; 4 tbsp Oil."
  },
  {
    name: "Bebinca",
    ingredients: "250g All-Purpose Flour (Maida); 200ml Thick Coconut Milk (First extract); 10 Egg Yolks (Yellows only); 200g Sugar; 1/2 tsp Nutmeg Powder (Jaiphal); 1 cup Ghee (Clarified Butter) - used generously between layers."
  },
  {
    name: "Sorpotel",
    ingredients: "1 kg Pork Meat (boneless); 250g Pork Liver (Essential for taste); 15 Kashmiri Red Chilies; 1 tsp Cumin Seeds; 10 Peppercorns; 8 Cloves; 2 inch Cinnamon; 10 cloves Garlic; 2 inch Ginger; 1 cup Vinegar; 3 large Onions (chopped); 4 Green Chilies; Oil; Salt."
  },
  {
    name: "Khaman Dhokla",
    ingredients: "1.5 cups Gram Flour (Besan); 1 tbsp Semolina (Suji/Rava); 1 tbsp Ginger-Green Chili Paste; 1/4 tsp Turmeric Powder; 1.5 tbsp Sugar; 1 tsp Salt; 1 tbsp Lemon Juice or 1/2 tsp Citric Acid; 1 packet Eno Fruit Salt (or 1/2 tsp Baking Soda); 1 tbsp Oil (for batter). TEMPERING: 2 tbsp Oil; 1 tsp Mustard Seeds; 1 tsp Sesame Seeds (Til); Pinch of Asafoetida (Hing); 4 Green Chilies (slit); 10 Curry Leaves; 1/2 cup Water + 1 tbsp Sugar (for pouring)."
  },
  {
    name: "Undhiyu",
    ingredients: "VEGETABLES: 100g Surti Papdi (Broad beans); 100g Purple Yam (Kand); 100g Sweet Potato; 100g Baby Potatoes; 100g Baby Brinjals; 1 Raw Banana. MUTHIYA: 1 cup Besan; 1 cup Methi leaves; Spices. GREEN MASALA: 1 cup Fresh Coconut (grated); 1 cup Fresh Green Garlic (Hara Lahsun) - chopped; 1 cup Fresh Coriander; 4-5 Green Chilies; 1 inch Ginger; 2 tbsp Sugar; 1 tbsp Lemon Juice; 1 tsp Ajwain; Salt; 1/2 cup Peanut Oil."
  },
  {
    name: "Thepla",
    ingredients: "2 cups Whole Wheat Flour (Atta); 1/4 cup Gram Flour (Besan); 1 cup Fresh Fenugreek Leaves (Methi) - finely chopped; 1/2 cup Yogurt (Curd); 1 tbsp Ginger-Garlic-Chili Paste; 1 tsp Sesame Seeds; 1/2 tsp Turmeric; 1 tsp Red Chili Powder; 1 tsp Coriander-Cumin Powder (Dhana-Jeera); 1 tbsp Oil (for dough); Salt; Oil for roasting."
  },
  {
    name: "Khandvi",
    ingredients: "1 cup Gram Flour (Besan); 1 cup Sour Yogurt + 2 cups Water (to make Buttermilk); 1 tsp Ginger-Green Chili Paste; 1/4 tsp Turmeric Powder; Salt. TEMPERING: 2 tbsp Oil; 1 tsp Mustard Seeds; 1 tsp Sesame Seeds; Pinch of Hing; Curry Leaves. GARNISH: 2 tbsp Fresh Coconut (grated); Coriander."
  },
  {
    name: "Handvo",
    ingredients: "1 cup Rice; 1/2 cup Chana Dal; 1/4 cup Toor Dal; 1/4 cup Urad Dal (Soaked and ground to fermented batter); 1 cup Bottle Gourd (Lauki) - grated; 1/2 cup Yogurt; 1 tbsp Ginger-Chili Paste; 1/2 tsp Turmeric; 1 tsp Sugar; 1/2 tsp Soda bi-carb; Salt; 2 tbsp Oil. TEMPERING: 1 tbsp Mustard Seeds; 1 tbsp Sesame Seeds; Curry Leaves; Dry Red Chilies."
  },
  {
    name: "Bajra Khichdi",
    ingredients: "1 cup Bajra (Pearl Millet) - broken/crushed lightly and soaked overnight; 1/2 cup Moong Dal (Yellow Split); 4-5 cups Water; 1 tbsp Ghee (for cooking); 1 tsp Salt. SERVING: 4 tbsp Desi Ghee (per serving); Homemade Curd or Lassi."
  },
  {
    name: "Haryanvi Churma",
    ingredients: "4 cups Whole Wheat Flour (Atta); Water (to knead stiff dough); 1 cup Desi Ghee (Melted) - quantity can be increased for richness; 1.5 cups Bura (Powdered Sugar) OR Jaggery (Gur) - crushed."
  },
  {
    name: "Kadhi Pakora",
    ingredients: "KADHI: 2 cups Sour Curd (or 1 liter Lassi); 1/2 cup Besan (Gram Flour); 1 tsp Turmeric; 1 tsp Red Chili Powder; Salt; 4 cups Water. PAKORA: 1 cup Besan; 1 Onion (chopped); Salt; Pinch of Soda; Oil for frying. TEMPERING: 2 tbsp Ghee/Oil; 1 tsp Methi Seeds (Fenugreek) - Essential; 1 tsp Cumin; 1 tsp Coriander Seeds (crushed); 3-4 Dry Red Chilies; Pinch of Hing."
  },
  {
    name: "Bajre Ki Roti & Lasun Chatni",
    ingredients: "ROTI: 2 cups Bajra Flour (Millet); Hot Water (for kneading); Pinch of Salt; Dry flour for dusting. CHATNI: 15-20 cloves Garlic (peeled); 5-6 Dry Red Chilies (soaked); 1 tsp Cumin Seeds; Salt; 1 tbsp Curd or Water; 1 tsp Oil (optional to sauté). SERVING: White Butter (Makhan)."
  },
  {
    name: "Bathua Raita",
    ingredients: "250g Fresh Bathua Leaves (Chenopodium) - stalks removed; 2 cups Fresh Curd (Yogurt) - whisked smooth; 1/2 tsp Roasted Cumin Powder; 1/4 tsp Black Salt (Kala Namak); 1/4 tsp Red Chili Powder; Salt to taste. (Optional Tempering: 1 tsp Ghee + Cumin seeds)."
  }
];

async function updateRecipes() {
  console.log("Starting bulk update of ingredients (Batch 3)...");
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
