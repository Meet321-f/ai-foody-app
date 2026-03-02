import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../constants/colors";
import SafeScreen from "../components/SafeScreen";

const { width, height } = Dimensions.get("window");

const ONBOARDING_DATA = [
  {
    id: "1",
    title: "Explore\nFull Recipes",
    description:
      "Discover thousands of verified recipes and global cuisines at your fingertips.",
    icon: "🍲",
  },
  {
    id: "2",
    title: "AI Recipe\nInventor",
    description:
      "Just tell us what you're craving and our AI will invent a unique recipe just for you.",
    icon: "🧠",
  },
  {
    id: "3",
    title: "Smart\nShopping List",
    description:
      "Easily add ingredients from any recipe directly to your integrated shopping list.",
    icon: "🛒",
  },
  {
    id: "4",
    title: "Personal\nFavorites",
    description:
      "Save your most loved recipes to your private collection for instant offline access.",
    icon: "❤️",
  },
];

const WelcomeScreen = () => {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const handleSkip = async () => {
    await finishOnboarding();
  };

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("HAS_SEEN_ONBOARDING", "true");
      router.push("/(auth)/sign-up");
    } catch (e) {
      router.push("/(auth)/sign-up");
    }
  };

  const renderItem = ({ item }: { item: (typeof ONBOARDING_DATA)[0] }) => (
    <View style={styles.slide}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.mainEmoji}>{item.icon}</Text>
        <Animated.View
          style={[styles.glowCircle, { transform: [{ scale: 1.2 }] }]}
        />
      </View>

      <View style={styles.contentWrap}>
        <View style={styles.goldIndicator} />
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeScreen>
      <View style={styles.container}>
        <LinearGradient
          colors={["rgba(212,175,55,0.15)", "#000000"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Skip Button Top Right */}
        <TouchableOpacity style={styles.skipContainer} onPress={handleSkip}>
          <Text style={styles.skipText}>
            Skip {">"}
            {">"}
          </Text>
        </TouchableOpacity>

        <FlatList
          ref={flatListRef}
          data={ONBOARDING_DATA}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(item) => item.id}
        />

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {ONBOARDING_DATA.map((_, index) => {
              const dotWidth = scrollX.interpolate({
                inputRange: [
                  (index - 1) * width,
                  index * width,
                  (index + 1) * width,
                ],
                outputRange: [10, 25, 10],
                extrapolate: "clamp",
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    { width: dotWidth },
                    currentIndex === index && styles.activeDot,
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.navButtonsContainer}>
            {/* Back Button Bottom Left */}
            <TouchableOpacity
              onPress={handleBack}
              disabled={currentIndex === 0}
              style={[
                styles.smallNavButton,
                currentIndex === 0 && { opacity: 0 },
              ]}
            >
              <Text style={styles.navTextSecondary}>Back</Text>
            </TouchableOpacity>

            {/* Next Button Bottom Right */}
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.8}
              style={styles.nextButtonAction}
            >
              <LinearGradient
                colors={[COLORS.primary, "#FFD700"]}
                style={styles.buttonGradientSmall}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonTextSmall}>
                  {currentIndex === ONBOARDING_DATA.length - 1
                    ? "GET STARTED"
                    : "Next"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  slide: {
    width,
    height: height * 0.7,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  illustrationContainer: {
    width: 250,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  mainEmoji: {
    fontSize: 120,
    zIndex: 2,
    textShadowColor: "rgba(212, 175, 55, 0.4)",
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 20,
  },
  glowCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
    zIndex: 1,
  },
  contentWrap: {
    width: "100%",
    marginTop: 40,
  },
  goldIndicator: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: 20,
  },
  slideTitle: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFF",
    lineHeight: 48,
    marginBottom: 15,
  },
  slideDescription: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  pagination: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#333",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
  },
  navButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  smallNavButton: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  navTextSecondary: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 18,
    fontWeight: "600",
  },
  nextButtonAction: {
    minWidth: 120,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  buttonGradientSmall: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  buttonTextSmall: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 1,
  },
  skipContainer: {
    position: "absolute",
    top: 0,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
});

export default WelcomeScreen;
