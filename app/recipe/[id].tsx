import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "../../constants/api";
import { MealAPI } from "../../services/mealAPI";
import { UserStorageService } from "../../services/userStorage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../contexts/ThemeContext";
import { COLORS } from "../../constants/colors";

import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import SafeScreen from "../../components/SafeScreen";

interface Comment {
  id: string;
  text: string;
  user: string;
  timestamp: string;
}

interface Recipe {
  id: number | string;
  title: string;
  image: string;
  cookTime?: string;
  servings?: number | string;
  category?: string;
  area?: string | null;
  ingredients?: any[];
  instructions?: string[];
  youtubeUrl?: string | null;
}

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  quantity?: string;
}

interface ShoppingGroup {
  recipeId: string;
  recipeTitle: string;
  items: ShoppingItem[];
}

const { height, width } = Dimensions.get("window");

const RecipeDetailScreen = () => {
  const params = useLocalSearchParams();
  const routeId = params.id;
  const recipeId: string | undefined = Array.isArray(routeId)
    ? routeId[0]
    : (routeId as string | undefined);

  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState<string>("");
  const [playingVideo, setPlayingVideo] = useState(false);

  const { user } = useUser();
  const userId = user?.id;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000",
    },
    headerContainer: {
      height: height * 0.45,
      position: "relative",
    },
    imageContainer: {
      ...StyleSheet.absoluteFillObject,
      borderBottomLeftRadius: 60,
      overflow: "hidden",
    },
    headerImage: {
      width: "100%",
      height: "100%",
    },
    gradientOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "50%",
    },
    floatingButtons: {
      position: "absolute",
      top: 50,
      left: 20,
      right: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      zIndex: 10,
    },
    navBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
    },
    contentSection: {
      paddingHorizontal: 24,
      paddingTop: 30,
    },
    categoryBadge: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 10,
      alignSelf: "flex-start",
      marginBottom: 16,
    },
    categoryText: {
      color: "#000",
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    recipeTitle: {
      fontSize: 34,
      fontWeight: "900",
      color: "#FFF",
      lineHeight: 38,
      marginBottom: 20,
      letterSpacing: -0.5,
      fontFamily: Platform.OS === "ios" ? "Lexend" : "sans-serif",
    },
    statsScroller: {
      marginBottom: 30,
    },
    statsScrollContent: {
      gap: 12,
      paddingRight: 24,
    },
    statChip: {
      backgroundColor: "#111",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
      borderLeftWidth: 3,
      borderLeftColor: COLORS.primary,
      minWidth: 110,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: "800",
      color: COLORS.primary,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    statValue: {
      fontSize: 15,
      fontWeight: "900",
      color: "#FFF",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 40,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: COLORS.primary,
      letterSpacing: 0.5,
    },
    videoCard: {
      width: "100%",
      aspectRatio: 16 / 9,
      borderRadius: 24,
      overflow: "hidden",
      backgroundColor: "#111",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
      marginBottom: 20,
    },
    videoPlaceholder: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
    },
    playBtn: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: COLORS.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
    },
    playText: {
      fontSize: 12,
      fontWeight: "900",
      color: "#FFF",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    webview: {
      flex: 1,
      backgroundColor: "#000",
    },
    ingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#111",
    },
    ingName: {
      fontSize: 16,
      color: "rgba(255,255,255,0.8)",
      fontWeight: "500",
    },
    ingQty: {
      fontSize: 14,
      color: COLORS.primary,
      fontWeight: "700",
    },
    stepItem: {
      flexDirection: "row",
      marginBottom: 35,
    },
    stepNumContainer: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: COLORS.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    stepNum: {
      color: "#000",
      fontSize: 16,
      fontWeight: "900",
    },
    stepText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 24,
      color: "rgba(255,255,255,0.7)",
    },
    fab: {
      marginTop: 20,
      marginBottom: 40,
      borderRadius: 20,
      overflow: "hidden",
      elevation: 8,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    },
    fabGradient: {
      paddingVertical: 20,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 10,
    },
    fabText: {
      color: "#000",
      fontSize: 16,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    commentsSection: {
      marginTop: 20,
      paddingBottom: 60,
    },
    commentInputContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    commentInput: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: 15,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: "#FFF",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
    },
    postBtn: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: 20,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
    },
    postBtnText: {
      color: "#000",
      fontWeight: "800",
    },
    commentCard: {
      backgroundColor: "rgba(255,255,255,0.02)",
      padding: 16,
      borderRadius: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    commentUser: {
      color: COLORS.primary,
      fontWeight: "800",
      fontSize: 13,
      marginBottom: 4,
    },
    commentText: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 14,
      lineHeight: 20,
    },
    commentDate: {
      color: "rgba(255,255,255,0.3)",
      fontSize: 10,
      marginTop: 8,
      textTransform: "uppercase",
    },
  });

  const loadRecipeDetail = async () => {
    if (!recipeId) return;

    // Check if we already have the recipe data passed from Chat
    if (params.fullRecipe) {
      try {
        const data = JSON.parse(params.fullRecipe as string);
        const transformed: Recipe = {
          id: data.id, // Keep as string (e.g. "ai_123")
          title: data.title,
          image: data.image,
          cookTime: data.prepTime || "25 min",
          servings: 2,
          category: "AI Chef Special",
          ingredients: data.ingredients || [],
          instructions: data.instructions || [],
        };
        setRecipe(transformed);
        setLoading(false);
        return;
      } catch (e) {
        console.error("Error parsing passed recipe:", e);
      }
    }

    setLoading(true);
    try {
      if (recipeId.startsWith("custom_")) {
        const realId = recipeId.replace("custom_", "");
        const indianMeal = await MealAPI.getIndianRecipeById(realId);
        if (indianMeal) {
          const transformed = MealAPI.transformCustomRecipe(indianMeal);
          setRecipe(transformed);
        }
      } else if (recipeId.startsWith("ai_")) {
        const realId = recipeId.replace("ai_", "");
        const aiMeal = await MealAPI.getAiRecipeById(realId);
        if (aiMeal) {
          const transformed = MealAPI.transformAiRecipe(aiMeal);
          setRecipe(transformed);
        }
      } else {
        const mealData: any = await MealAPI.getMealById(recipeId);
        if (mealData) {
          const transformedRecipe = MealAPI.transformMealData(
            mealData,
          ) as Recipe;

          const recipeWithVideo: Recipe = {
            ...transformedRecipe,
            youtubeUrl: mealData.strYoutube || null,
          };

          setRecipe(recipeWithVideo);
        }
      }
    } catch (error) {
      console.error("Error loading recipe detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!userId || !recipeId) return;

    try {
      const isLocallySaved = await UserStorageService.isFavorite(
        userId,
        recipeId,
      );
      setIsSaved(isLocallySaved);
    } catch (error) {
      console.error("Error checking if recipe is saved:", error);
    }
  };

  const loadComments = async () => {
    if (!recipeId) return;

    try {
      const storedComments = await AsyncStorage.getItem(`comments_${recipeId}`);
      if (storedComments) {
        setComments(JSON.parse(storedComments) as Comment[]);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  useEffect(() => {
    loadRecipeDetail();
    loadComments();
    checkIfSaved();
  }, [recipeId, userId]);

  const getYouTubeEmbedUrl = (url: string): string => {
    const parts = url.split("v=");
    const videoId = parts[1]?.split("&")[0] ?? "";
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleToggleSave = async () => {
    if (!userId || !recipeId || !recipe) {
      Alert.alert("Error", "User or recipe information is missing.");
      return;
    }

    setIsSaving(true);

    try {
      if (isSaved) {
        // Remove locally
        await UserStorageService.removeFavorite(userId, recipeId);

        // Remove from backend (keep best effort)
        fetch(`${API_URL}/favorites/${userId}/${recipeId}`, {
          method: "DELETE",
        }).catch((e) => console.log("Backend remove failed", e));

        setIsSaved(false);
      } else {
        // Save locally
        await UserStorageService.saveFavorite(userId, recipe);

        // Save to backend (keep best effort)
        fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            recipeId: recipeId,
            title: recipe.title,
            image: recipe.image,
            cookTime: recipe.cookTime,
            servings: recipe.servings,
            area: recipe.area || undefined,
          }),
        }).catch((e) => console.log("Backend save failed", e));

        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling recipe save:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const addComment = async () => {
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      text: commentInput,
      user: user?.firstName || "Anonymous",
      timestamp: new Date().toISOString(),
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    setCommentInput("");

    try {
      if (recipeId) {
        await AsyncStorage.setItem(
          `comments_${recipeId}`,
          JSON.stringify(updatedComments),
        );
      }
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  const addAllToShoppingList = async () => {
    if (!recipe) return;

    try {
      const existingList = await AsyncStorage.getItem("shoppingList");
      let shoppingGroups: ShoppingGroup[] = [];

      if (existingList) {
        const parsed = JSON.parse(existingList);
        // Handle migration if it was a flat array
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          typeof parsed[0] === "string"
        ) {
          shoppingGroups = [
            {
              recipeId: "migrated",
              recipeTitle: "Previous Items",
              items: (parsed as string[]).map((name, i) => ({
                id: `mig-${i}`,
                name,
                checked: false,
              })),
            },
          ];
        } else {
          shoppingGroups = parsed;
        }
      }

      const groupIndex = shoppingGroups.findIndex(
        (g) => g.recipeId === String(recipe.id),
      );

      if (groupIndex === -1) {
        const newGroup: ShoppingGroup = {
          recipeId: String(recipe.id),
          recipeTitle: recipe.title,
          items: (recipe.ingredients || []).map((name, i) => ({
            id: `${recipe.id}-${i}`,
            name: name.trim(),
            checked: false,
          })),
        };
        shoppingGroups.push(newGroup);
        await AsyncStorage.setItem(
          "shoppingList",
          JSON.stringify(shoppingGroups),
        );
        Alert.alert(
          "Luxury Pantry",
          "Ingredients added to your shopping experience.",
        );
      } else {
        Alert.alert(
          "Already Curated",
          "This recipe is already in your shopping collection.",
        );
      }
    } catch (error) {
      console.error("Error adding to shopping list:", error);
    }
  };

  if (loading) return <LoadingSpinner message="Loading recipe details..." />;

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.text }}>Recipe not found.</Text>
      </View>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* IMMERSIVE HERO */}
          <View style={styles.headerContainer}>
            <View style={styles.imageContainer}>
              {recipe.image ? (
                <Image
                  source={{ uri: recipe.image }}
                  style={styles.headerImage}
                  contentFit="cover"
                />
              ) : (
                <View style={{ flex: 1 }}>
                  {/* Abstract Gold/Black Pattern Placeholder */}
                  <LinearGradient
                    colors={["#111", "#333", "#000"]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  {/* Decorative Elements */}
                  <LinearGradient
                    colors={["transparent", COLORS.gold, "transparent"]}
                    style={{
                      position: "absolute",
                      width: "200%",
                      height: 200,
                      top: -50,
                      left: -50,
                      opacity: 0.1,
                      transform: [{ rotate: "45deg" }],
                    }}
                  />

                  {/* No lock overlay needed, all features free */}
                </View>
              )}
            </View>

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,1)"]}
              style={styles.gradientOverlay}
            />

            <View style={styles.floatingButtons}>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.navBtn,
                    {
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderColor: COLORS.gold,
                    },
                  ]}
                  onPress={() => {
                    // Activate Voice Mode directly (Free for all)
                    Alert.alert("Voice Mode", "Starting cooking assistant...");
                  }}
                >
                  <Ionicons name="mic" size={22} color={COLORS.gold} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.navBtn,
                    {
                      backgroundColor: isSaved
                        ? COLORS.primary
                        : "rgba(0,0,0,0.4)",
                    },
                  ]}
                  onPress={handleToggleSave}
                  disabled={isSaving}
                >
                  <Ionicons
                    name={isSaved ? "heart" : "heart-outline"}
                    size={24}
                    color={isSaved ? "#000" : "#FFF"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.contentSection}>
            {/* BADGE & TITLE */}
            <Text style={styles.recipeTitle}>{recipe.title}</Text>

            {/* STATS SCROLLER */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.statsScroller}
              contentContainerStyle={styles.statsScrollContent}
            >
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>Ready In</Text>
                <Text style={styles.statValue}>{recipe.cookTime}</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>Servings</Text>
                <Text style={styles.statValue}>{recipe.servings} People</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>Difficulty</Text>
                <Text style={styles.statValue}>Intermediate</Text>
              </View>
              {recipe.area && (
                <View style={styles.statChip}>
                  <Text style={styles.statLabel}>Cuisine</Text>
                  <Text style={styles.statValue}>{recipe.area}</Text>
                </View>
              )}
            </ScrollView>

            {/* VIDEO SECTION */}
            {recipe.youtubeUrl && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Masterclass Video</Text>
                  <TouchableOpacity
                    onPress={() => setPlayingVideo(!playingVideo)}
                  >
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: 11,
                        fontWeight: "800",
                      }}
                    >
                      {playingVideo ? "CLOSE PLAYER" : "WATCH NOW"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.videoCard}>
                  {!playingVideo ? (
                    <TouchableOpacity
                      style={styles.videoPlaceholder}
                      onPress={() => setPlayingVideo(true)}
                    >
                      <Image
                        source={{ uri: recipe.image }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        blurRadius={10}
                      />
                      <View
                        style={{
                          ...StyleSheet.absoluteFillObject,
                          backgroundColor: "rgba(0,0,0,0.5)",
                        }}
                      />
                      <View style={styles.playBtn}>
                        <Ionicons
                          name="play"
                          size={30}
                          color="#000"
                          style={{ marginLeft: 4 }}
                        />
                      </View>
                      <Text style={styles.playText}>Play Tutorial</Text>
                    </TouchableOpacity>
                  ) : (
                    <WebView
                      style={styles.webview}
                      source={{ uri: getYouTubeEmbedUrl(recipe.youtubeUrl) }}
                      allowsFullscreenVideo
                      mediaPlaybackRequiresUserAction={false}
                    />
                  )}
                </View>
              </View>
            )}

            {/* INGREDIENTS */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <Text
                style={{
                  color: COLORS.primary,
                  fontSize: 13,
                  fontWeight: "800",
                }}
              >
                {(recipe.ingredients || []).length} ITEMS
              </Text>
            </View>
            {(recipe.ingredients || []).map((ing: any, idx) => {
              // Robust handling for ingredients which could be strings or objects
              let name = "";
              let qty = "";

              if (typeof ing === "string") {
                if (ing.includes(":")) {
                  [name, qty] = ing.split(":");
                } else {
                  name = ing;
                }
              } else if (ing && typeof ing === "object") {
                // Handle object format: { ingredient: "...", quantity: "...", icon: "..." }
                name = ing.ingredient || ing.name || JSON.stringify(ing);
                qty = ing.quantity || "";
                if (ing.icon) name = `${ing.icon} ${name}`;
              }

              return (
                <View key={idx} style={styles.ingItem}>
                  <Text style={styles.ingName}>{name.trim()}</Text>
                  {qty && <Text style={styles.ingQty}>{qty.trim()}</Text>}
                </View>
              );
            })}

            {/* PREPARATION */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Preparation</Text>
            </View>
            {(recipe.instructions || []).map((step, idx) => (
              <View key={idx} style={styles.stepItem}>
                <View style={styles.stepNumContainer}>
                  <Text style={styles.stepNum}>{idx + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}

            {/* SHOPPING CTA */}
            <TouchableOpacity style={styles.fab} onPress={addAllToShoppingList}>
              <LinearGradient
                colors={[COLORS.primary, "#FFD700"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fabGradient}
              >
                <Ionicons name="basket" size={20} color="#000" />
                <Text style={styles.fabText}>Add All to Experience</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* COMMENTS */}
            <View style={styles.commentsSection}>
              <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>
                Comments
              </Text>
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Share your thoughts..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={commentInput}
                  onChangeText={setCommentInput}
                />
                <TouchableOpacity style={styles.postBtn} onPress={addComment}>
                  <Text style={styles.postBtnText}>Post</Text>
                </TouchableOpacity>
              </View>
              {comments.length === 0 ? (
                <Text
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  Be the first to comment on this masterpiece.
                </Text>
              ) : (
                comments.map((item) => (
                  <View key={item.id} style={styles.commentCard}>
                    <Text style={styles.commentUser}>{item.user}</Text>
                    <Text style={styles.commentText}>{item.text}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeScreen>
  );
};

export default RecipeDetailScreen;
