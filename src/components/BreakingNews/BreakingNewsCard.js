import React, { useMemo, useCallback } from "react";
import { View, Text, TouchableWithoutFeedback, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import coverImage from '../../../assets/images/plippaper.png';

const { width, height } = Dimensions.get("window");

const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = height * 0.22;
const DATE_OPTIONS = { year: 'numeric', month: 'short', day: 'numeric' };

export default function BreakingNewsCard({ item, handleClick }) {
  const getTextContent = useCallback((content) => {
    if (typeof content === 'string') return content;
    if (content?.rendered) return content.rendered;
    return '';
  }, []);

  const formatDate = useCallback((isoDate) => {
    try {
      return new Date(isoDate).toLocaleDateString(undefined, DATE_OPTIONS);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }, []);

  const authorName = useMemo(() => {
    return item?.yoast_head_json?.author || "Unknown Author";
  }, [item?.yoast_head_json?.author]);

  const imageSource = useMemo(() => {
    if (item?.jetpack_featured_media_url) {
      return { uri: item.jetpack_featured_media_url };
    }
    
    if (item?.yoast_head_json?.og_image?.[0]?.url) {
      return { uri: item.yoast_head_json.og_image[0].url };
    }
    
    return coverImage;
  }, [item]);

  const title = useMemo(() => getTextContent(item?.title), [item?.title, getTextContent]);
  const date = useMemo(() => formatDate(item?.date), [item?.date, formatDate]);

  const onPress = useCallback(() => {
    handleClick(item);
  }, [handleClick, item]);

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View 
        className="relative" 
        style={{ 
          width: CARD_WIDTH, 
          height: CARD_HEIGHT, 
          overflow: 'hidden', 
          borderRadius: 24 
        }}
      >
        <Image
          source={imageSource}
          style={{
            width: '100%',
            height: '120%',
            position: 'absolute',
            top: 0,
          }}
          resizeMode="cover"
        />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "100%",
          }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        <View className="absolute bottom-4 left-4 right-4 justify-end">
          <View className="space-y-2">
            <Text 
              className="text-white text-base font-semibold" 
              numberOfLines={2}
            >
              {title}
            </Text>

            <View className="flex-row justify-between items-center">
              <Text className="text-neutral-300 text-xs">
                {authorName}
              </Text>
              <Text className="text-neutral-300 text-xs">
                {date}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
