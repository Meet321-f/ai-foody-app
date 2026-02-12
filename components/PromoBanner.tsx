import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Recipe } from "../types";
import { MealAPI } from "../services/mealAPI";
import { COLORS } from "../constants/colors";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 20; // Align with 20px side padding

const PromoBanner = () => {
  const router = useRouter();
  const [promoRecipes, setPromoRecipes] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 1. Fetch random recipes for the banner
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const meals = await MealAPI.getRandomMeals(5);
        const transformed = meals
          .map((m: any) => MealAPI.transformMealData(m))
          .filter((m: any) => m !== null) as Recipe[];
        setPromoRecipes(transformed);
      } catch (e) {
        console.error("Banner fetch error:", e);
      }
    };
    fetchPromos();
  }, []);

  // 2. Setup 5-second automatic rotation
  useEffect(() => {
    if (promoRecipes.length === 0) return;

    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Change index
        setCurrentIndex((prev) => (prev + 1) % promoRecipes.length);

        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 5500); // Rotating every 5.5 seconds

    return () => clearInterval(interval);
  }, [promoRecipes, fadeAnim]);

  if (promoRecipes.length === 0) return null;

  const currentRecipe = promoRecipes[currentIndex];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={() => router.push(`/recipe/${currentRecipe.id}`)}
    >
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        <Image
          source={{ uri: currentRecipe.image }}
          style={styles.image}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.8)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Luxury Glass Overlay */}
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Limited Offer</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {currentRecipe.title}
          </Text>
          <Text style={styles.subtitle}>
            Chef's Special Selection • {currentRecipe.cookTime || "15m"}
          </Text>

          <View style={styles.footer}>
            <View style={styles.actionBtn}>
              <Text style={styles.actionText}>Discover Now</Text>
              <Ionicons name="arrow-forward" size={14} color="#000" />
            </View>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {promoRecipes.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === currentIndex ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 5,
    marginTop: 10,
    marginBottom: 20,
    height: 190,
    borderRadius: 32,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000000ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
  },
  inner: {
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  badgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  actionText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "800",
  },
  pagination: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});

export default PromoBanner;
