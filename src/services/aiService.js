import { ENV } from "../config/env.js";

/**
 * Step 1: Get recipe suggestions using Mistral Small
 */
export const getSuggestions = async (prompt) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ENV.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://foody.app",
        "X-Title": "Foody AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-small-24b-instruct-2501",
        messages: [
          {
            role: "system",
            content: "You are Chef Foody's brainstorming assistant. Given ingredients or a craving, suggest 3 creative recipe titles. Return ONLY a JSON object with a 'suggestions' array of strings."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(`Mistral Error: ${data.error.message}`);
    
    const content = JSON.parse(data.choices[0].message.content);
    return { success: true, suggestions: content.suggestions };
  } catch (error) {
    console.error("Suggestions Error:", error);
    throw error;
  }
};

/**
 * Step 2: Generate full recipe details using GPT-4o-mini
 */
export const generateFullRecipeData = async (title, context = "") => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ENV.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://foody.app",
        "X-Title": "Foody AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
              GENERATE_COMPLETE_RECIPE: 
              - As per recipe Name and Description, Give me all list of ingredients as ingredient,
              - emoji icons for each ingredient as icon, quantity as quantity, along with detail step by step recipe as steps,
              - Total calories as calories (only number), Minutes to cook as cookTime and serving number as serveTo,
              - realistic image Text prompt as per recipe as imagePrompt.
              
              Return a valid JSON object matching this structure.
            `
          },
          { role: "user", content: `Create a recipe for: ${title}. ${context}` }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(`GPT Error: ${data.error.message}`);

    const recipe = JSON.parse(data.choices[0].message.content);
    // Normalize data to ensure it has title if missing from LLM (sometimes LLM omits it if not explicitly asked in JSON structure, though usually wrapper handles it)
    recipe.title = title; 
    return { success: true, data: recipe };
  } catch (error) {
    console.error("Full Recipe Error:", error);
    throw error;
  }
};

/**
 * Step 3: Generate a recipe image using DALL-E 3 (via OpenRouter/OpenAI)
 */
export const generateRecipeImage = async (imagePrompt) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ENV.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://foody.app",
        "X-Title": "Foody AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/dall-e-3", // Using DALL-E 3 as requested
        messages: [
          {
            role: "user",
            content: imagePrompt
          }
        ]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(`Image Gen Error: ${data.error.message}`);

    // DALL-E 3 on OpenRouter typically returns the URL in the content or as an output. 
    // Standard OpenRouter chat completion for image models usually embeds the URL in the content.
    // However, for native DALL-E API it might be different, but OpenRouter normalizes it.
    
    return { 
      success: true, 
      imageUrl: data.choices[0].message.content
    };
  } catch (error) {
    console.error("Image Generation Error:", error);
    // Return placeholder on failure
    return { 
      success: false, 
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop" 
    };
  }
};

// Keep existing generateRecipe for backward compatibility if needed, but refactored to use generateFullRecipeData
export const generateRecipe = async (prompt) => {
  const suggestions = await getSuggestions(prompt);
  if (suggestions.success && suggestions.suggestions.length > 0) {
    return await generateFullRecipeData(suggestions.suggestions[0], prompt);
  }
  throw new Error("Failed to generate recipe suggestions.");
};
