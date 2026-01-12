import { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import AppBackground from "./AppBackground";

interface SafeScreenProps {
  children: ReactNode;
}

const SafeScreen = ({ children }: SafeScreenProps) => {
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <View
        style={{
          paddingTop: insets.top,
          flex: 1,
          backgroundColor: "transparent",
        }}
      >
        {children}
      </View>
    </AppBackground>
  );
};
export default SafeScreen;
