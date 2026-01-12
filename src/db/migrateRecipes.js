import { db } from "../config/db.js";
import { coustomeRecipesTable } from "./schema.js";

const rawData = `Andhra Pradesh,Hyderabadi Biryani,https://www.google.com/search?tbm=isch&q=Hyderabadi+Biryani,60 mins,"Basmati Rice; Chicken/Mutton; Yogurt; Onions; Spices; Saffron",400 kcal,"1. Marinate meat with spices and yogurt. 2. Parboil rice with whole spices. 3. Layer meat and rice in a pot. 4. Cook on 'dum' (slow heat) until tender."
Arunachal Pradesh,Thukpa,https://www.google.com/search?tbm=isch&q=Thukpa+Recipe,30 mins,"Noodles; Vegetables (Carrot; Cabbage); Chicken (optional); Ginger-Garlic; Soy Sauce",300 kcal,"1. Sauté ginger-garlic and veggies. 2. Add water/stock and boil. 3. Add noodles and sauces. 4. Cook until noodles are done. Serve hot."
Assam,Masor Tenga,https://www.google.com/search?tbm=isch&q=Masor+Tenga+Recipe,40 mins,"Rohu Fish; Tomatoes; Lemon/Elephant Apple; Mustard Oil; Turmeric",250 kcal,"1. Fry marinated fish pieces lightly. 2. Sauté tomatoes and turmeric. 3. Add water and bring to boil. 4. Add fish and souring agent (lemon). Simmer."
Bihar,Litti Chokha,https://www.google.com/search?tbm=isch&q=Litti+Chokha,60 mins,"Wheat Flour; Sattu (Gram Flour); Brinjal; Tomatoes; Garlic; Mustard Oil",350 kcal,"1. Make dough balls filled with spiced Sattu. 2. Roast Brinjal and Tomatoes for Chokha. 3. Bake Litti over coal or in oven. 4. Dip in Ghee and serve with mashed Chokha."
Chhattisgarh,Chila,https://www.google.com/search?tbm=isch&q=Chila+Recipe+Chhattisgarh,20 mins,"Rice Flour; Urad Dal; Water; Salt; Green Chilies; Coriander",150 kcal,"1. Mix rice flour and water to make batter. 2. Add spices and herbs. 3. Pour ladleful on hot tawa. 4. Cook both sides with little oil."
Goa,Goan Fish Curry,https://www.google.com/search?tbm=isch&q=Goan+Fish+Curry,35 mins,"Fish (Kingfish/Pomfret); Coconut; Kashmiri Chillies; Tamarind; Turmeric",320 kcal,"1. Grind coconut and spices to paste. 2. Sauté onions and add paste. 3. Add water and bring to boil. 4. Add fish and tamarind. Cook till done."
Gujarat,Khaman Dhokla,https://www.google.com/search?tbm=isch&q=Khaman+Dhokla,25 mins,"Besan (Gram Flour); Yogurt; Eno/Soda; Mustard Seeds; Green Chilies",160 kcal,"1. Mix besan; yogurt and water into batter. 2. Steam the batter for 15-20 mins. 3. Prepare tempering (tadka) with mustard seeds and curry leaves. 4. Pour over cut Dhokla."
Haryana,Bajra Khichdi,https://www.google.com/search?tbm=isch&q=Bajra+Khichdi,45 mins,"Bajra (Pearl Millet); Moong Dal; Ghee; Cumin; Salt",300 kcal,"1. Soak Bajra and Dal. 2. Pressure cook with water and salt. 3. Mash slightly. 4. Top with generous amount of Ghee."
Himachal Pradesh,Dham (Madra),https://www.google.com/search?tbm=isch&q=Himachali+Dham+Madra,50 mins,"Chickpeas; Yogurt; Ghee; Cloves; Cinnamon; Cardamom",400 kcal,"1. Boil chickpeas. 2. Cook spices in ghee. 3. Add yogurt and stir continuously. 4. Add chickpeas and simmer until thick."
Jharkhand,Dhuska,https://www.google.com/search?tbm=isch&q=Dhuska+Recipe,40 mins,"Rice; Chana Dal; Urad Dal; Green Chilies; Cumin",250 kcal,"1. Soak rice and dals; grind to batter. 2. Add spices and let ferment briefly. 3. Deep fry spoonfuls of batter until golden brown. 4. Serve with Ghugni."
Karnataka,Bisi Bele Bath,https://www.google.com/search?tbm=isch&q=Bisi+Bele+Bath,50 mins,"Rice; Toor Dal; Tamarind; Jaggery; Mixed Vegetables; Bisi Bele Bath Masala",350 kcal,"1. Cook rice and dal together. 2. Cook vegetables separately. 3. Mix all with tamarind water and masala. 4. Simmer and add cashew tempering."
Kerala,Appam with Stew,https://www.google.com/search?tbm=isch&q=Appam+Stew,45 mins,"Rice Flour; Coconut Milk; Yeast; Vegetables/Chicken; Spices",280 kcal,"1. Ferment rice batter with yeast. 2. Make Appams in curved pan. 3. Cook veggies/meat in coconut milk with mild spices for Stew."
Madhya Pradesh,Poha,https://www.google.com/search?tbm=isch&q=Indori+Poha,15 mins,"Flattened Rice; Onions; Mustard Seeds; Turmeric; Peanuts; Sev",200 kcal,"1. Rinse Poha. 2. Sauté mustard seeds; onions; and peanuts. 3. Add Poha and turmeric. Steam covered. 4. Garnish with Sev and lemon."
Maharashtra,Vada Pav,https://www.google.com/search?tbm=isch&q=Vada+Pav,40 mins,"Potatoes; Gram Flour; Bread Bun (Pav); Garlic Chutney; Spices",300 kcal,"1. Make spiced mashed potato balls. 2. Dip in gram flour batter and deep fry (Vada). 3. Slit Pav; apply chutney. 4. Place Vada inside."
Manipur,Kangshoi,https://www.google.com/search?tbm=isch&q=Kangshoi+Recipe,25 mins,"Seasonal Vegetables; Dry Fish (Ngari); Water; Onion; Ginger",100 kcal,"1. Boil water with dry fish. 2. Add chopped vegetables and spices. 3. Cover and cook until veggies are tender. 4. Serve as a soupy stew."
Meghalaya,Jadoh,https://www.google.com/search?tbm=isch&q=Jadoh+Recipe,45 mins,"Red Rice; Pork/Chicken; Onions; Ginger; Black Pepper",400 kcal,"1. Sauté onions and meat. 2. Add soaked rice and turmeric. 3. Add water and cook until rice absorbs flavor and meat is tender."
Mizoram,Sanpiau,https://www.google.com/search?tbm=isch&q=Sanpiau+Recipe,30 mins,"Rice Porridge; Fish Sauce; Coriander; Onion; Black Pepper",250 kcal,"1. Cook rice into a thick porridge. 2. Top with fish sauce; crisp onions; and fresh herbs. 3. Serve hot as a snack."
Nagaland,Smoked Pork Bamboo Shoot,https://www.google.com/search?tbm=isch&q=Naga+Smoked+Pork+Bamboo+Shoot,60 mins,"Smoked Pork; Fermented Bamboo Shoots; Raja Mircha (Chili); Ginger",450 kcal,"1. Wash smoked pork. 2. Cook with ginger and chili. 3. Add bamboo shoots and water. 4. Simmer until pork is soft and gravy thickens."
Odisha,Dalma,https://www.google.com/search?tbm=isch&q=Odisha+Dalma,45 mins,"Toor Dal; Pumpkin; Brinjal; Raw Banana; Panch Phoron; Coconut",220 kcal,"1. Boil dal with chopped vegetables. 2. Prepare tempering with Panch Phoron and dry chilies. 3. Mix and garnish with grated coconut."
Punjab,Sarson Da Saag,https://www.google.com/search?tbm=isch&q=Sarson+Da+Saag+Makki+Di+Roti,90 mins,"Mustard Greens; Spinach; Maize Flour; Ghee; Ginger; Garlic",450 kcal,"1. Boil and mash greens. 2. Cook with maize flour and spices (Saag). 3. Knead maize flour dough. 4. Make flatbreads (Roti) and cook with Ghee."
Rajasthan,Dal Baati Churma,https://www.google.com/search?tbm=isch&q=Dal+Baati+Churma,90 mins,"Wheat Flour; Mixed Lentils (Panchmel Dal); Ghee; Semolina",550 kcal,"1. Bake dough balls (Baati). 2. Cook spiced lentils (Dal). 3. Crush some Baati with sugar and ghee (Churma). 4. Serve all three together."
Sikkim,Momo,https://www.google.com/search?tbm=isch&q=Sikkim+Momo,40 mins,"Maize/Wheat Flour; Minced Meat/Vegetables; Onion; Garlic; Soy Sauce",200 kcal,"1. Prepare dough. 2. Mix filling with spices. 3. Shape dumplings. 4. Steam for 10-15 minutes. Serve with soup and chili sauce."
Tamil Nadu,Masala Dosa,https://www.google.com/search?tbm=isch&q=Masala+Dosa,40 mins,"Rice; Urad Dal; Potatoes; Onions; Mustard Seeds; Curry Leaves",300 kcal,"1. Ferment rice-dal batter. 2. Make potato masala filling. 3. Spread batter on hot tawa. 4. Place filling inside and fold."
Telangana,Sarva Pindi,https://www.google.com/search?tbm=isch&q=Sarva+Pindi,30 mins,"Rice Flour; Peanuts; Chana Dal; Spinach; Sesame Seeds; Chili",250 kcal,"1. Mix flour with soaked dal; nuts and spices into dough. 2. Press flat onto a pan (make holes). 3. Drizzle oil and cook until crisp."
Tripura,Mui Borok,https://www.google.com/search?tbm=isch&q=Mui+Borok+Recipe,40 mins,"Berma (Fermented Fish); Vegetables; Chili; Salt",150 kcal,"1. Boil water with fermented fish paste. 2. Add vegetables and green chilies. 3. Cook without oil until veggies are soft."
Uttar Pradesh,Galouti Kebab,https://www.google.com/search?tbm=isch&q=Galouti+Kebab,60 mins,"Minced Mutton; Raw Papaya Paste; Roasted Gram Flour; Rose Water; Spices",350 kcal,"1. Marinate mince with papaya and spices (tenderizer). 2. Shape into patties. 3. Shallow fry in Ghee until melt-in-mouth texture."
Uttarakhand,Kafuli,https://www.google.com/search?tbm=isch&q=Uttarakhand+Kafuli,35 mins,"Spinach; Fenugreek Leaves; Rice Paste; Spices; Curd",180 kcal,"1. Boil and blend leafy greens. 2. Cook with spices and rice paste (thickener). 3. Add beaten curd and simmer."
West Bengal,Macher Jhol,https://www.google.com/search?tbm=isch&q=Macher+Jhol,45 mins,"Rohu/Katla Fish; Potatoes; Mustard Oil; Kalonji; Turmeric",280 kcal,"1. Fry fish pieces. 2. Sauté kalonji and potatoes. 3. Add turmeric and water. 4. Add fish and simmer until gravy is light."
Andhra Pradesh,Gongura Mutton/Meat,https://www.google.com/search?tbm=isch&q=Gongura+Mutton+Curry,50 mins,"Mutton; Gongura Leaves (Sorrel); Onions; Green Chilies; Ginger-Garlic Paste",350 kcal,"1. Pressure cook mutton with turmeric and ginger-garlic. 2. Fry Gongura leaves until mushy paste forms. 3. Cook onion masala base. 4. Mix mutton and gongura paste; simmer until oil separates."
Andhra Pradesh,Pesarattu (Green Moong Dosa),https://www.google.com/search?tbm=isch&q=Pesarattu+Dosa,20 mins,"Whole Green Moong Dal; Rice; Ginger; Green Chilies; Cumin; Onions",200 kcal,"1. Soak moong dal and rice for 4-6 hours. 2. Grind with ginger and chilies into a batter (no fermentation needed). 3. Spread on hot tawa like dosa. 4. Top with onions and cumin; serve with ginger chutney."
Andhra Pradesh,Gutti Vankaya Kura (Stuffed Brinjal),https://www.google.com/search?tbm=isch&q=Gutti+Vankaya+Curry,40 mins,"Small Brinjals; Peanuts; Coconut; Sesame Seeds; Tamarind; Onions",280 kcal,"1. Roast peanuts; sesame; and coconut; grind to paste with spices. 2. Slit brinjals and stuff with the paste. 3. Sauté onions; add remaining paste and water. 4. Add stuffed brinjals and cook covered until soft."
Andhra Pradesh,Chepala Pulusu (Fish Curry),https://www.google.com/search?tbm=isch&q=Andhra+Chepala+Pulusu,45 mins,"Fish Pieces; Tamarind Pulp; Onions; Tomatoes; Mustard Seeds; Fenugreek",300 kcal,"1. Soak tamarind and extract thick juice. 2. Sauté onions; fenugreek seeds; and tomatoes. 3. Add tamarind pulp and boil. 4. Gently drop raw fish pieces. Simmer without stirring until fish is cooked."`;

function parseCSV(csv) {
    const lines = csv.split('\n');
    return lines.map(line => {
        if (!line.trim()) return null;
        
        const result = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        
        if (result.length < 7) return null;

        return {
            state: result[0],
            name: result[1],
            image: result[2],
            cookTime: result[3],
            ingredients: result[4],
            calories: result[5],
            steps: result[6]
        };
    }).filter(recipe => recipe !== null);
}

async function migrate() {
    console.log("Starting migration...");
    const recipes = parseCSV(rawData);
    
    try {
        // Clear existing data to avoid duplicates (optional, based on preference)
        // Or just insert all from scratch since we updated the rawData list
        await db.delete(coustomeRecipesTable).execute();
        await db.insert(coustomeRecipesTable).values(recipes).execute();
        console.log("Migration successful! Inserted " + recipes.length + " recipes.");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

migrate();
