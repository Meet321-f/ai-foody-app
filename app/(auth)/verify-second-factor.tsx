import { useSignIn } from "@clerk/clerk-expo";
import { useState, useRef } from "react";
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

interface VerifySecondFactorProps {
  email: string;
  onBack: () => void;
}

const VerifySecondFactor = ({ email, onBack }: VerifySecondFactorProps) => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleResendCode = async () => {
    if (!isLoaded || !signIn) return;

    setResending(true);
    try {
      // Prepare second factor verification which will send a new code
      await signIn.prepareSecondFactor({
        strategy: "email_code",
      });
      Alert.alert(
        "Success",
        "Verification code has been resent to your email."
      );
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Failed to resend code");
      console.error("Resend error:", JSON.stringify(err, null, 2));
    } finally {
      setResending(false);
    }
  };

  const handleVerification = async () => {
    if (!isLoaded || !signIn) return;

    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      Alert.alert("Error", "Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      // Attempt to verify the second factor with the code
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: fullCode,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        // Successfully signed in with 2FA
      } else {
        Alert.alert("Error", "Verification failed. Please try again.");
        console.error(
          "Unexpected status:",
          JSON.stringify(signInAttempt, null, 2)
        );
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Verification failed");
      console.error("Verification error:", JSON.stringify(err, null, 2));
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
                    name="shield-checkmark-outline"
                    size={32}
                    color={COLORS.primary}
                  />
                  <View style={styles.pulseRing} />
                </View>
              </View>

              <View style={authStyles.headerSection}>
                <Text style={[authStyles.title, { textAlign: "center" }]}>
                  Two-Factor Authentication
                </Text>
                <Text style={[authStyles.subtitle, { textAlign: "center" }]}>
                  Enter the 6-digit security code sent to{"\n"}
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
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={handleResendCode}
                disabled={resending}
              >
                <Text style={authStyles.footerText}>
                  Didn't get the code?{" "}
                  <Text style={authStyles.footerLinkText}>
                    {resending ? "Sending..." : "Resend"}
                  </Text>
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

export default VerifySecondFactor;
