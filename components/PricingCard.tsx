import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description?: string;
  isSelected?: boolean;
  isBestValue?: boolean;
  onPress: () => void;
}

const PricingCard = ({
  title,
  price,
  period,
  description,
  isSelected,
  isBestValue,
  onPress,
}: PricingCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        { transform: [{ scale: isSelected ? 1.02 : 1 }] },
      ]}
    >
      {isSelected && (
        <LinearGradient
          colors={[COLORS.gold, "rgba(212,175,55,0.2)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Background for unselected to keep it dark */}
      <View style={[styles.innerContent, isSelected && styles.selectedInner]}>
        <View style={styles.header}>
          <Text
            style={[styles.title, isSelected ? styles.textGold : styles.text]}
          >
            {title}
          </Text>
          {isBestValue && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>BEST VALUE</Text>
            </View>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.currency, isSelected && styles.textGold]}>
            ₹
          </Text>
          <Text style={[styles.price, isSelected && styles.textGold]}>
            {price}
          </Text>
          <Text style={[styles.period, isSelected && styles.textGoldLight]}>
            /{period}
          </Text>
        </View>

        {description && (
          <Text
            style={[styles.description, isSelected && styles.textGoldLight]}
          >
            {description}
          </Text>
        )}

        <View style={styles.radioContainer}>
          <View style={[styles.radioOuter, isSelected && styles.radioActive]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  selectedContainer: {
    borderColor: COLORS.gold,
    borderWidth: 2,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  innerContent: {
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedInner: {
    backgroundColor: "#000", // Keep background black inside the gradient border effect
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  text: {
    color: "#FFF",
  },
  textGold: {
    color: COLORS.gold,
  },
  textGoldLight: {
    color: "rgba(212,175,55,0.8)",
  },
  badge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "900",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currency: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    marginRight: 2,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF",
  },
  period: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginLeft: 2,
  },
  description: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
  },
  radioContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  radioActive: {
    borderColor: COLORS.gold,
    backgroundColor: "rgba(212,175,55,0.1)",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gold,
  },
});

export default PricingCard;
