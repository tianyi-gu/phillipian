import React from "react";
import { View, Dimensions, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Carousel from "react-native-snap-carousel";
import BreakingNewsCard from "./BreakingNewsCard";

const SLIDER_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = SLIDER_WIDTH * 0.8;

export default function BreakingNews({ data, label }) {
  const navigation = useNavigation();
  
  // Ensure data is an array and has items
  const carouselData = Array.isArray(data) ? data : [];
  
  const renderItem = ({ item }) => {
    if (!item) return null;
    return (
      <View style={{ width: ITEM_WIDTH }}>
        <BreakingNewsCard 
          item={item} 
          handleClick={() => navigation.navigate("NewsDetails", item)} 
        />
      </View>
    );
  };

  if (carouselData.length === 0) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        layout={'default'}
        data={carouselData}
        renderItem={renderItem}
        sliderWidth={SLIDER_WIDTH}
        itemWidth={ITEM_WIDTH}
        useScrollView={true}
        inactiveSlideScale={0.86}
        inactiveSlideOpacity={0.6}
        firstItem={0}
        loop={false}
        autoplay={false}
        enableMomentum={true}
        lockScrollWhileSnapping={false}
        removeClippedSubviews={false}
      />
    </View>
  );
}
