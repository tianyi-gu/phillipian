import React, { useCallback, useMemo } from "react";
import { View, Dimensions, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import BreakingNewsCard from "./BreakingNewsCard";

const { width: SLIDER_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SLIDER_WIDTH * 0.8;

export default function BreakingNews({ data }) {
  const navigation = useNavigation();

  const handleNewsPress = useCallback((item) => {
    navigation.navigate("NewsDetails", item);
  }, [navigation]);

  const renderItem = useCallback((item, index) => {
    return (
      <View 
        key={`news-${item.id}-${index}`}
        style={{ 
          width: ITEM_WIDTH,
          marginRight: index === data.length - 1 ? 0 : 10 
        }}
      >
        <BreakingNewsCard 
          item={item} 
          handleClick={handleNewsPress}
        />
      </View>
    );
  }, [handleNewsPress]);

  if (!data?.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_WIDTH + 10}
      decelerationRate="fast"
      contentContainerStyle={{
        paddingHorizontal: 15
      }}
    >
      {data.map(renderItem)}
    </ScrollView>
  );
}
