import React, { useCallback, useMemo } from "react";
import { View, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Carousel from "react-native-snap-carousel";
import BreakingNewsCard from "./BreakingNewsCard";

const { width: SLIDER_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SLIDER_WIDTH * 0.8;
const INACTIVE_SCALE = 0.86;
const INACTIVE_OPACITY = 0.6;

const carouselConfig = {
  layout: 'default',
  sliderWidth: SLIDER_WIDTH,
  itemWidth: ITEM_WIDTH,
  useScrollView: true,
  inactiveSlideScale: INACTIVE_SCALE,
  inactiveSlideOpacity: INACTIVE_OPACITY,
  firstItem: 0,
  loop: false,
  autoplay: false,
  enableMomentum: true,
  lockScrollWhileSnapping: false,
  removeClippedSubviews: true,
};

export default function BreakingNews({ data, label }) {
  const navigation = useNavigation();
  
  // Add debug logging
  console.log("BreakingNews received data:", {
    hasData: Boolean(data?.length),
    dataLength: data?.length,
    firstItem: data?.[0]
  });
  
  const carouselData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const handleNewsPress = useCallback((item) => {
    navigation.navigate("NewsDetails", item);
  }, [navigation]);

  const renderItem = useCallback(({ item }) => {
    if (!item) {
      console.log("Null item in carousel");
      return null;
    }
    
    console.log("Rendering carousel item:", {
      id: item.id,
      hasTitle: Boolean(item.title),
      hasImage: Boolean(item.urlToImage)
    });
    
    return (
      <View style={{ width: ITEM_WIDTH }}>
        <BreakingNewsCard 
          item={item} 
          handleClick={handleNewsPress}
        />
      </View>
    );
  }, [handleNewsPress]);

  if (carouselData.length === 0) {
    console.log("No data for carousel");
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        {...carouselConfig}
        data={carouselData}
        renderItem={renderItem}
        onSnapToItem={(index) => {
          console.log('Snapped to index:', index);
        }}
      />
    </View>
  );
}
