import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { COLORS } from "../constants/colors";

const { width, height } = Dimensions.get("window");

interface AppBackgroundProps {
  children?: React.ReactNode;
}

const AppBackground = ({ children }: AppBackgroundProps) => {
  return (
    <View style={styles.container}>
      {/* Base Black Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }]} />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppBackground;
