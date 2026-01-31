import { getSuggestions, generateFullRecipeData } from "./src/services/aiService.js";
import { ENV } from "./src/config/env.js";

// Mock console.log to keep output clean or just let it log
console.log("🚀 Starting AI Flow Verification...");

async function testAiFlow() {
  try {
    // 1. Test Suggestions
    const prompt = "chicken and rice";
    console.log(`\n📋 Step 1: Testing Suggestions for '${prompt}'...`);
    const suggestionsResult = await getSuggestions(prompt);

    if (!suggestionsResult.success || !Array.isArray(suggestionsResult.suggestions) || suggestionsResult.suggestions.length === 0) {
      console.error("❌ Suggestions Failed:", suggestionsResult);
      process.exit(1);
    }

    console.log("✅ Suggestions Received:");
    suggestionsResult.suggestions.forEach((s, i) => console.log(`   ${i + 1}. ${s}`));

    // 2. Test Full Recipe Generation
    const selectedTitle = suggestionsResult.suggestions[0];
    console.log(`\n🍳 Step 2: Generating Full Recipe for '${selectedTitle}'...`);
    
    // We pass the prompt as context, similar to how the app does it
    const recipeResult = await generateFullRecipeData(selectedTitle, `User wanted: ${prompt}`);

    if (!recipeResult.success || !recipeResult.data) {
      console.error("❌ Recipe Generation Failed:", recipeResult);
      process.exit(1);
    }

    const r = recipeResult.data;
    console.log("✅ Recipe Generated Successfully!");
    console.log("   Title:", r.title);
    console.log("   Ingredients:", Array.isArray(r.ingredient) ? r.ingredient.length : "N/A");
    console.log("   Steps:", Array.isArray(r.steps) ? r.steps.length : "N/A");
    console.log("   Calories:", r.calories);
    console.log("   Cook Time:", r.cookTime);

    // Validate critical fields
    if (!r.title || !r.ingredient || !r.steps) {
        console.error("❌ Missing critical fields in recipe object!", Object.keys(r));
        process.exit(1);
    }

    console.log("\n✨ Verification Complete: The AI Service flow works as expected.");
    process.exit(0);

  } catch (error) {
    console.error("\n💥 Verification Script Error:", error);
    process.exit(1);
  }
}

testAiFlow();
