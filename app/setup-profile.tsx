import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "../components/SafeScreen";
import { useUserProfile } from "../hooks/useUserProfile";
import { COLORS } from "../constants/colors";

const SetupProfile = () => {
  const router = useRouter();
  const { updateProfile, loading: profileLoading } = useUserProfile();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      // Save profile name
      const success = await updateProfile({ name: name.trim() });
      if (success) {
        // Navigate to Home
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#000000" }]}>
      <SafeScreen>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.content}
          >
            {/* Header / Back Button - Optional if needed, but usually setup is mandatory */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Pagination Dots (Mock visual) */}
            <View style={styles.paginationContainer}>
              <View style={[styles.dot, styles.dotInactive]} />
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, styles.dotInactive]} />
              <View style={[styles.dot, styles.dotInactive]} />
            </View>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Image
                  source={require("../assets/images/splash_icon.png")}
                  style={{ width: 40, height: 40, tintColor: COLORS.primary }}
                  contentFit="contain"
                />
              </View>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>Let's customize your{"\n"}AI Chef</Text>
            <Text style={styles.subtitle}>
              Tell us your name so Foody can personalize your culinary
              creations.
            </Text>

            {/* Input Form */}
            <View style={styles.formContainer}>
              <Text style={styles.label}>DISPLAY NAME</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Ex. Alex Smith"
                  placeholderTextColor="#64748B"
                  value={name}
                  onChangeText={setName}
                  autoCorrect={false}
                />
                <Ionicons name="card-outline" size={20} color="#64748B" />
              </View>
            </View>

            {/* Continue Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, !name.trim() && styles.buttonDisabled]}
                onPress={handleContinue}
                disabled={loading || !name.trim()}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Continue</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color="#FFF"
                      style={{ marginLeft: 8 }}
                    />
                  </>
                )}
              </TouchableOpacity>
              <Text style={styles.footerNote}>
                Foody uses this name to generate personalized recipe intros
              </Text>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeScreen>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: "#334155",
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#94A3B8",
    lineHeight: 24,
    marginBottom: 40,
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 16,
    marginRight: 10,
  },
  footer: {
    marginTop: "auto",
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerNote: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 12,
  },
});

export default SetupProfile;
