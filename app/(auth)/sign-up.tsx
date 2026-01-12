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
import { useRouter } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import { useState } from "react";
import { authStyles } from "../../assets/styles/auth.styles";
import { Image } from "expo-image";
import { COLORS } from "../../constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import SafeScreen from "../../components/SafeScreen";

import { Ionicons } from "@expo/vector-icons";
import VerifyEmail from "./verify-email";

const SignUpScreen = () => {
  const router = useRouter();
  const { isLoaded, signUp } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password)
      return Alert.alert("Error", "Please fill in all fields");
    if (password.length < 6)
      return Alert.alert("Error", "Password must be at least 6 characters");

    if (!isLoaded) return;

    setLoading(true);

    try {
      await signUp.create({ emailAddress: email, password });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.errors?.[0]?.message || "Failed to create account"
      );
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification)
    return (
      <VerifyEmail email={email} onBack={() => setPendingVerification(false)} />
    );

  return (
    <SafeScreen>
      <View style={authStyles.container}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
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
          <Text style={authStyles.logoSub}>MEMBERSHIP</Text>
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
                <Text style={authStyles.title}>Create Account</Text>
                <Text style={authStyles.subtitle}>
                  Join our elite community of chefs and food enthusiasts today.
                </Text>
              </View>

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

                {/* Password Input */}
                <View style={authStyles.inputContainer}>
                  <TextInput
                    style={authStyles.textInput}
                    placeholder="Create Password"
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

                <View style={{ height: 10 }} />

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={authStyles.authButton}
                  onPress={handleSignUp}
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
                      {loading ? "Creating Account..." : "Get Started"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={authStyles.socialRow}>
                  <TouchableOpacity style={authStyles.socialBtn}>
                    <Text style={authStyles.socialBtnText}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={authStyles.socialBtn}>
                    <Text style={authStyles.socialBtnText}>Apple ID</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Link */}
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={authStyles.footerText}>
                    Existing member?{" "}
                    <Text style={authStyles.footerLinkText}>Sign In</Text>
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
export default SignUpScreen;
