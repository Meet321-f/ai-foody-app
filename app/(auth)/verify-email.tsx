import { useSignUp } from "@clerk/clerk-expo";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { authStyles } from "../../assets/styles/auth.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import SafeScreen from "../../components/SafeScreen";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";

interface VerifyEmailProps {
  email: string;
  onBack: () => void;
}

const VerifyEmail = ({ email, onBack }: VerifyEmailProps) => {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleVerification = async () => {
    if (!isLoaded) return;
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      Alert.alert("Error", "Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: fullCode,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/setup-profile");
      } else {
        Alert.alert("Error", "Verification failed. Please try again.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCode = (text: string, index: number) => {
    const newCode = [...code];
    const char = text.slice(-1);
    newCode[index] = char;
    setCode(newCode);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    }
  };

  return (
    <SafeScreen>
      <View style={authStyles.container}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
          }}
          style={authStyles.bgImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.95)"]}
          style={authStyles.gradientOverlay}
        />

        <TouchableOpacity
          style={[
            authStyles.navBtn,
            { position: "absolute", top: 60, left: 24, zIndex: 10 },
          ]}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={authStyles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={authStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={authStyles.content}>
              <View style={styles.iconSection}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="mail-outline"
                    size={32}
                    color={COLORS.primary}
                  />
                  <View style={styles.pulseRing} />
                </View>
              </View>

              <View style={authStyles.headerSection}>
                <Text style={[authStyles.title, { textAlign: "center" }]}>
                  Check your mail
                </Text>
                <Text style={[authStyles.subtitle, { textAlign: "center" }]}>
                  Enter the 6-digit secure code sent to{"\n"}
                  <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                    {email}
                  </Text>
                </Text>
              </View>

              <View style={styles.otpContainer}>
                {code.map((digit, index) => (
                  <View key={index} style={styles.otpBoxWrapper}>
                    <TextInput
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      style={[
                        styles.otpBox,
                        {
                          borderColor: digit
                            ? COLORS.primary
                            : "rgba(255,255,255,0.15)",
                        },
                      ]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleChangeCode(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      placeholder=""
                      selectionColor={COLORS.primary}
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={authStyles.authButton}
                onPress={handleVerification}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.primary, "#FFD700"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={authStyles.buttonGradient}
                >
                  <Text style={authStyles.buttonText}>
                    {loading ? "Verifying..." : "Verify Account"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={{ padding: 10 }}>
                <Text style={authStyles.footerText}>
                  Didn't get the code?{" "}
                  <Text style={authStyles.footerLinkText}>Resend</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  iconSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    position: "relative",
  },
  pulseRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: COLORS.primary,
    opacity: 0.5,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 50,
    width: "100%",
  },
  otpBoxWrapper: {
    width: "14%",
    aspectRatio: 0.75,
  },
  otpBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 15,
    borderWidth: 1,
    fontSize: 24,
    color: COLORS.primary,
    textAlign: "center",
    fontWeight: "900",
  },
});

export default VerifyEmail;
