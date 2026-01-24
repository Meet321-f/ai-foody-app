import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserProfile } from "../hooks/useUserProfile";
import { PROFILE_COLORS, profileStyles } from "../assets/styles/profile.styles";
import { LinearGradient } from "expo-linear-gradient";
import SafeScreen from "../components/SafeScreen";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "../constants/api";
import { Recipe } from "../types";
import { COLORS } from "../constants/colors";
import { BlurView } from "expo-blur";
import { StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";

const DEFAULT_IMAGE = require("../assets/images/default.png");

const MOCK_RECIPES = [
  {
    id: 1,
    title: "Ultimate Avocado Toast",
    time: "15m",
    calories: "320 kcal",
    rating: 4.8,
    image: "https://www.themealdb.com/images/media/meals/rwuyqx1511383174.jpg",
  },
  {
    id: 2,
    title: "Berry Bliss Bowl",
    time: "10m",
    calories: "210 kcal",
    rating: 4.9,
    image: "https://www.themealdb.com/images/media/meals/1529444830.jpg",
  },
  {
    id: 3,
    title: "Quinoa Super Salad",
    time: "25m",
    calories: "450 kcal",
    rating: 4.7,
    image: "https://www.themealdb.com/images/media/meals/1529443236.jpg",
  },
  {
    id: 4,
    title: "Margherita Pizza",
    time: "45m",
    calories: "600 kcal",
    rating: 4.6,
    image: "https://www.themealdb.com/images/media/meals/x0lk931587671540.jpg",
  },
];

const ProfileScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const { profile, updateProfile, refreshProfile } = useUserProfile();

  // No additional data loading needed here as we navigate to dedicated screens

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to make this work!",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      // base64: true, // If you plan to upload to Cloudinary directly or send to backend
    });

    if (!result.canceled) {
      const newImageUri = result.assets[0].uri;
      await updateProfile({ image: newImageUri });
    }
  };

  const menuItems = [
    {
      icon: "person",
      label: "Edit Profile",
      onPress: () => router.push("/edit-profile"),
    },
    {
      icon: "heart",
      label: "Favorites",
      onPress: () => router.push("/(tabs)/favorites"),
    },
    {
      icon: "book",
      label: "My Recipes",
      onPress: () => router.push("/my-recipes"),
    },
    {
      icon: "people",
      label: "Community Hub",
      onPress: () => {
        Alert.alert(
          "Coming Soon",
          "The Community Hub is currently under construction. Stay tuned for updates!",
          [{ text: "OK" }],
        );
      },
    },
    {
      icon: "settings",
      label: "Settings",
      onPress: () => router.push("/setting"),
    },
  ];

  const userEmail =
    user?.primaryEmailAddress?.emailAddress || profile?.email || "No Email";

  return (
    <SafeScreen>
      <View
        style={[
          profileStyles.container,
          { backgroundColor: "#000", paddingHorizontal: 20 },
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.gold} />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
              fontSize: 20,
              fontWeight: "900",
              color: COLORS.gold,
              letterSpacing: 2,
            }}
          >
            FOODY
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="ellipsis-vertical" size={24} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* UPGRADE BANNER */}
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => {
              if (Platform.OS !== "web")
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
              router.push("/subscription");
            }}
            style={{
              backgroundColor: "#D4AF37", // Gold
              borderRadius: 24,
              padding: 24,
              marginTop: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              shadowColor: "#D4AF37",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: "#000",
                  marginBottom: 8,
                }}
              >
                Upgrade to Gold Pro
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(0,0,0,0.7)",
                  lineHeight: 18,
                  marginBottom: 16,
                  fontWeight: "500",
                }}
              >
                Access 1,000+ exclusive chef-curated recipes.
              </Text>

              <View
                style={{
                  backgroundColor: "#000",
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 30,
                  alignSelf: "flex-start",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="ribbon" size={16} color={COLORS.gold} />
                <Text
                  style={{ color: "#FFF", fontWeight: "700", fontSize: 12 }}
                >
                  Join Elite
                </Text>
              </View>
            </View>

            {/* 3D Icon Placeholder */}
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: "#000",
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Ionicons name="trophy" size={40} color={COLORS.gold} />
              <LinearGradient
                colors={["transparent", "rgba(212,175,55,0.3)"]}
                style={StyleSheet.absoluteFill}
              />
            </View>
          </TouchableOpacity>

          {/* AVATAR SECTION */}
          <View
            style={{ alignItems: "center", marginTop: 40, marginBottom: 40 }}
          >
            <View style={{ position: "relative" }}>
              {/* Glow Effect */}
              <View
                style={{
                  position: "absolute",
                  top: -10,
                  left: -10,
                  right: -10,
                  bottom: -10,
                  borderRadius: 100,
                  borderWidth: 2,
                  borderColor: COLORS.gold,
                  shadowColor: COLORS.gold,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 20,
                  elevation: 20,
                  opacity: 0.5,
                }}
              />

              <TouchableOpacity onPress={handlePickImage}>
                <Image
                  source={
                    profile?.image ? { uri: profile.image } : DEFAULT_IMAGE
                  }
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    borderWidth: 3,
                    borderColor: COLORS.gold,
                  }}
                  contentFit="cover"
                />
              </TouchableOpacity>

              {/* Pro Badge */}
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 10,
                  backgroundColor: COLORS.gold,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: "#000",
                }}
              >
                <Text
                  style={{ fontSize: 10, fontWeight: "900", color: "#000" }}
                >
                  PRO
                </Text>
              </View>
            </View>

            <Text
              style={{
                color: "#FFF",
                fontSize: 24,
                fontWeight: "700",
                marginTop: 20,
                marginBottom: 4,
              }}
            >
              {profile?.name || user?.fullName || "Chef Guest"}
            </Text>
            <Text
              style={{
                color: COLORS.gold,
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Artisan Baker & Flavor Enthusiast
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 12,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              MEMBER SINCE OCT 2023
            </Text>
          </View>

          {/* MENU LIST */}
          <Text
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
              fontWeight: "800",
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Account & Community
          </Text>

          <View style={{ gap: 16 }}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  item.onPress();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "transparent",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: "rgba(255,255,255,0.08)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={COLORS.gold}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 16, fontWeight: "600", color: "#FFF" }}
                  >
                    {item.label}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="rgba(255,255,255,0.3)"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Legacy Tab Content Rendering (Hidden/Conditional if needed, or simplified) */}
          {/* For now, simplified to just the menu list as per design. 
              The actual content logic (Favorites/Recipes) would likely move to separate screens 
              or a nested navigation stack if this "Menu" style is strictly followed.
          */}
        </ScrollView>
      </View>
    </SafeScreen>
  );
};

export default ProfileScreen;
