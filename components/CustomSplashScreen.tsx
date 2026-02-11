import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Text } from "react-native";
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
      <LinearGradient
        colors={["rgba(212,175,55,0.15)", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
          <Text style={styles.logoText}>Foody</Text>
          <View style={styles.goldLine} />
          <Text style={styles.loadingText}>CHARGING GOURMET EXPERIENCE...</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 70,
    fontWeight: "900",
    color: "#D4AF37",
    letterSpacing: -2,
    marginBottom: 10,
  },
  goldLine: {
    width: 40,
    height: 1,
    backgroundColor: "#D4AF37",
    marginBottom: 20,
    opacity: 0.6,
  },
  loadingText: {
    color: "#D4AF37",
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: "300",
    opacity: 0.8,
  },
});

export default CustomSplashScreen;
