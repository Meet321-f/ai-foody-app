import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import SafeScreen from "../components/SafeScreen";

const PrivacyPolicyScreen = () => {
  const router = useRouter();

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const BulletPoint = ({ text }: { text: string }) => (
    <View style={styles.bulletRow}>
      <Ionicons
        name="chevron-forward"
        size={12}
        color={COLORS.gold}
        style={styles.bulletIcon}
      />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );

  const HighlightBox = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.highlightBox}>
      <Text style={styles.highlightTitle}>{title}</Text>
      {children}
    </View>
  );

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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.effectiveDate}>
            Effective Date: February 12, 2026
          </Text>

          <Section title="1. Introduction">
            <Text style={styles.text}>
              Welcome to Foody. We are committed to protecting your privacy and
              ensuring transparency about how we collect, use, and safeguard
              your information.
            </Text>
          </Section>

          <Section title="2. Eligibility">
            <Text style={styles.text}>
              Foody is intended for users aged 13 years and older. We do not
              knowingly collect personal data from children under 13.
            </Text>
          </Section>

          <Section title="3. Information We Collect">
            <Text style={styles.subTitle}>Information You Provide</Text>
            <BulletPoint text="Name and Email address" />
            <BulletPoint text="Cooking preferences" />
            <BulletPoint text="Recipes you generate using AI" />

            <Text style={[styles.subTitle, { marginTop: 16 }]}>
              Information Collected Automatically
            </Text>
            <BulletPoint text="Device type and OS version" />
            <BulletPoint text="App usage data and crash logs" />
            <BulletPoint text="IP address" />

            <HighlightBox title="We Do NOT Collect">
              <BulletPoint text="Location data (GPS)" />
              <BulletPoint text="Payment information" />
              <BulletPoint text="Contacts or Address book" />
            </HighlightBox>
          </Section>

          <Section title="4. Permissions We Request">
            <Text style={styles.text}>
              To provide a full experience, we may request:
            </Text>
            <BulletPoint text="Camera & Photo Library: For profile and recipe images." />
            <BulletPoint text="Vibration: For haptic feedback." />
          </Section>

          <Section title="5. How We Use Your Information">
            <BulletPoint text="To manage your user account." />
            <BulletPoint text="To generate personalized AI recipes." />
            <BulletPoint text="To improve app functionality." />
            <BulletPoint text="To ensure security and prevent fraud." />
          </Section>

          <Section title="6. Third-Party Services">
            <Text style={styles.text}>
              We use trusted partners for core features:
            </Text>
            <BulletPoint text="Clerk: Authentication" />
            <BulletPoint text="OpenRouter: AI Recipe Generation" />
            <BulletPoint text="AIGurulab: AI Image Generation" />
          </Section>

          <Section title="7. Data Retention">
            <Text style={styles.text}>
              We retain data only as long as necessary. Account data is deleted
              within 30 days of a deletion request. Crash logs are kept for 90
              days.
            </Text>
          </Section>

          <Section title="8. Your Rights">
            <Text style={styles.text}>
              You have the right to access, correct, or delete your data anytime
              through app settings or by contacting us at
              meettailor.dev@gmail.com.
            </Text>
          </Section>

          <TouchableOpacity
            style={styles.webButton}
            onPress={() =>
              Linking.openURL("https://meet321-f.github.io/foody-privacy/")
            }
          >
            <Ionicons name="globe-outline" size={20} color={COLORS.gold} />
            <Text style={styles.webButtonText}>View Website Version</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2026 Foody. All Rights Reserved.
            </Text>
            <Text style={[styles.footerText, { marginTop: 4 }]}>
              Developed in India
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || "#0D0D0D",
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
  effectiveDate: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.gold,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingRight: 10,
  },
  bulletIcon: {
    marginTop: 4,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 22,
  },
  highlightBox: {
    backgroundColor: "rgba(212, 175, 55, 0.05)",
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.gold,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  webButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(212, 175, 55, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    marginTop: 8,
    marginBottom: 20,
  },
  webButtonText: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 10,
  },
  footer: {
    marginTop: 20,
    paddingBottom: 40,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 30,
  },
  footerText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "500",
  },
});

export default PrivacyPolicyScreen;
