import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@clerk/clerk-expo";
import { useUserProfile } from "../hooks/useUserProfile";
import { useTheme } from "../contexts/ThemeContext";
import { COLORS } from "../constants/colors";
import SafeScreen from "../components/SafeScreen";
import { BlurView } from "expo-blur";

const DEFAULT_IMAGE = require("../assets/images/default.png");

const SettingsScreen = () => {
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile } = useUserProfile();
  const { isDarkMode, toggleTheme } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleToggleNotifications = () =>
    setNotificationsEnabled((prev) => !prev);

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
          {/* PROFILE SECTION */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[COLORS.gold, COLORS.amber || "#F59E0B"]}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image
                  source={
                    profile?.image ? { uri: profile.image } : DEFAULT_IMAGE
                  }
                  style={styles.profileImage}
                  contentFit="cover"
                />
              </LinearGradient>
              <View style={styles.statusDot} />
            </View>
            <Text style={styles.profileName}>
              {profile?.name || "Guest User"}
            </Text>
            <Text style={styles.profileEmail}>
              {profile?.email || "Sign in to sync data"}
            </Text>

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => handlePress("profile")}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
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
              icon="person-outline"
              label="Profile Details"
              onPress={() => handlePress("profile")}
              iconColor="#FF9F43"
            />
            <View style={styles.divider} />
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
              onPress={() => handlePress("help")}
              iconColor="#54A0FF"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="chatbubble-ellipses-outline"
              label="Send Feedback"
              onPress={() => handlePress("rate")}
              iconColor="#5F27CD"
            />
          </View>

          {/* LOGOUT */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => handlePress("logout")}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Version 1.0.0</Text>
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
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 10,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarGradient: {
    padding: 3,
    borderRadius: 60,
    elevation: 10,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#000",
  },
  statusDot: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2ECC71",
    borderWidth: 3,
    borderColor: "#000",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  editProfileButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  editProfileText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    paddingVertical: 16,
    borderRadius: 24,
    marginTop: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.2)",
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 24,
    opacity: 0.5,
  },
});

export default SettingsScreen;
