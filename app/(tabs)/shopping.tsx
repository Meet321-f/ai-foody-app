import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import SafeScreen from "../../components/SafeScreen";
import { COLORS } from "../../constants/colors";
import { ShoppingGroup, ShoppingItem } from "../../types";

const { width } = Dimensions.get("window");

const ShoppingScreen = () => {
  const [shoppingGroups, setShoppingGroups] = useState<ShoppingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use useFocusEffect to reload list whenever tab is opened
  useFocusEffect(
    useCallback(() => {
      loadShoppingList(false);
    }, []),
  );

  const loadShoppingList = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const storedList = await AsyncStorage.getItem("shoppingList");
      if (storedList) {
        const parsed = JSON.parse(storedList);

        // Handle migration from old flat string array if needed
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          typeof parsed[0] === "string"
        ) {
          const migrated: ShoppingGroup = {
            recipeId: "general",
            recipeTitle: "General Items",
            items: (parsed as string[]).map((name, i) => ({
              id: `gen-${i}`,
              name,
              checked: false,
            })),
          };
          setShoppingGroups([migrated]);
        } else {
          setShoppingGroups(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading shopping list:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (groupId: string, itemId: string) => {
    const updatedGroups = shoppingGroups.map((group) => {
      if (group.recipeId === groupId) {
        return {
          ...group,
          items: group.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item,
          ),
        };
      }
      return group;
    });
    setShoppingGroups(updatedGroups);
    await AsyncStorage.setItem("shoppingList", JSON.stringify(updatedGroups));
  };

  const removeGroup = async (recipeId: string) => {
    const updated = shoppingGroups.filter((g) => g.recipeId !== recipeId);
    setShoppingGroups(updated);
    await AsyncStorage.setItem("shoppingList", JSON.stringify(updated));
  };

  const clearShoppingList = () => {
    Alert.alert("Clear All?", "Clear your entire shopping list?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          setShoppingGroups([]);
          await AsyncStorage.removeItem("shoppingList");
        },
      },
    ]);
  };

  const totalItems = shoppingGroups.reduce((acc, g) => acc + g.items.length, 0);
  const remainingItems = shoppingGroups.reduce(
    (acc, g) => acc + g.items.filter((i) => !i.checked).length,
    0,
  );

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Shopping List</Text>
            <Text style={styles.subtitle}>
              {remainingItems} items remaining
            </Text>
          </View>
          {totalItems > 0 && (
            <TouchableOpacity
              onPress={clearShoppingList}
              style={styles.clearBtn}
            >
              <Ionicons name="trash-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {shoppingGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="cart-outline"
                  size={50}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>Your Pantry Awaits</Text>
              <Text style={styles.emptySub}>
                Add ingredients from recipes to start your luxury culinary
                collection.
              </Text>
            </View>
          ) : (
            shoppingGroups.map((group) => (
              <BlurView
                key={group.recipeId}
                intensity={20}
                style={styles.groupCard}
              >
                <View style={styles.groupHeader}>
                  <Text style={styles.recipeTitle}>{group.recipeTitle}</Text>
                  <TouchableOpacity onPress={() => removeGroup(group.recipeId)}>
                    <Ionicons
                      name="close"
                      size={20}
                      color="rgba(255,255,255,0.3)"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.itemsList}>
                  {group.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.itemRow}
                      onPress={() => toggleItem(group.recipeId, item.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          item.checked && styles.checkboxChecked,
                        ]}
                      >
                        {item.checked && (
                          <Ionicons name="checkmark" size={14} color="#000" />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.itemName,
                          item.checked && styles.itemCheckedText,
                        ]}
                      >
                        {item.name}
                      </Text>
                      {item.quantity && (
                        <Text style={styles.itemQty}>{item.quantity}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </BlurView>
            ))
          )}
        </ScrollView>

        {totalItems > 0 && (
          <LinearGradient
            colors={[COLORS.primary, "#FFD700"]}
            style={styles.fab}
          >
            <Text style={styles.fabText}>Add Ingredients</Text>
          </LinearGradient>
        )}
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
    fontFamily: Platform.OS === "ios" ? "Arial" : "sans-serif", // Fallback if Lexend not loaded
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    marginTop: 4,
  },
  clearBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  groupCard: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  groupHeader: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  recipeTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  itemsList: {
    padding: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  itemName: {
    fontSize: 15,
    color: "#FFF",
    fontWeight: "500",
    flex: 1,
  },
  itemCheckedText: {
    textDecorationLine: "line-through",
    color: "rgba(255,255,255,0.3)",
  },
  itemQty: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(212, 175, 55, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 12,
  },
  emptySub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 20,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  fabText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "900",
  },
});
export default ShoppingScreen;
