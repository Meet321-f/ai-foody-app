import { Platform } from "react-native";
// Base backend URLs by environment/platform

// Set this to true if you want to use the local backend during development
const USE_LOCAL_BACKEND = false;

// Production/Staging URL on Render
const PRODUCTION_URL = "https://ai-foody-app-4.onrender.com/api";

// Local development URLs
const LOCAL_ANDROID_URL = "http://10.0.2.2:5001/api";
const LOCAL_IOS_URL = "http://localhost:5001/api";

// For physical devices on the same LAN, set this in app.json or EXPO_PUBLIC_DEV_API_HOST env:
const DEV_LAN_HOST = process.env.EXPO_PUBLIC_DEV_API_HOST;

// For testing on physical devices/Wi-Fi without enabling cleartext traffic,
// use an HTTPS tunnel (like ngrok) and paste the URL here:
const DEV_TUNNEL_URL = "";

const getDevApiUrl = () => {
  // 1. If a tunnel URL is provided, prioritize it (best for Wi-Fi testing)
  if (DEV_TUNNEL_URL && (DEV_TUNNEL_URL as string).trim().length > 0) {
    return (DEV_TUNNEL_URL as string).endsWith("/api")
      ? (DEV_TUNNEL_URL as string)
      : `${DEV_TUNNEL_URL}/api`;
  }

  // 2. If EXPO_PUBLIC_DEV_API_HOST is set in environment/app.json
  if (DEV_LAN_HOST && (DEV_LAN_HOST as string).trim().length > 0) {
    return `http://${DEV_LAN_HOST}/api`;
  }

  // 3. Fallback to local machine or production
  return USE_LOCAL_BACKEND
    ? Platform.OS === "android"
      ? LOCAL_ANDROID_URL
      : LOCAL_IOS_URL
    : PRODUCTION_URL;
};

export const API_URL = __DEV__ ? getDevApiUrl() : PRODUCTION_URL;
