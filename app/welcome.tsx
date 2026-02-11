import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import SafeScreen from "../components/SafeScreen";

const { width, height } = Dimensions.get("window");

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Premium Background Gradient */}
        <LinearGradient
          colors={["rgba(212,175,55,0.15)", "#000000"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.8 }}
        />

        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Foody</Text>
            <View style={styles.goldLine} />
            <Text style={styles.goldSub}>GOURMET GOLD</Text>
          </View>

          {/* Text Section */}
          <View style={styles.textSection}>
            <Text style={styles.title}>Master Your Kitchen</Text>
            <Text style={styles.description}>
              Professional AI recipes, personalized shopping lists, and
              voice-guided cooking at your fingertips.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/(auth)/sign-up")}
              style={styles.primaryButton}
            >
              <LinearGradient
                colors={[COLORS.primary, "#FFD700"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>GET STARTED</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-in")}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>
                Already have an account?{" "}
                <Text style={styles.goldText}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: height * 0.05,
  },
  logoText: {
    fontSize: 80,
    fontWeight: "900",
    color: COLORS.gold,
    letterSpacing: -2,
    textShadowColor: "rgba(212, 175, 55, 0.4)",
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 20,
  },
  goldLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.gold,
    marginVertical: 15,
  },
  goldSub: {
    color: COLORS.gold,
    letterSpacing: 8,
    fontWeight: "300",
    fontSize: 12,
  },
  textSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 56,
  },
  description: {
    fontSize: 18,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 28,
    paddingHorizontal: 20,
  },
  buttonSection: {
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    width: "100%",
    height: 75,
    borderRadius: 35,
    overflow: "hidden",
    marginBottom: 25,
    elevation: 10,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 2,
  },
  secondaryButton: {
    padding: 10,
  },
  secondaryText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
  },
  goldText: {
    color: COLORS.gold,
    fontWeight: "700",
  },
});

export default WelcomeScreen;
