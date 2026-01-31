import { getSuggestions, generateFullRecipeData } from "./src/services/aiService.js";

async function testAI() {
  try {
    console.log("--- Testing Suggestions ---");
    const suggestionsResult = await getSuggestions("chicken and broccoli");
    console.log("Suggestions Result:", JSON.stringify(suggestionsResult, null, 2));

    if (suggestionsResult.success && suggestionsResult.suggestions.length > 0) {
      console.log("\n--- Testing Full Recipe Generation ---");
      const title = suggestionsResult.suggestions[0];
      const recipeResult = await generateFullRecipeData(title);
      console.log("Full Recipe Result:", JSON.stringify(recipeResult, null, 2));
    }
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    process.exit(0);
  }
}

testAI();
