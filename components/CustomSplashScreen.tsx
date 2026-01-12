import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface CustomSplashScreenProps {
  onAnimationComplete: () => void;
}

const CustomSplashScreen = ({
  onAnimationComplete,
}: CustomSplashScreenProps) => {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animation sequence
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Stay for a while then complete
    const timeout = setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete();
      });
    }, 2500);

    return () => clearTimeout(timeout);
  }, [onAnimationComplete, logoOpacity, logoScale]);

  const animatedLogoStyle = {
    opacity: logoOpacity,
    transform: [{ scale: logoScale }],
  };

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000000" }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
          <Image
            source={require("../assets/images/app-icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
});

export default CustomSplashScreen;
