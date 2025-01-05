import { Image, TouchableOpacity, View, Dimensions } from "react-native";
import React, { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get("window");
const HEADER_SIZE = width * 0.6;
const ICON_SIZE = 25;

export default function Header() {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();

  const headerStyle = useMemo(() => ({
    width: HEADER_SIZE,
    height: HEADER_SIZE / 3,
    resizeMode: "contain",
  }), []);

  const handleSearchPress = () => {
    navigation.navigate("Search");
  };

  return (
    <View className="flex-row justify-between items-center mx-4 mt-4">
      <View className="flex-1 justify-center items-center">
        <Image
          source={require("../../../assets/images/plipwhite.png")}
          style={headerStyle}
        />
      </View>
      
      <View className="flex-row space-x-4 rounded-full justify-center items-center">
        <TouchableOpacity
          onPress={handleSearchPress}
          className="bg-gray-200 dark:bg-neutral-700 rounded-full p-2"
        >
          <Ionicons 
            name="search-outline"
            size={ICON_SIZE}
            color={colorScheme === 'dark' ? 'white' : 'black'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
