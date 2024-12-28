import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

export default function ProfileScreen() {
  const { colorScheme } = useColorScheme();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="px-4 pt-6">
        <Text 
          className="text-2xl text-black dark:text-white"
          style={{ fontFamily: "SpaceGroteskBold" }}
        >
          Profile
        </Text>
      </View>
    </SafeAreaView>
  );
}
