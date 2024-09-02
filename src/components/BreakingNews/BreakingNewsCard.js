import React from "react";
import { View, Text, TouchableWithoutFeedback, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

// Import the cover image
import coverImage from '../../../assets/images/plippaper.png';

var { width, height } = Dimensions.get("window");

export default function BreakingNewsCard({ item, handleClick }) {
  // Function to safely get text content
  const getTextContent = (content) => {
    if (typeof content === 'string') return content;
    if (content && typeof content === 'object' && content.rendered) return content.rendered;
    return '';
  };

  // Function to format the date
  const formatDate = (isoDate) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(isoDate).toLocaleDateString(undefined, options);
  };

  // Function to get author name
  const getAuthorName = () => {
    if (item.yoast_head_json && item.yoast_head_json.author) {
      return item.yoast_head_json.author;
    }
    return "Unknown Author";
  };

  // Function to get the image source
  const getImageSource = () => {
    console.log('Item:', JSON.stringify(item, null, 2));
    
    if (item.jetpack_featured_media_url) {
      console.log('Using jetpack_featured_media_url:', item.jetpack_featured_media_url);
      return { uri: item.jetpack_featured_media_url };
    }
    
    if (item.yoast_head_json && item.yoast_head_json.og_image && item.yoast_head_json.og_image[0] && item.yoast_head_json.og_image[0].url) {
      console.log('Using og_image:', item.yoast_head_json.og_image[0].url);
      return { uri: item.yoast_head_json.og_image[0].url };
    }
    
    console.log('No image found, using cover image');
    return coverImage;
  };

  const imageSource = getImageSource();
  console.log('Final image source:', imageSource);

  return (
    <TouchableWithoutFeedback onPress={() => handleClick(item)}>
      <View className="relative" style={{ width: width * 0.8, height: height * 0.22, overflow: 'hidden', borderRadius: 24 }}>
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
            <Text className="text-white text-base font-semibold" numberOfLines={2}>
              {getTextContent(item.title)}
            </Text>

            <View className="flex-row justify-between items-center">
              <Text className="text-neutral-300 text-xs">
                {getAuthorName()}
              </Text>
              <Text className="text-neutral-300 text-xs">
                {formatDate(item.date)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
