import { ENV } from "../config/env.js";

/**
 * Helper to robustly parse JSON from AI response, stripping markdown backticks if present.
 */
const parseLLMJSON = (content) => {
  try {
    // 1. Try direct parse
    return JSON.parse(content);
  } catch (e) {
    try {
      // 2. Try stripping markdown backticks
      const match = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      if (match && match[1]) {
        return JSON.parse(match[1].trim());
      }
      // 3. Try finding the first '{' and last '}'
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(content.substring(firstBrace, lastBrace + 1));
      }
      throw e;
    } catch (innerError) {
      console.error("Failed to parse LLM JSON. Raw content:", content);
      throw innerError;
    }
  }
};

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
    
    const content = parseLLMJSON(data.choices[0].message.content);
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
              
              Return a valid JSON object matching this structure. Ensure all fields are present.
            `
          },
          { role: "user", content: `Create a recipe for: ${title}. ${context}` }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(`GPT Error: ${data.error.message}`);

    const recipe = parseLLMJSON(data.choices[0].message.content);
    
    // Ensure critical fields exist to prevent frontend/DB crashes
    recipe.title = recipe.recipeName || recipe.title || title; 
    recipe.ingredient = recipe.ingredient || recipe.ingredients || [];
    recipe.steps = recipe.steps || recipe.instructions || [];
    
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
        model: "openai/dall-e-3",
        messages: [
          {
            role: "user",
            content: imagePrompt
          }
        ],
        // Required for image generation on some providers via OpenRouter
        modalities: ["image"] 
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(`Image Gen Error: ${data.error.message}`);

    // DALL-E 3 on OpenRouter handles response in message.content as URL usually,
    // but some providers put it in images array.
    let imageUrl = null;
    if (data.choices && data.choices[0].message) {
      const msg = data.choices[0].message;
      imageUrl = (msg.images && msg.images[0]) || msg.content;
    }

    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
        // Fallback to extraction if content contains extra text
        const match = (data.choices?.[0]?.message?.content || "").match(/https?:\/\/[^\s"'<>]+/);
        imageUrl = match ? match[0] : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop";
    }
    
    return { 
      success: true, 
      imageUrl: imageUrl
    };
  } catch (error) {
    console.error("Image Generation Error:", error);
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
