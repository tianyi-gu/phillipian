import { View, Text, Image, ImageBackground, Dimensions } from "react-native";
import React, { useEffect } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

export default function SplashScreens() {
  const navigation = useNavigation();

  const [fontsLoaded, fontError] = useFonts({
    SpaceGroteskSemiBold: require("../fonts/SpaceGrotesk-SemiBold.ttf"),
    SpaceGroteskBold: require("../fonts/SpaceGrotesk-Bold.ttf"),
    SpaceGroteskMedium: require("../fonts/SpaceGrotesk-Medium.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }

    setTimeout(() => {
      navigation.navigate("HomeTabs")
      // unnecessary welcome page which can be readded if wanted
      // navigation.navigate("Welcome");
    }, 3000); // 3 seconds delay
  });

  useEffect(() => {
    onLayoutRootView();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded) {
    return null;
  }

  const { width, height } = Dimensions.get('window');
  const logoSize = Math.min(width, height) * 0.8;

  return (
    <View style = {{
      flex: 1, 
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "black",
    }}
    >
      {/* this is for a gradient background, uncomment if want color */}
      {/* <LinearGradient
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

      <View
        onLayout={onLayoutRootView}
        className=" "
        entering={FadeInDown.delay(200).duration(700).springify().damping(12)}
      >
        <Image
          source={require("../..//assets/images/plipwhite.png")}
          style={{
            width: logoSize,
            height: logoSize,
            resizeMode: "contain",
          }}
        />
      </View>
    </View>
  );
}
