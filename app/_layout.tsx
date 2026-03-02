import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { ClerkProvider, useUser, useAuth } from "@clerk/clerk-expo";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tokenCache } from "../services/tokenCache";
import { ThemeProvider } from "../contexts/ThemeContext";
import CustomSplashScreen from "../components/CustomSplashScreen";
import { API_URL } from "../constants/api";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env file");
}

/** Silently saves/updates the user's name and email to our DB on every login */
function UserProfileSync() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const syncProfile = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const firstName = user.firstName?.trim() || "";
        const lastName = user.lastName?.trim() || "";
        const fullName =
          user.fullName?.trim() ||
          [firstName, lastName].filter(Boolean).join(" ") ||
          "Foody User";
        const email = user.emailAddresses?.[0]?.emailAddress || "";
        const profileImage = user.imageUrl || null;

        // Try to GET the existing profile first
        const getRes = await fetch(`${API_URL}/profiles/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (getRes.status === 404) {
          // Profile doesn't exist — create it
          await fetch(`${API_URL}/profiles`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: fullName, email, profileImage }),
          });
          console.log("[ProfileSync] Created profile for:", fullName);
        } else if (getRes.ok) {
          const existingProfile = await getRes.json();
          // Only update if name is missing or is still the generic placeholder
          if (!existingProfile.name || existingProfile.name === "Foody User") {
            await fetch(`${API_URL}/profiles/${user.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ name: fullName, email, profileImage }),
            });
            console.log("[ProfileSync] Updated profile for:", fullName);
          }
        }
      } catch (err) {
        // Non-critical — always fail silently so app never breaks
        console.warn("[ProfileSync] Silent failure:", err);
      }
    };

    syncProfile();
  }, [user, isLoaded, getToken]);

  return null;
}

function RootLayoutNav() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    async function prepare() {
      try {
        const seen = await AsyncStorage.getItem("HAS_SEEN_ONBOARDING");
        setHasSeenOnboarding(seen === "true");
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

  return (
    <>
      {showCustomSplash && (
        <CustomSplashScreen onAnimationComplete={onSplashAnimationComplete} />
      )}
      {/* Silently syncs the Clerk user's name & email to our profilesTable */}
      <UserProfileSync />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
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
