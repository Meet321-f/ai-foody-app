import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { MealAPI } from "../../services/mealAPI";
import { useDebounce } from "../../hooks/useDebounce";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../components/RecipeCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTheme } from "../../contexts/ThemeContext";
import { Recipe } from "../../types";
import SafeScreen from "../../components/SafeScreen";
import { COLORS } from "../../constants/colors";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const { colors, isDarkMode } = useTheme();
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    searchSection: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: "#FFF",
      fontWeight: "500",
    },
    clearButton: {
      padding: 4,
    },
    resultsSection: {
      flex: 1,
      paddingHorizontal: 20,
      marginTop: 0,
    },
    resultsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginTop: 20,
      marginBottom: 10,
    },
    resultsTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: "#FFF",
      flex: 1,
    },
    resultsCount: {
      fontSize: 14,
      color: COLORS.primary,
      fontWeight: "700",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      minHeight: 300, // Ensure it takes enough space
    },
    recipesGrid: {
      paddingBottom: 100,
    },
    row: {
      justifyContent: "space-between",
      marginBottom: 0,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 64,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: "#FFF",
      marginTop: 16,
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 14,
      color: "rgba(255,255,255,0.5)",
      textAlign: "center",
      lineHeight: 20,
    },
  });

  const performSearch = async (query: string): Promise<Recipe[]> => {
    try {
      if (!query.trim()) {
        const randomMeals = await MealAPI.getRandomMeals(6);
        const randomIndian = await MealAPI.getIndianRecipes(4);

        const transformedMeals = randomMeals
          .map((meal: any) => MealAPI.transformMealData(meal))
          .filter((meal: any) => meal !== null) as Recipe[];

        const transformedIndian = randomIndian
          .map((recipe: any) => MealAPI.transformCustomRecipe(recipe))
          .filter((recipe: any) => recipe !== null) as Recipe[];

        return [...transformedIndian, ...transformedMeals];
      }

      // Parallel search for better performance
      const [nameResults, indianResults] = await Promise.all([
        MealAPI.searchMealsByName(query),
        MealAPI.searchIndianRecipes(query),
      ]);

      let results = nameResults || [];
      const transformedIndian = (indianResults || [])
        .map((recipe: any) => MealAPI.transformCustomRecipe(recipe))
        .filter((recipe: any) => recipe !== null) as Recipe[];

      if (results.length === 0 && transformedIndian.length === 0) {
        const ingredientResults = await MealAPI.filterByIngredient(query);
        results = ingredientResults || [];
      }

      const transformedMeals = results
        .slice(0, 12)
        .map((meal: any) => MealAPI.transformMealData(meal))
        .filter((meal: any) => meal !== null) as Recipe[];

      return [...transformedIndian, ...transformedMeals];
    } catch (e) {
      console.error("Search failed:", e);
      return [];
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      const results = await performSearch("");
      setRecipes(results);
      setInitialLoading(false);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialLoading) return;

    const handleSearch = async () => {
      setLoading(true);
      const results = await performSearch(debouncedSearchQuery);
      setRecipes(results);
      setLoading(false);
    };

    handleSearch();
  }, [debouncedSearchQuery]);

  const NoResultsFound = () => {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="search" size={64} color="rgba(255,255,255,0.1)" />
        <Text style={styles.emptyTitle}>No masterpieces found</Text>
        <Text style={styles.emptyDescription}>
          Try searching for something else or explore our recommendations.
        </Text>
      </View>
    );
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.primary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search our secret recipes..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="rgba(255,255,255,0.4)"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {searchQuery ? "Search Results" : "Culinary Gems"}
          </Text>
          <Text style={styles.resultsCount}>{recipes.length} found</Text>
        </View>

        <View style={styles.resultsSection}>
          {loading || initialLoading ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner message="Curating flavors..." />
            </View>
          ) : (
            <FlatList
              data={recipes}
              renderItem={({ item }) => <RecipeCard recipe={item} />}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.recipesGrid}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<NoResultsFound />}
            />
          )}
        </View>
      </View>
    </SafeScreen>
  );
};
export default SearchScreen;
