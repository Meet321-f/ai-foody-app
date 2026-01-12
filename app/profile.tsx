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

const DEFAULT_IMAGE = require("../assets/images/default.png");

const TABS = ["Favorite", "My Recipes", "AI Recipes"];

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
  const [activeTab, setActiveTab] = useState("Favorite");
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingGenerated, setLoadingGenerated] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (profile?.name) {
      setEditName(profile.name);
    }
  }, [profile]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;
      if (activeTab === "Favorite") {
        // Only fetch when tab is active
        setLoadingFavorites(true);
        try {
          const response = await fetch(`${API_URL}/favorites/${user.id}`);
          if (response.ok) {
            const favorites = await response.json();
            const transformedFavorites = favorites.map((favorite: any) => ({
              ...favorite,
              id: favorite.recipeId,
            }));
            setFavoriteRecipes(transformedFavorites);
          }
        } catch (error) {
          console.log("Error loading favorites", error);
        } finally {
          setLoadingFavorites(false);
        }
      }
    };
    loadFavorites();
  }, [user?.id, activeTab]);

  useEffect(() => {
    const loadGenerated = async () => {
      if (!user) return;
      if (activeTab === "AI Recipes") {
        setLoadingGenerated(true);
        try {
          const response = await fetch(`${API_URL}/ai/history/${user.id}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setGeneratedRecipes(result.data);
            }
          }
        } catch (error) {
          console.log("Error loading generated recipes", error);
        } finally {
          setLoadingGenerated(false);
        }
      }
    };
    loadGenerated();
  }, [user?.id, activeTab]);

  const handleSaveProfile = async () => {
    if (editName.trim()) {
      await updateProfile({ name: editName });
      setIsEditing(false);
      refreshProfile();
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      handleSaveProfile();
    } else {
      setEditName(profile?.name || user?.fullName || "");
      setIsEditing(true);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const newImageUri = result.assets[0].uri;
      await updateProfile({ image: newImageUri });
    }
  };

  const renderContent = () => {
    if (activeTab === "Favorite") {
      if (loadingFavorites) {
        return (
          <Text style={{ color: "#fff", textAlign: "center", marginTop: 20 }}>
            Loading favorites...
          </Text>
        );
      }
      if (favoriteRecipes.length === 0) {
        return (
          <Text
            style={{
              color: "rgba(255,255,255,0.5)",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            No favorites yet.
          </Text>
        );
      }
      return (
        <View style={profileStyles.gridContainer}>
          {favoriteRecipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={profileStyles.recipeCard}
              activeOpacity={0.8}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
            >
              <Image
                source={{ uri: recipe.image }}
                style={profileStyles.recipeImage}
                contentFit="cover"
                transition={500}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.6)", "#000000"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0.4 }}
                end={{ x: 0.5, y: 1 }}
              />
              <TouchableOpacity style={profileStyles.heartButton}>
                <Ionicons name="heart" size={18} color={COLORS.primary} />
              </TouchableOpacity>

              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 16,
                }}
              >
                <Text style={profileStyles.recipeTitle} numberOfLines={2}>
                  {recipe.title}
                </Text>
                <View style={profileStyles.recipeMeta}>
                  {recipe.time && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons name="time" size={12} color={COLORS.primary} />
                      <Text style={profileStyles.metaText}>{recipe.time}</Text>
                    </View>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Ionicons name="flash" size={12} color={COLORS.primary} />
                    <Text style={profileStyles.metaText}>Pro</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    if (activeTab === "AI Recipes") {
      if (loadingGenerated) {
        return (
          <Text style={{ color: "#fff", textAlign: "center", marginTop: 20 }}>
            Loading AI recipes...
          </Text>
        );
      }
      if (generatedRecipes.length === 0) {
        return (
          <Text
            style={{
              color: "rgba(255,255,255,0.5)",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            No AI recipes generated yet.
          </Text>
        );
      }
      return (
        <View style={profileStyles.gridContainer}>
          {generatedRecipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={profileStyles.recipeCard}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: `/recipe/${recipe.id}`,
                  params: { fullRecipe: JSON.stringify(recipe) },
                })
              }
            >
              <Image
                source={{ uri: recipe.image }}
                style={profileStyles.recipeImage}
                contentFit="cover"
                transition={500}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.6)", "#000000"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0.4 }}
                end={{ x: 0.5, y: 1 }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 16,
                }}
              >
                <Text style={profileStyles.recipeTitle} numberOfLines={2}>
                  {recipe.title}
                </Text>
                <View style={profileStyles.recipeMeta}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Ionicons name="time" size={12} color={COLORS.primary} />
                    <Text style={profileStyles.metaText}>
                      {recipe.cookTime || "20m"}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Ionicons name="flash" size={12} color={COLORS.primary} />
                    <Text style={profileStyles.metaText}>AI</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    // Blank state for other tabs
    return (
      <View
        style={{
          flex: 1,
          height: 200,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
          No content available yet.
        </Text>
      </View>
    );
  };

  const userEmail =
    user?.primaryEmailAddress?.emailAddress || profile?.email || "No Email";

  return (
    <SafeScreen>
      <View
        style={[profileStyles.container, { backgroundColor: "transparent" }]}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={profileStyles.header}>
            <Text style={profileStyles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={profileStyles.iconButton}
              onPress={() => router.push("/setting")}
            >
              <Ionicons name="settings-sharp" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Bio Section */}
          <View style={profileStyles.bioSection}>
            <View style={profileStyles.imageContainer}>
              <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
                <Image
                  source={
                    profile?.image ? { uri: profile.image } : DEFAULT_IMAGE
                  }
                  style={profileStyles.profileImage}
                  contentFit="cover"
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    padding: 6,
                    borderRadius: 20,
                  }}
                >
                  <Ionicons name="camera" size={20} color="#FFF" />
                </View>
              </TouchableOpacity>
            </View>

            {isEditing ? (
              <TextInput
                style={profileStyles.editInput}
                value={editName}
                onChangeText={setEditName}
                autoFocus
                placeholder="Enter Name"
                placeholderTextColor="rgba(255,255,255,0.4)"
              />
            ) : (
              <Text style={profileStyles.name}>
                {profile?.name || user?.fullName || "Guest User"}
              </Text>
            )}

            <Text style={profileStyles.email}>{userEmail}</Text>
            <Text style={profileStyles.bio}>Vegan Baker & Food Enthusiast</Text>
          </View>

          {/* Stats */}
          {/* Stats removed as requested */}

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={profileStyles.editButton}
            activeOpacity={0.9}
            onPress={toggleEdit}
          >
            <Ionicons
              name={isEditing ? "checkmark" : "pencil"}
              size={18}
              color="#FFF"
            />
            <Text style={profileStyles.editButtonText}>
              {isEditing ? "Save Profile" : "Edit Profile"}
            </Text>
          </TouchableOpacity>

          {/* Tabs */}
          <View style={profileStyles.tabBar}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={profileStyles.tabItem}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    profileStyles.tabText,
                    activeTab === tab && profileStyles.activeTypeText,
                  ]}
                >
                  {tab}
                </Text>
                {activeTab === tab && (
                  <View style={profileStyles.activeTabIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          {renderContent()}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </SafeScreen>
  );
};

export default ProfileScreen;
