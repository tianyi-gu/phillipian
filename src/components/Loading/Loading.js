import { View, ActivityIndicator } from "react-native";
import React, { memo } from "react";
import { useColorScheme } from "nativewind";

const Loading = memo(({ size = "large", style }) => {
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-1 justify-center items-center" style={style}>
      <ActivityIndicator 
        size={size} 
        color={colorScheme === "dark" ? "white" : "black"}
      />
    </View>
  );
});

Loading.displayName = 'Loading';

export default Loading;
