import { eq } from 'drizzle-orm';
import { coustomeRecipesTable } from './schema.js';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sql = neon(process.env.DATABASE_URL);
const database = drizzle(sql);

const recipeUpdates = [
  { "name": "Dal Baati Churma", "type": "veg" },
  { "name": "Laal Maas", "type": "nonveg" },
  { "name": "Gatte Ki Sabzi", "type": "veg" },
  { "name": "Ker Sangri", "type": "veg" },
  { "name": "Ghevar", "type": "veg" },
  { "name": "Momo", "type": "nonveg" },
  { "name": "Thukpa", "type": "nonveg" },
  { "name": "Phagshapa", "type": "nonveg" },
  { "name": "Sha Phaley", "type": "nonveg" },
  { "name": "Gundruk", "type": "veg" },
  { "name": "Idli Sambar", "type": "veg" },
  { "name": "Chettinad Chicken", "type": "nonveg" },
  { "name": "Pongal", "type": "veg" },
  { "name": "Chicken 65", "type": "nonveg" },
  { "name": "Paniyaram", "type": "veg" },
  { "name": "Hyderabadi Haleem", "type": "nonveg" },
  { "name": "Sarva Pindi", "type": "veg" },
  { "name": "Pacchi Pulusu", "type": "veg" },
  { "name": "Golichina Mamsam", "type": "nonveg" },
  { "name": "Sakinalu", "type": "veg" },
  { "name": "Mui Borok", "type": "nonveg" },
  { "name": "Kosoi Bwtwi", "type": "veg" },
  { "name": "Gudok", "type": "nonveg" },
  { "name": "Wahan Mosdeng", "type": "nonveg" },
  { "name": "Mosdeng Serma", "type": "veg" },
  { "name": "Galouti Kebab", "type": "nonveg" },
  { "name": "Tehri", "type": "veg" },
  { "name": "Aloo Bedmi Puri", "type": "veg" },
  { "name": "Bharwan Bhindi", "type": "veg" },
  { "name": "Makhan Malai", "type": "veg" },
  { "name": "Kafuli", "type": "veg" },
  { "name": "Bhatt Ki Churkani", "type": "veg" },
  { "name": "Aloo Ke Gutke", "type": "veg" },
  { "name": "Bal Mithai", "type": "veg" },
  { "name": "Phanu", "type": "veg" },
  { "name": "Macher Jhol", "type": "nonveg" },
  { "name": "Kosha Mangsho", "type": "nonveg" },
  { "name": "Luchi Alur Dom", "type": "veg" },
  { "name": "Shukto", "type": "veg" },
  { "name": "Mishti Doi", "type": "veg" }
];

async function updateRecipes() {
  console.log('Starting recipe type updates...');
  
  try {
    let updatedCount = 0;
    let notFoundCount = 0;

    for (const recipe of recipeUpdates) {
      console.log(`Updating ${recipe.name} to type ${recipe.type}...`);
      
      const result = await database.update(coustomeRecipesTable)
        .set({ type: recipe.type })
        .where(eq(coustomeRecipesTable.name, recipe.name))
        .returning();
        
      if (result.length > 0) {
        updatedCount++;
        console.log(`Successfully updated ${recipe.name}`);
      } else {
        notFoundCount++;
        console.log(`Could not find recipe with name: ${recipe.name}`);
      }
    }
    
    console.log(`Update complete. Updated ${updatedCount} recipes. ${notFoundCount} recipes not found.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating recipes:', error);
    process.exit(1);
  }
}

updateRecipes();
