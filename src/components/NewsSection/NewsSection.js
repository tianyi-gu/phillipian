import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import { BookmarkSquareIcon } from "react-native-heroicons/solid";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import coverImage from '../../../assets/images/plippaper.png';

const STORAGE_KEY = "savedArticles";
const DATE_OPTIONS = {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
};

export default function NewsSection({ newsProps, onEndReached }) {
  const navigation = useNavigation();
  const [bookmarkStatus, setBookmarkStatus] = useState([]);

  const getTextContent = useCallback((content) => {
    if (typeof content === 'string') return content;
    if (content?.rendered) return content.rendered;
    return '';
  }, []);

  const formatDate = useCallback((isoDate) => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString(undefined, DATE_OPTIONS);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }, []);

  const toggleBookmarkAndSave = useCallback(async (item, index) => {
    try {
      const savedArticles = await AsyncStorage.getItem(STORAGE_KEY);
      let savedArticlesArray = savedArticles ? JSON.parse(savedArticles) : [];

      const isArticleBookmarked = savedArticlesArray.some(
        (savedArticle) => savedArticle.link === item.link
      );

      if (!isArticleBookmarked) {
        savedArticlesArray.push(item);
        const updatedStatus = [...bookmarkStatus];
        updatedStatus[index] = true;
        setBookmarkStatus(updatedStatus);
      } else {
        const updatedSavedArticlesArray = savedArticlesArray.filter(
          (savedArticle) => savedArticle.link !== item.link
        );
        savedArticlesArray = updatedSavedArticlesArray;
        const updatedStatus = [...bookmarkStatus];
        updatedStatus[index] = false;
        setBookmarkStatus(updatedStatus);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedArticlesArray));
    } catch (error) {
      console.error("Error Saving/Removing Article", error);
    }
  }, [bookmarkStatus]);

  const getImageSource = useCallback((item) => {
    if (item?.jetpack_featured_media_url) {
      return { uri: item.jetpack_featured_media_url };
    }
    
    if (item?.yoast_head_json?.og_image?.[0]?.url) {
      return { uri: item.yoast_head_json.og_image[0].url };
    }
    
    return coverImage;
  }, []);

  const handleClick = useCallback((item) => {
    navigation.navigate("NewsDetails", item);
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const loadSavedArticles = async () => {
        try {
          const savedArticles = await AsyncStorage.getItem(STORAGE_KEY);
          const savedArticlesArray = savedArticles ? JSON.parse(savedArticles) : [];

          const newBookmarkStatus = newsProps.map(item => 
            savedArticlesArray.some(saved => saved.link === item.link)
          );
          setBookmarkStatus(newBookmarkStatus);
        } catch (error) {
          console.error("Error Loading Saved Articles", error);
          setBookmarkStatus(new Array(newsProps.length).fill(false));
        }
      };

      loadSavedArticles();
    }, [newsProps])
  );

  const renderItem = useCallback(({ item, index }) => {
    const imageSource = getImageSource(item);
    const authorName = getTextContent(item?.author_info?.display_name)?.slice(0, 20);
    const title = getTextContent(item.title);
    const date = formatDate(item.date);
    
    return (
      <TouchableOpacity
        className="mb-4 mx-4 space-y-1"
        key={index}
        onPress={() => handleClick(item)}
      >
        <View className="flex-row justify-start w-[100%] shadow-sm">
          <Image
            source={imageSource}
            style={{
              width: wp(20),
              height: wp(20),
              borderRadius: 8,
              marginRight: wp(4),
            }}
            resizeMode="cover"
          />
          <View className="w-[70%] justify-center space-y-1">
            <Text className="text-xs font-bold text-gray-900 dark:text-neutral-300">
              {authorName}
            </Text>

            <Text
              className="text-neutral-800 dark:text-white"
              style={{
                fontSize: hp(1.7),
                fontFamily: "SpaceGroteskBold",
              }}
              numberOfLines={2}
            >
              {title}
            </Text>

            <Text className="text-xs text-gray-700 dark:text-neutral-300">
              {date}
            </Text>
          </View>

          <View className="w-[10%] justify-center">
            <TouchableOpacity
              onPress={() => toggleBookmarkAndSave(item, index)}
            >
              <BookmarkSquareIcon
                color={bookmarkStatus[index] ? "green" : "gray"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [getImageSource, getTextContent, formatDate, handleClick, bookmarkStatus, toggleBookmarkAndSave]);

  return (
    <View className="space-y-2 bg-white dark:bg-neutral-900">
      <FlatList
        nestedScrollEnabled={true}
        data={newsProps}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => item.id?.toString() + index}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={10}
      />
    </View>
  );
}
