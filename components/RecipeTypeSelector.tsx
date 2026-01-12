import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { BlurView } from "expo-blur";
import { COLORS } from "../constants/colors";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface RecipeTypeSelectorProps {
  selectedType: "indian" | "others";
  onSelectType: (type: "indian" | "others") => void;
}

export default function RecipeTypeSelector({
  selectedType,
  onSelectType,
}: RecipeTypeSelectorProps) {
  const handlePress = (type: "indian" | "others") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onSelectType(type);
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
        <View style={styles.selectorWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handlePress("others")}
            style={[
              styles.option,
              selectedType === "others" && styles.selectedOption,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                selectedType === "others" && styles.selectedOptionText,
              ]}
            >
              🌍 Others
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handlePress("indian")}
            style={[
              styles.option,
              selectedType === "indian" && styles.selectedOption,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                selectedType === "indian" && styles.selectedOptionText,
              ]}
            >
              🥘 Indian Recipes
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 5,
  },
  blurContainer: {
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  selectorWrapper: {
    flexDirection: "row",
    padding: 6,
    gap: 8,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  optionText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  selectedOptionText: {
    color: "#000",
    fontWeight: "800",
  },
});
