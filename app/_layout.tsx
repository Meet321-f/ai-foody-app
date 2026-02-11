import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import * as SplashScreen from "expo-splash-screen";
import { tokenCache } from "../services/tokenCache";
import { ThemeProvider } from "../contexts/ThemeContext";
import CustomSplashScreen from "../components/CustomSplashScreen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env file");
}

function RootLayoutNav() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts or other assets here
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  const onSplashAnimationComplete = () => {
    setShowCustomSplash(false);
  };

  // While app is initializing, we can show nothing or the custom splash
  // But we MUST return a valid navigator for Expo Router to work correctly
  return (
    <>
      {showCustomSplash && (
        <CustomSplashScreen onAnimationComplete={onSplashAnimationComplete} />
      )}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile"
          options={{ presentation: "card", headerShown: false }}
        />
        <Stack.Screen
          name="setting"
          options={{ presentation: "card", headerShown: false }}
        />
        <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="setup-profile" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  // If the key is missing, Clerk will throw a better error than useAuth failing later
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY || ""}
      tokenCache={tokenCache}
    >
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </ClerkProvider>
  );
}
