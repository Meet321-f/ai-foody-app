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
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are Chef Foody's brainstorming assistant. Given ingredients or a craving, suggest 3 creative recipe titles. Return ONLY a JSON object with a 'suggestions' array of strings."
          },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    console.log(`[AI Service] Raw Response from OpenRouter:`, JSON.stringify(data).substring(0, 200));
    
    if (data.error) throw new Error(`Mistral Error: ${data.error.message}`);
    
    const content = parseLLMJSON(data.choices[0].message.content);
    let suggestionsArr = [];
    
    if (content.suggestions && Array.isArray(content.suggestions)) {
      suggestionsArr = content.suggestions;
    } else if (Array.isArray(content)) {
      suggestionsArr = content;
    } else if (typeof content === 'object' && content !== null) {
      // Try to find any array inside the object
      const possibleArray = Object.values(content).find(val => Array.isArray(val));
      if (possibleArray) suggestionsArr = possibleArray;
    }

    // Ensure they are all strings and trimmed
    suggestionsArr = suggestionsArr
      .filter(s => s && typeof s === 'string')
      .map(s => s.trim())
      .slice(0, 3);

    console.log(`[AI Service] Final Suggestions:`, suggestionsArr);
    return { success: true, suggestions: suggestionsArr };
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
    
    // Robustly handle ingredients
    let rawIngredients = recipe.ingredient || recipe.ingredients || [];
    if (typeof rawIngredients === 'string') {
      rawIngredients = rawIngredients.split(/[,\n]/).map(i => i.trim()).filter(i => i);
    }
    recipe.ingredient = Array.isArray(rawIngredients) ? rawIngredients : [];

    // Robustly handle instructions
    let rawSteps = recipe.steps || recipe.instructions || [];
    if (typeof rawSteps === 'string') {
      rawSteps = rawSteps.split(/\d+\.\s|\n/).map(s => s.trim()).filter(s => s);
    }
    recipe.steps = Array.isArray(rawSteps) ? rawSteps : [];
    
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
        imageUrl = match ? match[0] : null;
    }
    
    return { 
      success: true, 
      imageUrl: imageUrl
    };
  } catch (error) {
    console.error("Image Generation Error:", error);
    return { 
      success: false, 
      imageUrl: null    };
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
