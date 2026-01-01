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
            content: "You are Chef Foody. Create a detailed recipe based on the title. Return a valid JSON object with: title, ingredients (array), instructions (array), prepTime, calories, difficulty."
          },
          { role: "user", content: `Create a recipe for: ${title}. Additional context: ${context}` }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(`GPT Error: ${data.error.message}`);

    const recipe = JSON.parse(data.choices[0].message.content);
    return { success: true, data: recipe };
  } catch (error) {
    console.error("Full Recipe Error:", error);
    throw error;
  }
};

/**
 * Step 3: Generate a recipe image using Sourceful Riverflow
 */
export const generateRecipeImage = async (title) => {
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
        model: "sourceful/riverflow-v2-fast-preview",
        messages: [
          {
            role: "user",
            content: `A professional, mouth-watering food photography shot of ${title}. High resolution, 8k, realistic, gourmet presentation.`
          }
        ]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(`Image Gen Error: ${data.error.message}`);

    // NOTE: If OpenRouter supports image output modality, it might be in choices[0].message.content or as a URL.
    // Assuming for now it returns a URL or a Base64 string if configured.
    // If it's a standard text response, we might need a specific provider.
    // For now, let's assume we get a URL if the model supports it.
    
    return { 
      success: true, 
      imageUrl: data.choices[0].message.content || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop" 
    };
  } catch (error) {
    console.error("Image Generation Error:", error);
    // Return placeholder on failure so the recipe generation isn't blocked
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
