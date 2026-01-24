import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import SafeScreen from "../components/SafeScreen";
import { COLORS } from "../constants/colors";
import { useUserProfile } from "../hooks/useUserProfile";
import { useUser } from "@clerk/clerk-expo";

const DEFAULT_IMAGE = require("../assets/images/default.png");

const EditProfileScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const { profile, updateProfile, refreshProfile } = useUserProfile();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
    if (profile?.image) setImageUri(profile.image);
    else if (user?.imageUrl) setImageUri(user.imageUrl);
  }, [profile, user]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permissions to change your photo.",
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
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        image: imageUri || undefined,
      });
      refreshProfile(); // Refresh context

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.gold} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
              <Image
                source={imageUri ? { uri: imageUri } : DEFAULT_IMAGE}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={20} color="#000" />
              </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.input, styles.disabledInput]}>
                <Text style={{ color: "rgba(255,255,255,0.5)" }}>
                  {user?.primaryEmailAddress?.emailAddress || "No Email"}
                </Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.gold,
    letterSpacing: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    padding: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.gold,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  changePhotoText: {
    color: COLORS.gold,
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 16,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  disabledInput: {
    opacity: 0.7,
  },
  saveButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 40,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  saveButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditProfileScreen;
