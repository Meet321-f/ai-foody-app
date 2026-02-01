// Automatically use local server in development, production URL in production
export const API_URL = __DEV__
  ? "http://192.168.31.215:5001/api" // Your PC's local IP (update if needed)
  : "https://food-lsat.onrender.com/api"; // Production URL
