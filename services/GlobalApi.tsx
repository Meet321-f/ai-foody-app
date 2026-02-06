import axios from "axios";
import { API_URL } from "../constants/api";

const getBackendUrl = () => {
  return API_URL;
};

const AiModel = async (prompt: string, token: string) => {
  const response = await axios.post(
    `${getBackendUrl()}/ai/proxy-chat`,
    {
      prompt,
      model: "openai/gpt-oss-20b:free",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};

const GenerateAiImage = async (input: string, token: string) =>
  await axios.post(
    `${getBackendUrl()}/ai/proxy-image`,
    {
      prompt: input,
      model: "sdxl",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

const createRecipe = async (data: any) => {
  try {
    console.log("Calling createRecipe with URL:", `${getBackendUrl()}/recipes`);
    console.log("Data:", JSON.stringify(data, null, 2));
    const response = await axios.post(`${getBackendUrl()}/recipes`, data);
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
