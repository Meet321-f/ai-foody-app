import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { API_URL } from "../constants/api";
import { useUser } from "@clerk/clerk-expo";
import SafeScreen from "../components/SafeScreen";
import { useUserProfile } from "../hooks/useUserProfile";

const CreateRecipeScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [isPublic, setIsPublic] = useState(true);
  const [dietType, setDietType] = useState<"veg" | "non-veg">("veg");

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photos to upload a recipe image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, ""]);
  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients.length ? newIngredients : [""]);
  };
  const updateIngredient = (text: string, index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = text;
    setIngredients(newIngredients);
  };

  const addStep = () => setInstructions([...instructions, ""]);
  const removeStep = (index: number) => {
    const newSteps = instructions.filter((_, i) => i !== index);
    setInstructions(newSteps.length ? newSteps : [""]);
  };
  const updateStep = (text: string, index: number) => {
    const newSteps = [...instructions];
    newSteps[index] = text;
    setInstructions(newSteps);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a recipe title.");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be signed in to share a recipe.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          ingredients: ingredients.filter((i) => i.trim()),
          instructions: instructions.filter((s) => s.trim()),
          image: image || null,
          cookTime: cookTime || "20 min",
          servings: servings || "2",
          userId: user.id,
          userName: profile?.name || user.fullName || "Chef",
          userImage: profile?.image || user.imageUrl,
          isPublic,
          dietType,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Recipe shared successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        throw new Error(result.error || "Failed to share recipe");
      }
    } catch (error: any) {
      console.error("Error sharing recipe:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to share recipe. Please try again.",
      );
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
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share My Recipe</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Image Picker */}
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={handlePickImage}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                style={styles.pickedImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="camera"
                  size={40}
                  color="rgba(255,255,255,0.3)"
                />
                <Text style={styles.placeholderText}>Add Food Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Recipe Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Grandma's Secret Pasta"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about your dish..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Diet Type</Text>
            <View style={styles.dietSelector}>
              <TouchableOpacity
                style={[
                  styles.dietOption,
                  dietType === "veg" && styles.dietOptionSelected,
                ]}
                onPress={() => setDietType("veg")}
              >
                <Ionicons
                  name="leaf"
                  size={20}
                  color={dietType === "veg" ? "#000" : "#4CAF50"}
                />
                <Text
                  style={[
                    styles.dietText,
                    dietType === "veg" && styles.dietTextSelected,
                  ]}
                >
                  Veg
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dietOption,
                  dietType === "non-veg" && styles.dietOptionSelectedNonVeg,
                ]}
                onPress={() => setDietType("non-veg")}
              >
                <Ionicons
                  name="restaurant"
                  size={20}
                  color={dietType === "non-veg" ? "#FFF" : "#FF5252"}
                />
                <Text
                  style={[
                    styles.dietText,
                    dietType === "non-veg" && styles.dietTextSelectedNonVeg,
                  ]}
                >
                  Non-Veg
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Cook Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="20 min"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={cookTime}
                  onChangeText={setCookTime}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Servings</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2 persons"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={servings}
                  onChangeText={setServings}
                />
              </View>
            </View>

            {/* Ingredients */}
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Ingredients</Text>
              <TouchableOpacity onPress={addIngredient}>
                <Ionicons name="add-circle" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            {ingredients.map((ing, index) => (
              <View key={index} style={styles.listInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder={`Ingredient ${index + 1}`}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={ing}
                  onChangeText={(text) => updateIngredient(text, index)}
                />
                <TouchableOpacity
                  onPress={() => removeIngredient(index)}
                  style={styles.removeBtn}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Steps */}
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Instructions</Text>
              <TouchableOpacity onPress={addStep}>
                <Ionicons name="add-circle" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            {instructions.map((step, index) => (
              <View key={index} style={styles.listInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder={`Step ${index + 1}`}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={step}
                  onChangeText={(text) => updateStep(text, index)}
                />
                <TouchableOpacity
                  onPress={() => removeStep(index)}
                  style={styles.removeBtn}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Public Toggle */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsPublic(!isPublic)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.toggleTitle}>Share with Community</Text>
                <Text style={styles.toggleSub}>
                  Everyone can see this recipe
                </Text>
              </View>
              <Ionicons
                name={isPublic ? "checkbox" : "square-outline"}
                size={28}
                color={isPublic ? COLORS.primary : "rgba(255,255,255,0.3)"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitText}>Share Recipe</Text>
              )}
            </TouchableOpacity>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imagePicker: {
    width: "90%",
    height: 200,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderStyle: "dashed",
    overflow: "hidden",
  },
  pickedImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "rgba(255,255,255,0.3)",
    marginTop: 10,
    fontSize: 14,
  },
  form: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  label: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 15,
    color: "#FFF",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    marginTop: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  listInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  removeBtn: {
    marginLeft: 10,
    padding: 10,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.05)",
    padding: 15,
    borderRadius: 15,
    marginTop: 30,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  toggleTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 18,
    alignItems: "center",
    marginTop: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  submitText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  dietSelector: {
    flexDirection: "row",
    gap: 15,
    marginTop: 5,
  },
  dietOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 8,
  },
  dietOptionSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  dietOptionSelectedNonVeg: {
    backgroundColor: "#FF5252",
    borderColor: "#FF5252",
  },
  dietText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    fontWeight: "600",
  },
  dietTextSelected: {
    color: "#000",
  },
  dietTextSelectedNonVeg: {
    color: "#FFF",
  },
});

export default CreateRecipeScreen;
