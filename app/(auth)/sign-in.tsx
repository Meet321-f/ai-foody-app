import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";
import SafeScreen from "../../components/SafeScreen";
import VerifySecondFactor from "./verify-second-factor";

const SignInScreen = () => {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pending2FA, setPending2FA] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isLoaded) return;

    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (signInAttempt.status === "complete") {
        // Sign in successful without 2FA
        await setActive({ session: signInAttempt.createdSessionId });
      } else if (signInAttempt.status === "needs_second_factor") {
        // Password correct, now need 2FA verification
        // Prepare the second factor (send email code)
        await signIn.prepareSecondFactor({
          strategy: "email_code",
        });
        // Show 2FA verification screen
        setPending2FA(true);
      } else {
        // Other statuses
        Alert.alert("Error", "Sign in failed. Please try again.");
        console.error(
          "Unexpected status:",
          JSON.stringify(signInAttempt, null, 2),
        );
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Sign in failed");
      console.error("Sign-in error:", JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  // Show 2FA verification screen if needed
  if (pending2FA) {
    return (
      <VerifySecondFactor email={email} onBack={() => setPending2FA(false)} />
    );
  }

  return (
    <SafeScreen>
      <View style={authStyles.container}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
          }}
          style={authStyles.bgImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.95)"]}
          style={authStyles.gradientOverlay}
        />

        <View style={authStyles.logoContainer}>
          <Text style={authStyles.logoTitle}>Foody</Text>
          <Text style={authStyles.logoSub}>GOURMET ROOM</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={authStyles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={authStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={authStyles.content}>
              <View style={authStyles.headerSection}>
                <Text style={authStyles.title}>Welcome Back</Text>
                <Text style={authStyles.subtitle}>
                  Enter your credentials to access the world's finest recipes.
                </Text>
              </View>

              {/* FORM CONTAINER */}
              <View style={authStyles.formContainer}>
                {/* Email Input */}
                <View style={authStyles.inputContainer}>
                  <TextInput
                    style={authStyles.textInput}
                    placeholder="Email Address"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* PASSWORD INPUT */}
                <View style={authStyles.inputContainer}>
                  <TextInput
                    style={authStyles.textInput}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={authStyles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="rgba(255,255,255,0.4)"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={authStyles.authButton}
                  onPress={handleSignIn}
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
                      {loading ? "Signing In..." : "Sign In"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/sign-up")}
                >
                  <Text style={authStyles.footerText}>
                    New to Foody?{" "}
                    <Text style={authStyles.footerLinkText}>Join the Club</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeScreen>
  );
};
export default SignInScreen;
