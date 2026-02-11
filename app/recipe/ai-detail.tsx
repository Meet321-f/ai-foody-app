import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import * as Speech from "expo-speech";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { API_URL } from "../../constants/api";
import { MealAPI } from "../../services/mealAPI";
import { UserStorageService } from "../../services/userStorage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../contexts/ThemeContext";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "../../components/SafeScreen";

interface Recipe {
  id: number | string;
  title: string;
  image?: string;
  cookTime?: string;
  prepTime?: string;
  servings?: number | string;
  category?: string;
  area?: string;
  ingredients?: any[]; // Can be string[] or {ingredient, quantity, icon}[]
  instructions?: string[];
  calories?: string;
  difficulty?: string;
}

const { height } = Dimensions.get("window");

const AiRecipeDetailScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useUser();
  const userId = user?.id;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const { getToken } = useAuth();

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    const loadRecipe = async () => {
      setLoading(true);
      try {
        if (params.fullRecipe) {
          const data = JSON.parse(params.fullRecipe as string);
          setRecipe(data);
          if (userId && data.id) {
            const saved = await UserStorageService.isFavorite(
              userId,
              data.id.toString(),
            );
            setIsSaved(saved);
          }
        } else if (params.id && userId) {
          // Fallback if only ID is provided (e.g. from history if we didn't pass full data)
          const realId = params.id.toString();
          const savedRecipe = await UserStorageService.getAiRecipeById(
            userId,
            realId,
          );
          if (savedRecipe) {
            setRecipe(savedRecipe);
            setIsSaved(true);
          }
        }
      } catch (error) {
        console.error("Error loading AI recipe detail:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [params.fullRecipe, params.id, userId]);

  const toggleVoiceAssistant = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    if (!recipe || !recipe.instructions || recipe.instructions.length === 0) {
      Alert.alert("No instructions", "No instructions found to read.");
      return;
    }

    setIsSpeaking(true);
    const fullText = `Recipe for ${recipe.title}. ${recipe.instructions.map((s, i) => `Step ${i + 1}: ${s}`).join(". ")}`;

    Speech.speak(fullText, {
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      rate: 0.9,
    });
  };

  const handleToggleSave = async () => {
    if (!userId || !recipe) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        await UserStorageService.removeFavorite(userId, recipe.id.toString());
        setIsSaved(false);
      } else {
        await UserStorageService.saveFavorite(userId, recipe as any);
        setIsSaved(true);
      }
    } catch (error) {
      Alert.alert("Error", "Could not update favorites.");
    } finally {
      setIsSaving(false);
    }
  };

  const submitReport = async () => {
    if (!reportReason.trim() || !recipe) return;
    setIsReporting(true);
    try {
      const token = (await getToken()) || "";
      await MealAPI.reportRecipe(
        recipe.id.toString(),
        recipe.title,
        reportReason,
        token,
      );
      Alert.alert(
        "Reported",
        "Thank you for your feedback. Our team will review this recipe.",
      );
      setReportModalVisible(false);
      setReportReason("");
    } catch (error) {
      Alert.alert("Error", "Could not submit report. Please try again.");
    } finally {
      setIsReporting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Plating your AI creation..." />;
  if (!recipe)
    return (
      <View style={styles.container}>
        <Text style={{ color: "#FFF" }}>Recipe not found.</Text>
      </View>
    );

  return (
    <SafeScreen>
      <View style={styles.container}>
        <LinearGradient
          colors={["#000", "#111"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={toggleVoiceAssistant}
              style={[styles.navBtn, isSpeaking && styles.activeBtn]}
            >
              <Ionicons
                name={isSpeaking ? "volume-high" : "mic-outline"}
                size={24}
                color={isSpeaking ? COLORS.primary : "#FFF"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleToggleSave}
              disabled={isSaving}
              style={styles.navBtn}
            >
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={24}
                color={isSaved ? COLORS.primary : "#FFF"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setReportModalVisible(true)}
              style={styles.navBtn}
            >
              <Ionicons name="flag-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reporting Modal */}
        <Modal
          visible={reportModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setReportModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Report Recipe</Text>
              <Text style={styles.modalSub}>
                Why are you reporting this AI recipe?
              </Text>

              <TextInput
                style={styles.reportInput}
                placeholder="Content is inaccurate, offensive, etc..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                value={reportReason}
                onChangeText={setReportReason}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setReportModalVisible(false)}
                  style={[
                    styles.modalBtn,
                    { backgroundColor: "rgba(255,255,255,0.05)" },
                  ]}
                >
                  <Text style={{ color: "#FFF" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submitReport}
                  disabled={isReporting || !reportReason.trim()}
                  style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                >
                  <Text style={{ color: "#000", fontWeight: "900" }}>
                    {isReporting ? "SUBMITTING..." : "SUBMIT REPORT"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={14} color="#000" />
              <Text style={styles.aiBadgeText}>AI CHEF SPECIAL</Text>
            </View>
            <Text style={styles.title}>{recipe.title}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>READY IN</Text>
              <Text style={styles.statValue}>
                {recipe.prepTime || recipe.cookTime || "25 min"}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>CALORIES</Text>
              <Text style={styles.statValue}>
                {recipe.calories || "350 kcal"}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>LEVEL</Text>
              <Text style={styles.statValue}>
                {recipe.difficulty || "Easy"}
              </Text>
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {(recipe.ingredients || []).map((item, index) => {
              const isString = typeof item === "string";
              const name = isString ? item : item.ingredient;
              const qty = isString ? "" : item.quantity;

              return (
                <View key={index} style={styles.ingredientItem}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                      gap: 12,
                    }}
                  >
                    <Ionicons
                      name="radio-button-on"
                      size={8}
                      color={COLORS.primary}
                    />
                    <Text style={styles.ingredientText}>{name}</Text>
                  </View>
                  {!isString && qty && (
                    <Text
                      style={[
                        styles.ingredientText,
                        { color: COLORS.primary, fontWeight: "700" },
                      ]}
                    >
                      {qty}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {(recipe.instructions || []).map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 10,
  },
  headerActions: { flexDirection: "row", gap: 15 },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  activeBtn: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(212,175,55,0.1)",
  },
  scrollContent: { padding: 24 },
  titleSection: { marginBottom: 30 },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
    gap: 6,
  },
  aiBadgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: { fontSize: 32, fontWeight: "900", color: "#FFF", lineHeight: 40 },
  ratingSection: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  avgRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  avgRatingText: { color: "#000", fontWeight: "900", fontSize: 14 },
  totalRatingsText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    fontWeight: "600",
  },
  rateTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 12,
  },
  starsContainer: { flexDirection: "row", gap: 12 },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  statLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 4,
  },
  statValue: { color: COLORS.primary, fontSize: 14, fontWeight: "900" },
  section: { marginBottom: 35 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 20,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  ingredientText: { color: "rgba(255,255,255,0.8)", fontSize: 16 },
  stepItem: { flexDirection: "row", gap: 16, marginBottom: 24 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: { color: "#000", fontWeight: "900", fontSize: 14 },
  stepText: {
    flex: 1,
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 20,
  },
  reportInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    color: "#FFF",
    height: 120,
    textAlignVertical: "top",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AiRecipeDetailScreen;
