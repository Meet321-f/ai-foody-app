import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";
import { COLORS } from "../constants/colors";
import { RecipeCardProps } from "../types";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

import React from "react";

function RecipeCard({ recipe }: RecipeCardProps) {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: cardWidth,
      height: 280, // Taller immersive height
      borderRadius: 30, // Extremely rounded
      marginBottom: 16,
      backgroundColor: "transparent",
      overflow: "hidden",
      position: "relative",
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
    },
    image: {
      ...StyleSheet.absoluteFillObject,
      width: "100%",
      height: "100%",
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.2)", // Base darkened layer
    },
    gradient: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "70%",
    },
    topInfo: {
      position: "absolute",
      top: 12,
      left: 12,
      right: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 10,
    },
    ratingBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    ratingText: {
      color: "#FFF",
      fontSize: 12,
      fontWeight: "700",
    },
    starText: {
      color: COLORS.primary,
      fontSize: 12,
    },
    saveButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      zIndex: 5,
    },
    categoryLabel: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      alignSelf: "flex-start",
      marginBottom: 8,
    },
    categoryText: {
      color: "#000",
      fontSize: 10,
      fontWeight: "900",
      textTransform: "uppercase",
    },
    title: {
      fontSize: 18,
      fontWeight: "900",
      color: "#FFFFFF",
      marginBottom: 8,
      lineHeight: 22,
    },
    stats: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    statItem: {
      fontSize: 11,
      color: "rgba(255,255,255,0.7)",
      fontWeight: "500",
    },
    statValue: {
      color: COLORS.primary,
      fontWeight: "700",
    },
    actionButton: {
      backgroundColor: "rgba(255,255,255,0.15)",
      paddingVertical: 10,
      borderRadius: 15,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.2)",
    },
    actionButtonText: {
      color: "#FFF",
      fontSize: 12,
      fontWeight: "700",
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
      activeOpacity={0.9}
    >
      <Image
        source={recipe.image ? { uri: recipe.image } : null}
        style={styles.image}
        contentFit="cover"
        transition={500}
        placeholderContentFit="cover"
        onError={() =>
          console.warn(`Failed to load image for: ${recipe.title}`)
        }
      />
      {!recipe.image && (
        <LinearGradient
          colors={[COLORS.primary + "40", COLORS.primary + "10"]}
          style={styles.image}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons
              name="restaurant-outline"
              size={40}
              color={COLORS.primary + "80"}
            />
          </View>
        </LinearGradient>
      )}
      <View style={styles.overlay} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)", "#000000"]}
        style={styles.gradient}
      />

      <View style={styles.topInfo}>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>4.9</Text>
        </View>
        <TouchableOpacity style={styles.saveButton}>
          <Ionicons name="heart-outline" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>

        <View style={styles.stats}>
          <Text style={styles.statItem}>
            Prep{" "}
            <Text style={styles.statValue}>{recipe.cookTime || "15m"}</Text>
          </Text>
          <Text style={styles.statItem}>
            Difficulty <Text style={styles.statValue}>Pro</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/recipe/${recipe.id}`)}
        >
          <Text style={styles.actionButtonText}>View Experience</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(RecipeCard);
