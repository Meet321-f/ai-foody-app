import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import SafeScreen from "../components/SafeScreen";
import { BlurView } from "expo-blur";

const FAQ_DATA = [
  {
    id: "f1",
    category: "Generative AI",
    question: "How do I generate a recipe?",
    answer:
      "Go to the 'AI Chef' tab, enter your ingredients or a food craving, and tap 'Generate'. The AI will create a unique recipe just for you!",
  },
  {
    id: "f2",
    category: "Account",
    question: "How do I save my favorites?",
    answer:
      "Simply tap the heart icon on any recipe card. You can find all your saved recipes in the 'Favorites' section of your profile.",
  },
  {
    id: "f3",
    category: "Premium",
    question: "What is Gourmet Gold?",
    answer:
      "Gourmet Gold is our premium experience that offers faster AI generation, higher quality AI images, and exclusive access to the voice assistant.",
  },
  {
    id: "f4",
    category: "General",
    question: "Are the recipes accurate?",
    answer:
      "While our AI is highly advanced, it can occasionally make mistakes. We always recommend verifying measurements and cooking times, especially for meat and poultry.",
  },
];

const HelpSupportScreen = () => {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleEmailSupport = () => {
    const email = "meettailor.dev@gmail.com";
    const subject = "Foody Support Request";
    const body = `Hi Foody Team,\n\nI need help with...`;

    Linking.openURL(
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <Ionicons name="help-buoy-outline" size={60} color={COLORS.gold} />
            <Text style={styles.heroTitle}>How can we help you?</Text>
            <Text style={styles.heroSub}>
              Find answers or contact our gourmet team
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>

          {FAQ_DATA.map((item) => {
            const isExpanded = expandedIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}
                activeOpacity={0.7}
                onPress={() => toggleExpand(item.id)}
              >
                <View style={styles.faqHeader}>
                  <View style={styles.questionRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    <Text style={styles.questionText}>{item.question}</Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={COLORS.gold}
                  />
                </View>
                {isExpanded && (
                  <View style={styles.answerContainer}>
                    <View style={styles.answerDivider} />
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          <View style={styles.contactSection}>
            <View style={styles.card}>
              <BlurView
                intensity={30}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.contactContent}>
                <Ionicons
                  name="mail-unread-outline"
                  size={32}
                  color={COLORS.gold}
                />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactTitle}>Still need help?</Text>
                  <Text style={styles.contactSub}>
                    Our average response time is 24 hours.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.emailButton}
                  onPress={handleEmailSupport}
                >
                  <Text style={styles.emailButtonText}>Email Us</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Foody Support • V 1.0.1</Text>
            <Text style={styles.footerSub}>meettailor.dev@gmail.com</Text>
          </View>
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
  heroSection: {
    alignItems: "center",
    marginVertical: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
    marginTop: 16,
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.gold,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 16,
    marginLeft: 4,
  },
  faqCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.1)",
    overflow: "hidden",
  },
  faqCardExpanded: {
    borderColor: "rgba(212, 175, 55, 0.3)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  questionRow: {
    flex: 1,
    marginRight: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    color: COLORS.gold,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  answerDivider: {
    height: 1,
    backgroundColor: "rgba(212,175,55,0.15)",
    marginBottom: 16,
  },
  answerText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 22,
  },
  contactSection: {
    marginTop: 32,
    marginBottom: 40,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  contactContent: {
    padding: 24,
    alignItems: "center",
  },
  contactTextContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  contactSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
    textAlign: "center",
  },
  emailButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
  },
  emailButtonText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 15,
  },
  footer: {
    alignItems: "center",
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.3)",
    fontWeight: "600",
  },
  footerSub: {
    fontSize: 12,
    color: "rgba(212, 175, 55, 0.4)",
    marginTop: 4,
  },
});

export default HelpSupportScreen;
