const coffeeTheme = {
  primary: "#8B593E",
  background: "#FFF8F3",
  text: "#4A3428",
  border: "#E5D3B7",
  white: "#FFFFFF",
  textLight: "#9A8478",
  card: "#FFFFFF",
  shadow: "#000000",
};

const forestTheme = {
  primary: "#2E7D32",
  background: "#E8F5E9",
  text: "#1B5E20",
  border: "#C8E6C9",
  white: "#FFFFFF",
  textLight: "#66BB6A",
  card: "#FFFFFF",
  shadow: "#000000",
};

const purpleTheme = {
  primary: "#6A1B9A",
  background: "#F3E5F5",
  text: "#4A148C",
  border: "#D1C4E9",
  white: "#FFFFFF",
  textLight: "#BA68C8",
  card: "#FFFFFF",
  shadow: "#000000",
};

const oceanTheme = {
  primary: "#0277BD",
  background: "#E1F5FE",
  text: "#01579B",
  border: "#B3E5FC",
  white: "#FFFFFF",
  textLight: "#4FC3F7",
  card: "#FFFFFF",
  shadow: "#000000",
};

const sunsetTheme = {
  primary: "#FF7E67",
  background: "#FFF3F0",
  text: "#2C1810",
  border: "#FFD5CC",
  white: "#FFFFFF",
  textLight: "#FFA494",
  card: "#FFFFFF",
  shadow: "#000000",
};

const mintTheme = {
  primary: "#00B5B5",
  background: "#E8F6F6",
  text: "#006666",
  border: "#B2E8E8",
  white: "#FFFFFF",
  textLight: "#66D9D9",
  card: "#FFFFFF",
  shadow: "#000000",
};

const midnightTheme = {
  primary: "#2C3E50",
  background: "#F4F6F7",
  text: "#1A2530",
  border: "#D5D8DC",
  white: "#FFFFFF",
  textLight: "#7F8C8D",
  card: "#FFFFFF",
  shadow: "#000000",
};

const roseGoldTheme = {
  primary: "#E0BFB8",
  background: "#FDF6F5",
  text: "#4A3B38",
  border: "#F2D9D5",
  white: "#FFFFFF",
  textLight: "#C9A9A6",
  card: "#FFFFFF",
  shadow: "#000000",
};

const glassSapphireTheme = {
  primary: "#0082FF",
  background: "#000000",
  text: "#FFFFFF",
  border: "rgba(255, 255, 255, 0.1)",
  white: "#FFFFFF",
  textLight: "#94A3B8",
  card: "rgba(255, 255, 255, 0.05)", // Glass background
  shadow: "rgba(0, 0, 0, 0.5)",
  sapphire: "#0082FF",
  electricBlue: "#00F0FF",
};

const darkTheme = {
  primary: "#9C27B0", // Lighter purple for dark mode
  background: "#121212",
  text: "#E0E0E0",
  border: "#333333",
  white: "#1E1E1E", // Card background
  textLight: "#B0B0B0",
  card: "#1E1E1E",
  shadow: "#000000",
};

const gourmetGoldTheme = {
  primary: "#D4AF37", // Metallic Gold
  background: "#000000",
  text: "#FFFFFF",
  border: "rgba(255, 255, 255, 0.1)",
  white: "#FFFFFF",
  textLight: "#94A3B8",
  card: "rgba(255, 255, 255, 0.05)", // Glass background
  shadow: "rgba(0, 0, 0, 0.5)",
  gold: "#D4AF37",
  amber: "#F59E0B",
  luxury: "#FFD700",
};

export const THEMES = {
  coffee: coffeeTheme,
  forest: forestTheme,
  purple: purpleTheme,
  ocean: oceanTheme,
  sunset: sunsetTheme,
  mint: mintTheme,
  midnight: midnightTheme,
  roseGold: roseGoldTheme,
  dark: darkTheme,
  glassSapphire: glassSapphireTheme,
  gourmetGold: gourmetGoldTheme,
};

// 👇 change this to switch theme
export const COLORS = THEMES.gourmetGold;
