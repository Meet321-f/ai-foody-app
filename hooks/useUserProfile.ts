import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  getUserProfile,
  UserProfile,
  initDB,
  saveUserProfile,
} from "../services/db";

export const useUserProfile = () => {
  // Use a default state initially
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = useCallback(() => {
    initDB(); // Ensure DB is ready
    const data = getUserProfile();
    setProfile(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const currentProfile = profile || { name: "", email: "", image: "" };
      const newProfile = { ...currentProfile, ...updates };

      saveUserProfile(newProfile.name, newProfile.email, newProfile.image);
      setProfile(newProfile as UserProfile);
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      // Simulate network request if needed, or just save
      await updateProfile({ image: uri });
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  return {
    profile,
    loading,
    refreshProfile: fetchProfile,
    updateProfile,
    uploadImage,
    uploading,
  };
};
