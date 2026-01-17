import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextStyle,
  RefreshControl,
} from "react-native";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../components/RecipeCard";
import NoFavoritesFound from "../../components/NoFavoritesFound";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTheme } from "../../contexts/ThemeContext";
import { Recipe } from "../../types";
import SafeScreen from "../../components/SafeScreen";
import { MealAPI } from "../../services/mealAPI";
import { UserStorageService } from "../../services/userStorage";
import { COLORS } from "../../constants/colors";

const FavoritesScreen = () => {
  const { user } = useUser();
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<"favorites" | "ai">("favorites");
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) return;
      if (!isRefresh) setLoading(true);

      try {
        // 1. Load Favorites (Local Storage Priority)
        const localFavorites = await UserStorageService.getFavorites(user.id);
        setFavoriteRecipes(localFavorites);

        // Optional: Sync with backend in background if needed (skipping for now to rely on local persistence as requested)
        /*
        const favResponse = await fetch(`${API_URL}/favorites/${user.id}`);
        if (favResponse.ok) {
           // logic to merge or update local storage with backend
        }
        */

        // 2. Load AI History (Local Storage Priority)
        const localAiHistory = await UserStorageService.getAiHistory(user.id);
        setAiRecipes(localAiHistory);
      } catch (error) {
        console.log("Error loading profile data", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.5,
    },
    logoutButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
    },
    tabsContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 12,
    },
    tabButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.card,
    },
    activeTabButton: {
      backgroundColor: "#D4AF37", // Gold
    },
    tabText: {
      fontWeight: "600",
      color: colors.text,
    },
    activeTabText: {
      color: "#000",
    },
    recipesSection: {
      paddingHorizontal: 16,
      paddingBottom: 100,
    },
    row: {
      justifyContent: "space-between",
    },
    grid: {
      gap: 16,
    },
  });

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  const currentData = activeTab === "favorites" ? favoriteRecipes : aiRecipes;

  return (
    <SafeScreen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.gold }]}>Favorite</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "favorites" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("favorites")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "favorites" && styles.activeTabText,
            ]}
          >
            Favorites ({favoriteRecipes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "ai" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("ai")}
        >
          <Text
            style={[styles.tabText, activeTab === "ai" && styles.activeTabText]}
          >
            AI Recipes ({aiRecipes.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentData}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.recipesSection}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          activeTab === "favorites" ? (
            <NoFavoritesFound />
          ) : (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons
                name="sparkles-outline"
                size={60}
                color={colors.text + "40"}
              />
              <Text
                style={{
                  color: colors.text,
                  marginTop: 16,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                No AI Recipes yet
              </Text>
              <Text
                style={{
                  color: colors.text + "80",
                  marginTop: 8,
                  textAlign: "center",
                  paddingHorizontal: 40,
                }}
              >
                Try generating a recipe with our AI Chef!
              </Text>
            </View>
          )
        }
      />
    </SafeScreen>
  );
};

export default FavoritesScreen;
