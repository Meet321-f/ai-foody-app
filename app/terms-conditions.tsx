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

const TermsConditionsScreen = () => {
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

  const WarningBox = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.warningBox}>
      <View style={styles.warningHeader}>
        <Ionicons name="warning-outline" size={20} color="#EE5A6F" />
        <Text style={styles.warningTitle}>{title}</Text>
      </View>
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
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.effectiveDate}>
            Effective Date: February 12, 2026
          </Text>

          <Section title="1. Agreement to Terms">
            <Text style={styles.text}>
              By accessing or using the Foody app, you agree to be bound by
              these Terms and Conditions. If you do not agree, please do not use
              the service.
            </Text>
          </Section>

          <Section title="2. Use of AI Services">
            <WarningBox title="CULINARY DISCLAIMER">
              <Text style={styles.warningText}>
                Foody uses AI to generate recipes and images. These are for
                informational purposes only.
              </Text>
              <BulletPoint text="AI may generate inaccurate measurements or steps." />
              <BulletPoint text="Users are responsible for verifying ingredient safety (allergies)." />
              <BulletPoint text="Foody is not liable for kitchen mishaps or health issues." />
            </WarningBox>
          </Section>

          <Section title="3. User Accounts">
            <Text style={styles.text}>
              You are responsible for maintaining the security of your account
              (managed via Clerk). Foody reserves the right to terminate
              accounts that violate our terms.
            </Text>
          </Section>

          <Section title="4. Intellectual Property">
            <Text style={styles.subTitle}>Our Content</Text>
            <Text style={styles.text}>
              The design, logo, and code of Foody are property of the
              development team.
            </Text>
            <Text style={[styles.subTitle, { marginTop: 16 }]}>
              Generated Recipes
            </Text>
            <Text style={styles.text}>
              Recipes you generate are yours for personal use. Publicly shared
              recipes grant Foody a license to display them.
            </Text>
          </Section>

          <Section title="5. Prohibited Conduct">
            <BulletPoint text="No illegal or unauthorized use." />
            <BulletPoint text="No hacking or disrupting app servers." />
            <BulletPoint text="No automated scraping of recipe data." />
          </Section>

          <Section title="6. Limitation of Liability">
            <Text style={styles.text}>
              To the extent permitted by law, Foody is not liable for any
              damages resulting from app used, including culinary failures or
              data loss.
            </Text>
          </Section>

          <Section title="7. Governing Law">
            <Text style={styles.text}>
              These terms are governed by the laws of India.
            </Text>
          </Section>

          <TouchableOpacity
            style={styles.webButton}
            onPress={() =>
              Linking.openURL(
                "https://meet321-f.github.io/foody-privacy/terms.html",
              )
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
              Gourmet Gold Experience
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
  warningBox: {
    backgroundColor: "rgba(238, 90, 111, 0.05)",
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(238, 90, 111, 0.2)",
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#EE5A6F",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  warningText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
    fontWeight: "600",
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

export default TermsConditionsScreen;
