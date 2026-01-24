import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  Image,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Dimensions,
  Platform,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { COLORS } from "../../constants/colors";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const { width } = Dimensions.get("window");

/* =======================
   CUSTOM TAB BAR
======================= */
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const currentRouteName = state.routes[state.index].name;

  if (currentRouteName === "ai") {
    return null;
  }

  return (
    <View style={styles.tabBarContainer}>
      {/* Background Design */}
      <View style={styles.tabBarBackground}>
        <View style={styles.tabBarMain} />

        {/* Center AI Peak */}
        {/* Gold Design Lines - Continuous Highlight */}
        <View style={styles.goldLineTop} />

        {/* Center AI Highlight (Flat) */}
        <View style={styles.centerHighlight} />
      </View>

      {/* Tabs Content */}
      <View style={styles.tabContent}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isAI = route.name === "ai";
          const isSetting = route.name === "setting";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // Add Haptic Feedback
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              navigation.navigate(route.name);
            }
          };

          const Icon = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={[styles.tabItem, isAI && styles.aiTabItem]}
            >
              <View style={styles.tabItemContent}>
                {/* Active Glow for normal tabs */}
                {isFocused && !isAI && (
                  <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.activeIndicator}
                  />
                )}

                {/* AI Halo */}
                {isAI && (
                  <View
                    style={[styles.aiHalo, isFocused && styles.aiHaloActive]}
                  />
                )}

                {/* Icon */}
                {Icon && (
                  <View style={isFocused ? styles.iconActive : undefined}>
                    <Icon
                      size={isAI ? 32 : 22}
                      color={isFocused ? COLORS.gold : "rgba(212,175,55,0.45)"}
                      focused={isFocused}
                    />
                  </View>
                )}

                {/* Label - Fixed for 5 screens */}
                <Text
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={[
                    styles.tabLabel,
                    isAI && styles.aiLabel,
                    {
                      color: isFocused ? COLORS.gold : "rgba(212,175,55,0.45)",
                      fontWeight: isFocused ? "700" : "500",
                    },
                  ]}
                >
                  {options.title}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

/* =======================
   CLEAN TABS LAYOUT (ONLY 5 SCREENS)
======================= */
const TabsLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { colors, isDarkMode } = useTheme();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <CustomTabBar {...props} colors={colors} isDarkMode={isDarkMode} />
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("../../assets/images/Ai.png")}
              style={{
                width: size + 4,
                height: size + 4,
                tintColor: color,
                resizeMode: "contain",
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="shopping"
        options={{
          title: "Shopping",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cart" : "cart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorite",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 90,
  },
  tabBarBackground: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 70,
  },
  tabBarMain: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 70,
    backgroundColor: "#000",
  },
  goldLineTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: COLORS.gold,
  },
  centerHighlight: {
    position: "absolute",
    top: 0,
    left: width / 2 - 40,
    width: 80,
    height: "100%",
    backgroundColor: "rgba(212,175,55,0.05)",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabContent: {
    flexDirection: "row",
    height: "100%",
    alignItems: "flex-end",
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    height: 65,
    alignItems: "center",
    justifyContent: "center",
  },
  aiTabItem: {
    height: 65,
    justifyContent: "center",
    paddingTop: 0,
  },
  tabItemContent: {
    alignItems: "center",
    width: "100%",
  },
  activeIndicator: {
    position: "absolute",
    top: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(212,175,55,0.1)",
    zIndex: -1,
  },
  aiHalo: {
    position: "absolute",
    top: -6,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(212,175,55,0.05)",
    zIndex: -1,
  },
  aiHaloActive: {
    backgroundColor: "rgba(212,175,55,0.2)",
  },
  iconActive: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  aiLabel: {
    marginTop: 4,
  },
});

export default TabsLayout;
