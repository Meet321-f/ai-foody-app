import Constants from "expo-constants";

// Fallback IP if detection fails or is wrong for this specific machine
export const BACKEND_IP = "192.168.31.215";

const getHostIp = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    // If it's localhost or an empty IP, it might be the emulator
    if (ip === "localhost" || ip === "127.0.0.1" || !ip) return "10.0.2.2";
    return ip;
  }
  // Android emulator fallback
  return "10.0.2.2";
};

// We can also export a secondary URL for broader reach
export const API_URL = __DEV__
  ? `http://${BACKEND_IP}:5001/api`
  : "https://ai-foody-app-3.onrender.com/api";
