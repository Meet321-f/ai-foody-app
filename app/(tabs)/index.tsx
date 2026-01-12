import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Platform,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { MealAPI } from "../../services/mealAPI";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  getAppSetting,
  setAppSetting,
  initDB,
  getCategories,
  saveCategories,
  getRecipes,
  saveRecipes,
  getCustomRecipes,
  saveCustomRecipes,
} from "../../services/db";
import { homeStyles } from "../../assets/styles/home.styles";
import { Image } from "expo-image";
import { COLORS } from "../../constants/colors";
import CategoryFilter from "../../components/CategoryFilter";
import RecipeCard from "../../components/RecipeCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Category, Recipe } from "../../types";
import { useUserProfile } from "../../hooks/useUserProfile";
import SafeScreen from "../../components/SafeScreen";
import PromoBanner from "../../components/PromoBanner";
import RecipeTypeSelector from "../../components/RecipeTypeSelector";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const HomeScreen = () => {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredRecipe, setFeaturedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recipeType, setRecipeType] = useState<"indian" | "others">("others");
  const [allIndianRecipes, setAllIndianRecipes] = useState<Recipe[]>([]);

  const loadData = async () => {
    try {
      if (recipeType === "others") {
        // 1. Load from Cache (SQLite) - Instant UI
        const cachedCategories = getCategories();
        const cachedRecipes = getRecipes();

        if (cachedCategories.length > 0) {
          setCategories(cachedCategories);
          if (!selectedCategory) {
            setSelectedCategory(cachedCategories[0].name);
          }
        }

        if (cachedRecipes.length > 0) {
          setRecipes(cachedRecipes);
          setLoading(false); // Cache hit, hide spinner
        } else {
          setLoading(true); // No cache, show spinner
        }

        // 2. Fetch Fresh Data (API) in background
        const fetchPromise = Promise.all([
          MealAPI.getCategories(),
          MealAPI.getRandomMeals(8),
          MealAPI.getRandomMeal(),
        ]);

        const [apiCategories, randomMeals, featuredMeal] = await fetchPromise;

        if (apiCategories && apiCategories.length > 0) {
          const transformedCategories: Category[] = apiCategories.map(
            (cat: any, index: number) => ({
              id: index + 1,
              name: cat.strCategory,
              image: cat.strCategoryThumb,
              description: cat.strCategoryDescription,
            })
          );
          setCategories(transformedCategories);
          saveCategories(transformedCategories);

          if (!selectedCategory && transformedCategories.length > 0) {
            setSelectedCategory(transformedCategories[0].name);
          }
        }

        if (randomMeals && randomMeals.length > 0) {
          const transformedMeals: Recipe[] = randomMeals
            .map((meal: any) => MealAPI.transformMealData(meal))
            .filter((meal: any): meal is Recipe => meal !== null);

          setRecipes(transformedMeals);
          saveRecipes(transformedMeals);
        }

        if (featuredMeal) {
          const transformedFeatured = MealAPI.transformMealData(featuredMeal);
          setFeaturedRecipe(transformedFeatured as Recipe);
        }
      } else {
        // Indian Recipes Logic
        setLoading(true);

        // 1. Check SQLite Cache First
        const cachedIndian = getCustomRecipes();
        if (cachedIndian.length > 0) {
          setRecipes(cachedIndian);
          setAllIndianRecipes(cachedIndian);
          setCategories([]); // Ensure categories are cleared even from cache
          setLoading(false);
        }

        // Fetch from Legacy NeonDB (Limited to 10)
        const indianRecipes = await MealAPI.getIndianRecipes(10);
        const transformed: Recipe[] = indianRecipes
          .map((r: any) => MealAPI.transformCustomRecipe(r))
          .filter((r: any): r is Recipe => r !== null);

        if (transformed.length > 0) {
          setRecipes(transformed);
          setAllIndianRecipes(transformed);
          saveCustomRecipes(transformed);
          setCategories([]); // Remove categories for Indian recipes as requested

          setFeaturedRecipe(
            transformed[Math.floor(Math.random() * transformed.length)]
          );
        }
      }
    } catch (error) {
      console.log("Error loading the data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryData = async (category: string) => {
    try {
      const meals = await MealAPI.filterByCategory(category);
      const transformedMeals: Recipe[] = meals
        .map((meal: any) => MealAPI.transformMealData(meal))
        .filter((meal: any): meal is Recipe => meal !== null);
      setRecipes(transformedMeals);
    } catch (error) {
      console.error("Error loading category data:", error);
      setRecipes([]);
    }
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    if (recipeType === "others") {
      await loadCategoryData(category);
    }
  };

  const handleTypeSelect = (type: "indian" | "others") => {
    setRecipeType(type);
    setSelectedCategory(null);
    setCategories([]); // Reset categories immediately on type switch
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [recipeType]);

  if (loading && !refreshing)
    return <LoadingSpinner message="Loading delicions recipes..." />;

  return (
    <View style={[homeStyles.container, { backgroundColor: "transparent" }]}>
      <SafeScreen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={homeStyles.scrollContent}
        >
          {/* WELCOME SECTION */}
          <TouchableOpacity
            style={homeStyles.welcomeSection}
            onPress={() => router.push("/profile")}
            activeOpacity={0.8}
          >
            <Image
              source={
                profile?.image
                  ? { uri: profile.image }
                  : require("../../assets/images/default.png")
              }
              style={homeStyles.headerProfileImage}
              contentFit="cover"
            />
            <View style={homeStyles.welcomeTextContainer}>
              <Text style={homeStyles.greetingText}>
                Hello, {profile?.name || "Guest"} 👋
              </Text>
              <Text style={homeStyles.subtitleText}>Explore your recipes</Text>
            </View>
          </TouchableOpacity>

          <PromoBanner />

          <RecipeTypeSelector
            selectedType={recipeType}
            onSelectType={handleTypeSelect}
          />

          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
          )}

          <View style={homeStyles.recipesSection}>
            <View style={homeStyles.sectionHeader}>
              <Text style={homeStyles.sectionTitle}>
                {recipeType === "indian" ? "Indian Recipes" : selectedCategory}
              </Text>
            </View>

            {recipes.length > 0 ? (
              <FlatList
                data={recipes}
                renderItem={({ item }) => <RecipeCard recipe={item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={homeStyles.row}
                contentContainerStyle={homeStyles.recipesGrid}
                scrollEnabled={false}
              />
            ) : (
              <View style={homeStyles.emptyState}>
                <Ionicons
                  name="restaurant-outline"
                  size={64}
                  color={COLORS.textLight}
                />
                <Text style={homeStyles.emptyTitle}>No recipes found</Text>
                <Text style={homeStyles.emptyDescription}>
                  Try a different category
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeScreen>
    </View>
  );
};
export default HomeScreen;
