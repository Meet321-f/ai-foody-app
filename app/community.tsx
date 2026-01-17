import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { COLORS } from "../constants/colors";
import { API_URL } from "../constants/api";
import SafeScreen from "../components/SafeScreen";
import RecipeCard from "../components/RecipeCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Recipe } from "../types";
import { Ionicons } from "@expo/vector-icons";

const CommunityScreen = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommunityRecipes = async () => {
    try {
      const response = await fetch(`${API_URL}/community/recipes`);
      const result = await response.json();
      if (result.success) {
        setRecipes(result.data);
      }
    } catch (error) {
      console.error("Error fetching community recipes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommunityRecipes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommunityRecipes();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Loading community recipes..." />;
  }

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Community Feed 🥣</Text>
          <Text style={styles.headerSub}>
            Recipes shared by foodies like you
          </Text>
        </View>

        {recipes.length > 0 ? (
          <FlatList
            data={recipes}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
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
              name="people-outline"
              size={80}
              color="rgba(255,255,255,0.1)"
            />
            <Text style={styles.emptyText}>No recipes shared yet.</Text>
            <Text style={styles.emptySub}>Be the first to share a recipe!</Text>
          </View>
        )}
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: COLORS.gold,
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  row: {
    justifyContent: "space-between",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  emptySub: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    marginTop: 8,
  },
});

export default CommunityScreen;
