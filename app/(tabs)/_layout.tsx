import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Platform,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { COLORS } from "../../constants/colors";

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
  colors,
  isDarkMode,
}: any) => {
  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const focusedOptions = focusedDescriptor.options;

  // Hide tab bar if specified in options or for specific routes
  if (
    focusedOptions.tabBarStyle?.display === "none" ||
    focusedRoute.name === "ai"
  ) {
    return null;
  }

  return (
    <View style={styles.tabBarContainer}>
      <BlurView
        intensity={Platform.OS === "ios" ? 40 : 80}
        tint="dark"
        style={styles.tabBar}
      >
        {state.routes.map((route: any, index: any) => {
          const { options } = descriptors[route.key];

          // Skip hidden tabs like 'setting' if href is null
          if (options.href === null) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          // Render Icon
          const Icon = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconContainer,
                  isFocused && styles.activeIconContainer,
                ]}
              >
                {Icon && (
                  <Icon
                    color={
                      isFocused ? colors.primary : "rgba(255, 255, 255, 0.4)"
                    }
                    size={24}
                    focused={isFocused}
                  />
                )}
              </View>
              {isFocused && (
                <Text style={styles.tabLabel}>{options.title}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
};

const TabsLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { colors, isDarkMode } = useTheme();

  if (!isLoaded) return null;

  if (!isSignedIn) return <Redirect href={"/(auth)/sign-in"} />;

  return (
    <Tabs
      tabBar={(props) => (
        <CustomTabBar {...props} colors={colors} isDarkMode={isDarkMode} />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* AI Tab (custom icon) */}
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          tabBarStyle: { display: "none" },
          tabBarIcon: ({ color, size, focused }) => (
            <Image
              source={require("../../assets/images/Ai.png")}
              style={{
                width: size + 2,
                height: size + 2,
                tintColor: color, // Use color passed from parent which handles theme
                resizeMode: "contain",
              }}
            />
          ),
        }}
      />

      {/* Search Tab */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Shopping Tab */}
      <Tabs.Screen
        name="shopping"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Favorites Tab */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Likes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(10, 10, 10, 0.9)", // Deeper black for luxury feel
    borderRadius: 35,
    height: 70,
    paddingHorizontal: 10,
    width: "100%",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(212, 175, 55, 0.3)", // Subtle Gold edge
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconContainer: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    transform: [{ scale: 1.1 }],
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "rgba(212, 175, 55, 0.9)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
});

export default TabsLayout;
