import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { COLORS } from "../constants/colors";
import SafeScreen from "../components/SafeScreen";
import { BlurView } from "expo-blur";
import { MealAPI } from "../services/mealAPI";
import * as Haptics from "expo-haptics";

const FEEDBACK_TYPES = [
  { label: "Bug Report", value: "bug", icon: "bug-outline", color: "#EE5253" },
  {
    label: "Feature Request",
    value: "feature",
    icon: "bulb-outline",
    color: "#FECA57",
  },
  {
    label: "General Feedback",
    value: "general",
    icon: "chatbubble-outline",
    color: "#48DBFB",
  },
];

const FeedbackScreen = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();

  const [rating, setRating] = useState(0);
  const [selectedType, setSelectedType] = useState("general");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Required", "Please provide a star rating.");
      return;
    }
    if (message.trim().length < 5) {
      Alert.alert(
        "Required",
        "Please enter a message at least 5 characters long.",
      );
      return;
    }

    setLoading(true);
    try {
      const token = (await getToken()) || "";
      await MealAPI.submitFeedback(rating, selectedType, message, token);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        "Thank You!",
        "Your feedback has been received and will help us make Foody even better.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      console.error("Feedback error:", error);
      Alert.alert(
        "Error",
        "Failed to submit feedback. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.gold} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Feedback</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>We value your input</Text>
            <Text style={styles.introSub}>
              How was your experience with Foody?
            </Text>
          </View>

          {/* Star Rating */}
          <View style={styles.ratingSection}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={40}
                  color={star <= rating ? COLORS.gold : "rgba(255,255,255,0.1)"}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback Type */}
          <Text style={styles.sectionLabel}>Reason for feedback</Text>
          <View style={styles.typeGrid}>
            {FEEDBACK_TYPES.map((type) => {
              const isSelected = selectedType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setSelectedType(type.value)}
                  style={[
                    styles.typeCard,
                    isSelected && {
                      borderColor: type.color,
                      backgroundColor: `${type.color}15`,
                    },
                  ]}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={22}
                    color={isSelected ? type.color : "rgba(255,255,255,0.3)"}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      isSelected && { color: type.color, fontWeight: "800" },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Message Box */}
          <Text style={styles.sectionLabel}>Your Message</Text>
          <View style={styles.inputCard}>
            <BlurView
              intensity={20}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Tell us what you like or what we can improve..."
              placeholderTextColor="rgba(255,255,255,0.2)"
              multiline
              numberOfLines={6}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.infoNote}>
            Submitting as:{" "}
            <Text style={{ color: COLORS.gold }}>
              {user?.fullName || "Guest User"}
            </Text>
          </Text>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
                <Ionicons
                  name="paper-plane"
                  size={18}
                  color="#000"
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.15)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  scrollContent: {
    padding: 24,
  },
  introSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
  },
  introSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginTop: 6,
  },
  ratingSection: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 40,
  },
  starButton: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.gold,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 32,
  },
  typeCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  typeText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
    textAlign: "center",
  },
  inputCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    marginBottom: 12,
  },
  textInput: {
    padding: 16,
    color: "#FFF",
    fontSize: 15,
    height: 120,
  },
  infoNote: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    textAlign: "right",
    marginBottom: 32,
  },
  submitButton: {
    backgroundColor: COLORS.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
  },
});

export default FeedbackScreen;
