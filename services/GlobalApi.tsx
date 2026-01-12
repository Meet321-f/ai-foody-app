import axios from "axios";

const AiModel = async (prompt: string) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-oss-20b:free",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

const BASE_URL = "https://aigurulab.tech";
const GenerateAiImage = async (input: string) =>
  await axios.post(
    BASE_URL + "/api/generate-image",
    {
      width: 1024,
      height: 1024,
      input: input,
      model: "sdxl", //'flux'
      aspectRatio: "1:1",
    },
    {
      headers: {
        "x-api-key": process.env.EXPO_PUBLIC_AIGURULAB_API_KEY, // Your API Key
        "Content-Type": "application/json", // Content Type
      },
    }
  );

const BACKEND_API_URL = "http://10.0.2.2:5001/api";

const createRecipe = async (data: any) => {
  try {
    console.log("Calling createRecipe with URL:", `${BACKEND_API_URL}/recipes`);
    console.log("Data:", JSON.stringify(data, null, 2));
    const response = await axios.post(`${BACKEND_API_URL}/recipes`, data);
    console.log("createRecipe response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating recipe:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
  }
};

export default {
  AiModel,
  GenerateAiImage,
  createRecipe,
};
