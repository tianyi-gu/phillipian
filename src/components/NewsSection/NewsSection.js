import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import { BookmarkSquareIcon } from "react-native-heroicons/solid";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

import coverImage from '../../../assets/images/plippaper.png';

export default function NewsSection({ newsProps, onEndReached }) {
  const navigation = useNavigation();
  const [urlList, setUrlList] = useState([]);
  const [bookmarkStatus, setBookmarkStatus] = useState([]);

  // Function to safely get text content
  const getTextContent = (content) => {
    if (typeof content === 'string') return content;
    if (content && typeof content === 'object' && content.rendered) return content.rendered;
    return '';
  };

  // Function to format the date
  function formatDate(isoDate) {
    const options = {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, options);
  }

  // Hook to set the URL list
  useEffect(() => {
    const urls = newsProps.map((item) => item.link);
    setUrlList(urls);
  }, [newsProps]);

  // Function to handle click on an item
  const handleClick = (item) => {
    navigation.navigate("NewsDetails", item);
  };

  // Function to toggle bookmark and save article
  const toggleBookmarkAndSave = async (item, index) => {
    try {
      const savedArticles = await AsyncStorage.getItem("savedArticles");
      let savedArticlesArray = savedArticles ? JSON.parse(savedArticles) : [];

      // Check if the article is already in the bookmarked list
      const isArticleBookmarked = savedArticlesArray.some(
        (savedArticle) => savedArticle.link === item.link
      );

      if (!isArticleBookmarked) {
        // If the article is not bookmarked, add it to the bookmarked list
        savedArticlesArray.push(item);
        await AsyncStorage.setItem(
          "savedArticles",
          JSON.stringify(savedArticlesArray)
        );
        const updatedStatus = [...bookmarkStatus];
        updatedStatus[index] = true;
        setBookmarkStatus(updatedStatus);
      } else {
        // If the article is already bookmarked, remove it from the list
        const updatedSavedArticlesArray = savedArticlesArray.filter(
          (savedArticle) => savedArticle.link !== item.link
        );
        await AsyncStorage.setItem(
          "savedArticles",
          JSON.stringify(updatedSavedArticlesArray)
        );
        const updatedStatus = [...bookmarkStatus];
        updatedStatus[index] = false;
        setBookmarkStatus(updatedStatus);
      }
    } catch (error) {
      console.log("Error Saving/Removing Article", error);
    }
  };

  // Effect to load saved articles from AsyncStorage when the component mounts
  useFocusEffect(
    useCallback(() => {
      const loadSavedArticles = async () => {
        try {
          const savedArticles = await AsyncStorage.getItem("savedArticles");
          const savedArticlesArray = savedArticles
            ? JSON.parse(savedArticles)
            : [];

          // Check if each URL in 'urlList' exists in the bookmarked list
          const isArticleBookmarkedList = urlList.map((url) =>
            savedArticlesArray.some((savedArticle) => savedArticle.url === url)
          );

          // Set the bookmark status for all items based on the loaded data
          setBookmarkStatus(isArticleBookmarkedList);
        } catch (error) {
          console.log("Error Loading Saved Articles", error);
        }
      };

      loadSavedArticles();
    }, [navigation, urlList]) // Include 'navigation' in the dependencies array if needed
  );

  // Function to get the image source
  const getImageSource = (item) => {
    if (item.jetpack_featured_media_url) {
      return { uri: item.jetpack_featured_media_url };
    }
    
    if (item.yoast_head_json && item.yoast_head_json.og_image && item.yoast_head_json.og_image[0] && item.yoast_head_json.og_image[0].url) {
      return { uri: item.yoast_head_json.og_image[0].url };
    }
    
    return coverImage;
  };

  // Component to render each item in the list
  const renderItem = ({ item, index }) => {
    const imageSource = getImageSource(item);
    
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
            {/* Author */}
            <Text className="text-xs font-bold text-gray-900 dark:text-neutral-300">
              {getTextContent(item?.author_info?.display_name).slice(0, 20)}
            </Text>

            {/* Title */}
            <Text
              className="text-neutral-800 dark:text-white "
              style={{
                fontSize: hp(1.7),
                fontFamily: "SpaceGroteskBold",
              }}
            >
              {getTextContent(item.title)}
            </Text>

            {/* Date */}
            <Text className="text-xs text-gray-700 dark:text-neutral-300">
              {formatDate(item.date)}
            </Text>
          </View>

          {/* Bookmark */}
          <View className="w-[10%] justify-center">
            <TouchableOpacity
              onPress={() => toggleBookmarkAndSave(item, index)}
            >
              <BookmarkSquareIcon
                color={bookmarkStatus[index] ? "white" : "gray"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="space-y-2 bg-white dark:bg-neutral-900">
      {/* Header */}

      <FlatList
        nestedScrollEnabled={true}
        data={newsProps}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => item.id.toString() + index}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
      />
    </View>
  );
}

// useEffect(() => {

//   const loadSavedArticles = async () => {
//     try {
//       const savedArticles = await AsyncStorage.getItem("savedArticles");
//       const savedArticlesArray = savedArticles
//         ? JSON.parse(savedArticles)
//         : [];

//       // Check if each URL in 'urlList' exists in the bookmarked list
//       const isArticleBookmarkedList = urlList.map((url) =>
//         savedArticlesArray.some((savedArticle) => savedArticle.url === url)
//       );

//       // Set the bookmark status for all items based on the loaded data
//       setBookmarkStatus(isArticleBookmarkedList);
//       console.log("Check if the current article is in bookmarks");
//     } catch (error) {
//       console.log("Error Loading Saved Articles", error);
//     }
//   };

//   loadSavedArticles();
// }, [urlList]);

// contentContainerStyle={{
//         paddingBottom: hp(110),
//       }}
