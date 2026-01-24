import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import SafeScreen from "../components/SafeScreen";
import PricingCard from "../components/PricingCard"; // Assuming you created this

const { width, height } = Dimensions.get("window");

const SubscriptionScreen = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "yearly",
  );

  const handleSubscribe = () => {
    // In a real app, this would trigger In-App Purchase logic
    Alert.alert(
      "Welcome to Pro! 🌟",
      "You have successfully upgraded your account. Enjoy unlimited AI access!",
      [
        {
          text: "Let's Cook!",
          onPress: () => router.back(),
        },
      ],
    );
    // TODO: Persist 'isPro' status in storage
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Header Image / Pattern */}
        <View style={styles.headerBackground}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1000&auto=format&fit=crop",
            }}
            style={styles.headerImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "#000000"]}
            style={styles.gradientOverlay}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Image
              source={require("../assets/images/Ai.png")}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.heroTitle}>Upgrade to Pro</Text>
            <Text style={styles.heroSubtitle}>
              Unlock the full potential of your AI Chef
            </Text>
          </View>

          {/* Benefits Grid */}
          <View style={styles.benefitsContainer}>
            <BenefitItem
              icon="camera"
              title="AI Recipe Images"
              description="Visualise every dish with stunning AI photos"
            />
            <BenefitItem
              icon="infinite"
              title="Unlimited Recipes"
              description="Generate as many recipes as you crave"
            />
            <BenefitItem
              icon="nutrition"
              title="Nutrition Insights"
              description="Detailed macros and calorie counts"
            />
            <BenefitItem
              icon="ban"
              title="Ad-Free Experience"
              description="Focus on cooking, not ads"
            />
          </View>

          {/* Pricing Config */}
          <View style={styles.pricingContainer}>
            <PricingCard
              title="Monthly"
              price="199"
              period="mo"
              isSelected={selectedPlan === "monthly"}
              onPress={() => setSelectedPlan("monthly")}
            />
            <PricingCard
              title="Yearly"
              price="1999"
              period="yr"
              description="Save ₹389 / year"
              isBestValue
              isSelected={selectedPlan === "yearly"}
              onPress={() => setSelectedPlan("yearly")}
            />
          </View>

          {/* Guarantee Text */}
          <Text style={styles.guaranteeText}>
            Cancel anytime. No questions asked.
          </Text>
        </ScrollView>

        {/* Floating Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubscribe}
            style={styles.subscribeButton}
          >
            <LinearGradient
              colors={[COLORS.gold, "#B8860B"]} // Gold Gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.subscribeText}>
                Subscribe for ₹{selectedPlan === "monthly" ? "199" : "1999"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeScreen>
  );
};

// Helper Component for Benefit List
const BenefitItem = ({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <View style={styles.benefitItem}>
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={22} color={COLORS.gold} />
    </View>
    <View style={styles.benefitText}>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitPrev}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    opacity: 0.6,
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
    height: "100%",
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 60,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    tintColor: COLORS.gold,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  benefitsContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
    gap: 20,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(212,175,55,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 2,
  },
  benefitPrev: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  pricingContainer: {
    paddingHorizontal: 20,
  },
  guaranteeText: {
    textAlign: "center",
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    marginTop: 16,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.9)", // slightly distinct
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  subscribeButton: {
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  gradientButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default SubscriptionScreen;
