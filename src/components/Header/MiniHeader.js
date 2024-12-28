import { View, Text } from "react-native";
import React from "react";

function MiniHeader({ label }) {
  if (!label) return null;

  return (
    <View className="px-4 my-4 justify-between flex-row items-center">
      <Text
        className="text-xl text-green-800 dark:text-white"
        style={{
          fontFamily: "SpaceGroteskBold"
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default MiniHeader;
