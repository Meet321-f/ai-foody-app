import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  TextInput,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useUserProfile } from "../hooks/useUserProfile";
import { useTheme } from "../contexts/ThemeContext";
import { COLORS } from "../constants/colors";
import SafeScreen from "../components/SafeScreen";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

const DEFAULT_IMAGE = require("../assets/images/default.png");

// Internal routes are used for Privacy Policy and Terms & Conditions
const PRIVACY_POLICY_URL = "https://meet321-f.github.io/foody-privacy/";
const TERMS_CONDITION_URL =
  "https://meet321-f.github.io/foody-privacy/terms.html";

const SettingsScreen = () => {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { profile, updateProfile } = useUserProfile();
  const { isDarkMode, toggleTheme } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newName, setNewName] = useState(profile?.name || "");
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    if (profile?.name) {
      setNewName(profile.name);
    }
  }, [profile?.name]);

  const handleSaveName = async () => {
    if (newName.trim() === "") {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    setIsSavingName(true);
    try {
      await updateProfile({ name: newName });
      console.log("name is change successfully");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error updating name:", error);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleToggleNotifications = () =>
    setNotificationsEnabled((prev) => !prev);

  // Safe External Link Opener
  const openExternalLink = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Unable to Open", "Cannot open the link at the moment.");
      }
    } catch (error) {
      console.error("Link opening error:", error);
      Alert.alert("Error", "Something went wrong while opening the link.");
    }
  }, []);

  const handlePress = async (route: string) => {
    console.log("Navigate to:", route);
    try {
      if (route === "profile") {
        router.push("/profile");
      } else if (route === "logout") {
        Alert.alert("Logout", "Are you sure you want to sign out?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              await signOut();
              router.replace("/(auth)/sign-in");
            },
          },
        ]);
      } else if (route === "delete-account") {
        Alert.alert(
          "Delete Account",
          "Are you sure you want to delete your account? This action is permanent and cannot be undone.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await user?.delete();
                  router.replace("/(auth)/sign-in");
                } catch (error) {
                  console.error("Error deleting account:", error);
                  Alert.alert(
                    "Error",
                    "Failed to delete account. Please try again.",
                  );
                }
              },
            },
          ],
        );
      } else if (route === "admin-reports") {
        router.push("/admin/reports");
      }
    } catch (error) {
      console.error("Navigation error pushing route:", route, error);
    }
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Animated Background Effect could be added here if needed */}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Foody</Text>
          <View style={styles.badge}>
            <Ionicons name="ribbon" size={14} color={COLORS.gold} />
            <Text style={styles.badgeText}>Gourmet Gold</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* PROFILE SECTION - REDESIGNED */}
          <View style={styles.profileCard}>
            <BlurView
              intensity={40}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.profileCardContent}>
              <View style={styles.cardRow}>
                <Ionicons name="person-outline" size={20} color={COLORS.gold} />
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardLabel}>Full Name</Text>
                  <TextInput
                    style={styles.cardInput}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Enter your name"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
                {newName !== profile?.name && (
                  <TouchableOpacity
                    onPress={handleSaveName}
                    disabled={isSavingName}
                    style={{
                      padding: 8,
                      backgroundColor: "rgba(212,175,55,0.15)",
                      borderRadius: 10,
                    }}
                  >
                    <Ionicons
                      name={isSavingName ? "refresh" : "checkmark"}
                      size={20}
                      color={COLORS.gold}
                    />
                  </TouchableOpacity>
                )}
                {newName === profile?.name && (
                  <Ionicons
                    name="create-outline"
                    size={16}
                    color="rgba(212,175,55,0.5)"
                  />
                )}
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardRow}>
                <Ionicons name="mail-outline" size={20} color={COLORS.gold} />
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardLabel}>Email Address</Text>
                  <Text style={styles.cardValue}>
                    {user?.primaryEmailAddress?.emailAddress ||
                      profile?.email ||
                      "Guest User"}
                  </Text>
                </View>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color="rgba(255,255,255,0.2)"
                />
              </View>
            </View>
          </View>

          {/* ACCOUNT SECTION */}
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <BlurView
              intensity={30}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <SettingRow
              icon="shield-checkmark-outline"
              label="Security"
              onPress={() => handlePress("privacy")}
              iconColor="#2ECC71"
            />
          </View>

          {/* PREFERENCES SECTION */}
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <BlurView
              intensity={30}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <SettingRowWithSwitch
              icon="notifications-outline"
              label="Notifications"
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              iconColor="#EE5253"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="language-outline"
              label="Language"
              value="English"
              onPress={() => handlePress("language")}
              iconColor="#00D2D3"
            />
            <View style={styles.divider} />
            <SettingRowWithSwitch
              icon="moon-outline"
              label="Dark Mode"
              value={isDarkMode}
              onValueChange={toggleTheme}
              iconColor="#FECA57"
            />
          </View>

          {/* SUPPORT SECTION */}
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <BlurView
              intensity={30}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <SettingRow
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => router.push("/help-support")}
              iconColor="#54A0FF"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="chatbubble-ellipses-outline"
              label="Send Feedback"
              onPress={() => router.push("/feedback")}
              iconColor="#5F27CD"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="document-text-outline"
              label="Privacy Policy"
              onPress={() => router.push("/privacy-policy")}
              iconColor="#10AC84"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="reader-outline"
              label="Terms & Conditions"
              onPress={() => router.push("/terms-conditions")}
              iconColor="#F39C12"
            />
          </View>

          {/* ADMIN SECTION */}
          <Text style={styles.sectionTitle}>Administrator</Text>
          <View style={styles.card}>
            <BlurView
              intensity={30}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <SettingRow
              icon="stats-chart-outline"
              label="AI Content Reports"
              onPress={() => handlePress("admin-reports")}
              iconColor={COLORS.gold}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="chatbubbles-outline"
              label="User Feedback"
              onPress={() => router.push("/admin/feedback")}
              iconColor={COLORS.gold}
            />
          </View>

          {/* ACCOUNT ACTIONS */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => handlePress("logout")}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handlePress("delete-account")}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>Version 1.0.1</Text>
        </ScrollView>
      </View>
    </SafeScreen>
  );
};

// --- COMPONENTS ---

const SettingRow = ({ icon, label, value, onPress, iconColor }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.6} style={styles.row}>
    <View style={styles.rowLeft}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: `${iconColor}15`, borderColor: `${iconColor}30` },
        ]}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <View style={styles.rowRight}>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={COLORS.gold}
        style={{ opacity: 0.5 }}
      />
    </View>
  </TouchableOpacity>
);

const SettingRowWithSwitch = ({
  icon,
  label,
  value,
  onValueChange,
  iconColor,
}: any) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: `${iconColor}15`, borderColor: `${iconColor}30` },
        ]}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "rgba(255,255,255,0.1)", true: COLORS.gold }}
      thumbColor={"#FFF"}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Should be #000 for Gourmet Gold
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: -0.5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  badgeText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  profileCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 20,
  },
  profileCardContent: {
    padding: 20,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardInput: {
    fontSize: 17,
    color: "#FFF",
    fontWeight: "600",
    padding: 0,
  },
  cardValue: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    marginVertical: 16,
    marginLeft: 36,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.gold,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 24,
    marginLeft: 4,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowValue: {
    fontSize: 15,
    color: COLORS.textLight,
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    marginLeft: 72,
  },
  actionSection: {
    marginTop: 32,
    gap: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.2)",
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  deleteText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
    opacity: 0.8,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 32,
    opacity: 0.5,
  },
});

export default SettingsScreen;
