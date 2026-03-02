import { Redirect, useRootNavigationState } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const rootNavigationState = useRootNavigationState();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const val = await AsyncStorage.getItem("HAS_SEEN_ONBOARDING");
        setHasSeenOnboarding(val === "true");
      } catch (e) {
        setHasSeenOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  // Wait for all states to be ready
  if (!isLoaded || hasSeenOnboarding === null || !rootNavigationState?.key)
    return null;

  if (hasSeenOnboarding === false) {
    return <Redirect href="/welcome" />;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/welcome" />;
}
