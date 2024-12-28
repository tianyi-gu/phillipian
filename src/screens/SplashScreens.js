import { View, Image, Dimensions } from "react-native";
import React, { useEffect, useCallback } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient"; // Uncomment if needed

const SPLASH_DURATION = 3000; // 3 seconds
const ANIMATION_DELAY = 200;
const ANIMATION_DURATION = 700;
const ANIMATION_DAMPING = 12;

export default function SplashScreens() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get('window');
  const logoSize = Math.min(width, height) * 0.8;

  const [fontsLoaded, fontError] = useFonts({
    SpaceGroteskSemiBold: require("../fonts/SpaceGrotesk-SemiBold.ttf"),
    SpaceGroteskBold: require("../fonts/SpaceGrotesk-Bold.ttf"),
    SpaceGroteskMedium: require("../fonts/SpaceGrotesk-Medium.ttf"),
  });

  const handleNavigation = useCallback(() => {
    navigation.navigate("HomeTabs");
  }, [navigation]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      try {
        await SplashScreen.hideAsync();
        setTimeout(handleNavigation, SPLASH_DURATION);
      } catch (error) {
        console.error("Error in splash screen:", error);
        handleNavigation(); // Navigate anyway if there's an error
      }
    }
  }, [fontsLoaded, fontError, handleNavigation]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View 
      style={{
        flex: 1, 
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
      }}
    >
      {/* Gradient background - uncomment if needed
      <LinearGradient
        colors={["rgba(0, 85, 0, 0.95)", "rgba(0, 85, 0, 0.95)"]}
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "100%",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      /> */}

      <Animated.View
        onLayout={onLayoutRootView}
        entering={FadeInDown
          .delay(ANIMATION_DELAY)
          .duration(ANIMATION_DURATION)
          .springify()
          .damping(ANIMATION_DAMPING)
        }
      >
        <Image
          source={require("../../assets/images/plipwhite.png")}
          style={{
            width: logoSize,
            height: logoSize,
            resizeMode: "contain",
          }}
        />
      </Animated.View>
    </View>
  );
}
