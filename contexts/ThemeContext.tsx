import React, { createContext, useContext, useState, useEffect } from "react";
import { THEMES } from "../constants/colors";
import { getAppSetting, setAppSetting, initDB } from "../services/db";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: typeof THEMES.purple;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  colors: THEMES.purple,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    initDB();
    const savedTheme = getAppSetting("theme_mode");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      setAppSetting("theme_mode", newMode ? "dark" : "light");
      return newMode;
    });
  };

  const colors = isDarkMode ? THEMES.gourmetGold : THEMES.purple;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
