import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import SafeScreen from "../components/SafeScreen";
import { COLORS } from "../constants/colors";
import { API_URL } from "../constants/api";
import { useUser } from "@clerk/clerk-expo";
import { Recipe } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const MyRecipesScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserRecipes = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/recipes/user/${user.id}`);
      const result = await response.json();
      if (result.success) {
        setRecipes(result.data);
      }
    } catch (error) {
      console.error("Error fetching user recipes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserRecipes();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserRecipes();
  };

  const renderRecipeItem = ({
    item,
    index,
  }: {
    item: Recipe;
    index: number;
  }) => (
    <TouchableOpacity
      key={`${item.id}-${index}`}
      style={styles.recipeCard}
      activeOpacity={0.8}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.selectionAsync();
        router.push({
          pathname: "/recipe/[id]",
          params: { id: item.id },
        });
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.recipeImage}
        contentFit="cover"
        transition={500}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0.4 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.cardContent}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.recipeMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={12} color={COLORS.primary} />
            <Text style={styles.metaText}>{item.cookTime || "20m"}</Text>
          </View>
          {item.isPublic && (
            <View style={styles.metaItem}>
              <Ionicons name="people" size={12} color={COLORS.primary} />
              <Text style={styles.metaText}>Public</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              router.back();
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.gold} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Recipes</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading && !refreshing ? (
          <LoadingSpinner message="Loading your recipes..." />
        ) : recipes.length > 0 ? (
          <FlatList
            data={recipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="journal-outline"
              size={60}
              color="rgba(255,255,255,0.2)"
            />
            <Text style={styles.emptyText}>
              You haven't created any recipes yet.
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                router.push("/create-recipe");
              }}
            >
              <Text style={styles.createButtonText}>
                Create Your First Recipe
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Floating Action Button for Adding Recipe */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.selectionAsync();
            router.push("/create-recipe");
          }}
        >
          <LinearGradient
            colors={[COLORS.gold, "#F59E0B"]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={32} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.gold,
    letterSpacing: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
  },
  recipeCard: {
    width: "48%",
    aspectRatio: 0.8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  recipeTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  recipeMeta: {
    flexDirection: "row",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
});

export default MyRecipesScreen;
