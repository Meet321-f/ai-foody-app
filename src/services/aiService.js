import { ENV } from "../config/env.js";

/**
 * Orchestrates recipe generation using OpenRouter (Direct LLM) and n8n (Enrichment).
 */
export const generateRecipe = async (prompt) => {
  try {
    // 1. Get structured JSON from OpenRouter
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
            content: "You are Chef Foody. Return a single recipe in valid JSON format. Include: title, ingredients (array), instructions (array), prepTime, calories, and difficulty."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenRouter API Error:", data.error);
      throw new Error(`AI Provider Error: ${data.error.message || "Unknown error"}`);
    }

    if (!data.choices || !data.choices[0]) {
      console.error("Unexpected OpenRouter Response:", data);
      throw new Error("AI provider returned an empty response.");
    }

    const recipe = JSON.parse(data.choices[0].message.content);

    // 2. Optional: Trigger n8n for enrichment (e.g., getting a YouTube link or premium image)
    // For now, we'll just return the LLM response.
    
    return {
      success: true,
      data: recipe
    };
  } catch (error) {
    console.error("AI Service Error:", error.message);
    throw error; // Rethrow the specific error
  }
};
