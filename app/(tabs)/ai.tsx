import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Animated, {
  FadeInUp,
  FadeInRight,
  FadeInDown,
} from "react-native-reanimated";
import SafeScreen from "../../components/SafeScreen";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { COLORS } from "../../constants/colors";
import { API_URL } from "../../constants/api";
import { UserStorageService } from "../../services/userStorage";
import { MealAPI } from "../../services/mealAPI";
import { Recipe } from "../../types";

const { width } = Dimensions.get("window");

// --- Types ---

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
  recipe?: Recipe;
  suggestions?: string[];
  isInitial?: boolean;
}

// --- Components ---

const MessageBubble = ({
  message,
  router,
  onSelectSuggestion,
}: {
  message: Message;
  router: any;
  onSelectSuggestion: (suggestion: string) => void;
}) => {
  const isUser = message.sender === "user";

  return (
    <Animated.View
      entering={isUser ? FadeInRight.duration(400) : FadeInUp.duration(400)}
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      {!isUser && (
        <Image
          source={require("../../assets/images/Ai.png")}
          style={styles.botAvatar}
          contentFit="cover"
        />
      )}

      <View style={styles.bubbleWrapper}>
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          {!isUser && (
            <BlurView
              intensity={30}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          )}
          <Text style={isUser ? styles.userText : styles.botText}>
            {message.text}
          </Text>
        </View>

        {message.suggestions && (
          <View style={styles.suggestionsContainer}>
            {message.suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => onSelectSuggestion(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {message.recipe && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.recipeCard}
              onPress={() =>
                router.push({
                  pathname: `/recipe/ai-detail`,
                  params: {
                    id: message.recipe?.id,
                    fullRecipe: JSON.stringify(message.recipe),
                  },
                })
              } // Navigate with data
            >
              <Image
                source={{ uri: message.recipe.image }}
                style={styles.recipeImage}
                contentFit="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)", "#000"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.recipeOverlay}>
                <View style={styles.tagContainer}>
                  <Text style={styles.tagText}>PREMIUM CHEF AI</Text>
                </View>
                <Text style={styles.recipeTitle}>{message.recipe.title}</Text>
                <View style={styles.recipeMeta}>
                  <View style={styles.metaRow}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={COLORS.primary}
                    />
                    <Text style={styles.metaLabel}>
                      {message.recipe.prepTime}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons
                      name="flame-outline"
                      size={14}
                      color={COLORS.primary}
                    />
                    <Text style={styles.metaLabel}>
                      {message.recipe.calories}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Text style={[styles.timestamp, isUser && { textAlign: "right" }]}>
          {message.timestamp}
        </Text>
      </View>
    </Animated.View>
  );
};

const AiScreen = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Recipe[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [isPro, setIsPro] = useState(true); // Enabled for testing full experience
  const [backendStatus, setBackendStatus] = useState<
    "online" | "offline" | "checking"
  >("checking");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      text: "Welcome to Chef Foody! 👨‍🍳 I can generate custom recipes based on whatever you have in your kitchen. What are we cooking today?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isInitial: true,
    },
  ]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const checkBackend = async () => {
    try {
      const { API_URL } = await import("../../constants/api");
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000); // 3s fast check

      const response = await fetch(`${API_URL}/health`, {
        signal: controller.signal,
      });
      clearTimeout(id);
      setBackendStatus(response.ok ? "online" : "offline");
    } catch (e) {
      setBackendStatus("offline");
    }
  };

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      setLoadingHistory(true);

      // Load from local storage (User Scoped Persistence)
      const localHistory = await UserStorageService.getAiHistory(user.id);
      setHistory(localHistory);

      /* Backend Sync (Optional - prioritize local for now)
      const token = await getToken();
      const response = await fetch(`${API_URL}/ai/history/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        // logic to merge
      }
      */
    } catch (e) {
      console.error("History fetch error:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setOriginalPrompt(userMsg.text); // Store the actual craving
    setInputText("");
    setIsTyping(true);

    try {
      const token = (await getToken()) || "";
      console.log(`[AiScreen] Requesting suggestions for: ${userMsg.text}`);
      const result = await MealAPI.getAiSuggestions(userMsg.text, token);
      console.log(`[AiScreen] Suggestions Result:`, result);

      if (!result.success || !result.suggestions) {
        throw new Error(result.error || "Failed to get suggestions");
      }

      const botMsg: Message = {
        id: `bot-sug-${Date.now()}`,
        text: "I have some ideas! Which one sounds best to you?",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        suggestions: result.suggestions,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          text:
            error instanceof Error && error.message.includes("Network")
              ? "Connection Error: Check if your phone and PC are on the same WiFi and if the IP 192.168.31.215 is correct."
              : error instanceof Error
                ? error.message
                : "I hit a snag while brainstorming. Please try again! 🥘",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectSuggestion = async (suggestion: string) => {
    if (isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: suggestion,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const token = (await getToken()) || "";
      console.log(`[AiScreen] Generating full recipe for: ${suggestion}`);
      const result = await MealAPI.generateFullAiRecipe(
        suggestion,
        !isPro,
        token,
        originalPrompt, // Pass the original ingredients context
      );

      console.log("[AiScreen] Generation Result:", result);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to generate recipe");
      }

      const recipeData = result.data;
      const recipeToSave: Recipe = {
        id: recipeData.id.toString().startsWith("ai_")
          ? recipeData.id.toString()
          : `ai_${recipeData.id}`,
        title: recipeData.title,
        image: recipeData.image || "", // Allow empty string if no image generated
        prepTime: recipeData.prepTime || "25 min",
        calories: recipeData.calories || "380 kcal",
        difficulty: recipeData.difficulty || "Medium",
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
      };

      // PERSISTENCE: Save immediately to User Storage
      if (user?.id) {
        await UserStorageService.saveAiRecipe(user.id, recipeToSave);
      }

      const botMsg: Message = {
        id: `bot-recipe-${Date.now()}`,
        text: `Here is the full recipe for **${recipeData.title}**!`,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        recipe: recipeToSave,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Recipe Generation Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-gen-${Date.now()}`,
          text:
            error instanceof Error
              ? error.message
              : "I couldn't finish the recipe. Please try again! 🥘",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <BlurView intensity={50} tint="dark" style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.actionIcon}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View>
              <Image
                source={require("../../assets/images/Ai.png")}
                style={styles.headerAvatar}
              />
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      backendStatus === "online"
                        ? "#4ade80"
                        : backendStatus === "offline"
                          ? "#ef4444"
                          : "#eab308",
                  },
                ]}
              />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.headerTitle}>Chef Foody AI</Text>
              <Text style={styles.headerStatus}>Pro Assistant</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.actionIcon}
            onPress={() => setShowHistory(true)}
          >
            <MaterialCommunityIcons name="history" size={24} color="#FFF" />
          </TouchableOpacity>
        </BlurView>

        {/* Chat List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatList}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              router={router}
              onSelectSuggestion={handleSelectSuggestion}
            />
          ))}

          {isTyping && (
            <Animated.View entering={FadeInUp} style={styles.typingIndicator}>
              <ActivityIndicator color={COLORS.primary} size="small" />
              <Text style={styles.typingText}>Chef is thinking...</Text>
            </Animated.View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputWrapper}>
          <BlurView intensity={80} tint="dark" style={styles.inputBar}>
            <TouchableOpacity style={styles.circleBtn}>
              <Ionicons name="camera" size={22} color="#AAA" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Ask for a recipe..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
              onPress={handleSend}
              disabled={!inputText.trim() || isTyping}
            >
              <Ionicons name="arrow-up" size={24} color="#000" />
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* History Modal */}
        <Modal
          visible={showHistory}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowHistory(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={90} tint="dark" style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Recipe History</Text>
                <TouchableOpacity onPress={() => setShowHistory(false)}>
                  <Ionicons name="close" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              {loadingHistory ? (
                <ActivityIndicator
                  color={COLORS.primary}
                  style={{ marginTop: 40 }}
                />
              ) : (
                <FlatList
                  data={history}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.historyCard}
                      onPress={() => {
                        setShowHistory(false);
                        router.push({
                          pathname: "/recipe/ai-detail",
                          params: {
                            id: item.id.toString(),
                            fullRecipe: JSON.stringify(item),
                          },
                        } as any);
                      }}
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={styles.historyThumb}
                      />
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.historyMeta}>
                          {(item as any).cookTime || "20 min"} • AI Generated
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="rgba(255,255,255,0.3)"
                      />
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={{ padding: 20 }}
                  ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>
                      No history yet. Start cooking!
                    </Text>
                  )}
                />
              )}
            </BlurView>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default AiScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center" },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4ade80",
    borderWidth: 2,
    borderColor: "#000",
  },
  headerTitle: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  headerStatus: { color: COLORS.primary, fontSize: 11, fontWeight: "600" },
  actionIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  chatList: { flex: 1 },
  messageContainer: {
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  userMessageContainer: { justifyContent: "flex-end" },
  botMessageContainer: { justifyContent: "flex-start" },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 4,
  },
  bubbleWrapper: { maxWidth: "80%" },
  messageBubble: { padding: 14, borderRadius: 20, overflow: "hidden" },
  userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  botBubble: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  userText: { color: "#000", fontSize: 15, lineHeight: 22, fontWeight: "500" },
  botText: { color: "#EEE", fontSize: 15, lineHeight: 22 },
  timestamp: { color: "#666", fontSize: 10, marginTop: 4, marginLeft: 4 },

  recipeCard: {
    width: width * 0.7,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 12,
  },
  recipeImage: { ...StyleSheet.absoluteFillObject },
  recipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 15,
    justifyContent: "flex-end",
  },
  tagContainer: {
    backgroundColor: "rgba(212,175,55,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  tagText: { color: COLORS.primary, fontSize: 10, fontWeight: "800" },
  recipeTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },
  recipeMeta: { flexDirection: "row", gap: 15 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaLabel: { color: "#AAA", fontSize: 12 },

  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 40,
  },
  typingText: { color: "#666", fontSize: 13, fontStyle: "italic" },

  inputWrapper: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    marginBottom: 40, // Lowered from 90 -> 60 -> 40 to be closer to the bottom
    backgroundColor: "transparent",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  input: { flex: 1, color: "#FFF", fontSize: 15, paddingHorizontal: 12 },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "80%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  historyThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  historyInfo: {
    flex: 1,
    marginLeft: 15,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  historyMeta: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "rgba(255,255,255,0.4)",
    marginTop: 40,
    fontSize: 15,
  },
  suggestionsContainer: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  suggestionText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
