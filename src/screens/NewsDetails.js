import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeftIcon, ShareIcon } from "react-native-heroicons/outline";
import { BookmarkSquareIcon } from "react-native-heroicons/solid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import { useColorScheme } from "nativewind";

const { height, width } = Dimensions.get("window");

export default function NewsDetails() {
  const { params: item } = useRoute();
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const [isBookmarked, toggleBookmark] = useState(false);
  const { colorScheme } = useColorScheme();

  const toggleBookmarkAndSave = async () => {
    try {
      // Check if News Article is already in Storage
      const savedArticles = await AsyncStorage.getItem("savedArticles");
      let savedArticlesArray = savedArticles ? JSON.parse(savedArticles) : [];
      // console.log("Check if the article is already bookmarked");

      // Check if the article is already in the bookmarked list
      const isArticleBookmarked = savedArticlesArray.some(
        (savedArticle) => savedArticle.url === item.url
      );

      // console.log("Check if the article is already in the bookmarked list");

      if (!isArticleBookmarked) {
        // If the article is not bookmarked, add it to the bookmarked list
        savedArticlesArray.push(item);
        await AsyncStorage.setItem(
          "savedArticles",
          JSON.stringify(savedArticlesArray)
        );
        toggleBookmark(true);
        // console.log("Article is bookmarked");
      } else {
        // If the article is already bookmarked, remove it from the list
        const updatedSavedArticlesArray = savedArticlesArray.filter(
          (savedArticle) => savedArticle.url !== item.url
        );
        await AsyncStorage.setItem(
          "savedArticles",
          JSON.stringify(updatedSavedArticlesArray)
        );
        toggleBookmark(false);
        // console.log("Article is removed from bookmarks");
      }
    } catch (error) {
      console.log("Error Saving Article", error);
    }
  };

  useEffect(() => {
    // Load saved articles from AsyncStorage when the component mounts
    const loadSavedArticles = async () => {
      try {
        const savedArticles = await AsyncStorage.getItem("savedArticles");
        const savedArticlesArray = savedArticles
          ? JSON.parse(savedArticles)
          : [];

        // Check if the article is already in the bookmarked list
        const isArticleBookmarked = savedArticlesArray.some(
          (savedArticle) => savedArticle.url === item.url
        );

        toggleBookmark(isArticleBookmarked);
        // console.log("Check if the current article is in bookmarks");
      } catch (error) {
        console.log("Error Loading Saved Articles", error);
      }
    };

    loadSavedArticles();
  }, [item.link]);

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <View className="w-full flex-row justify-between items-center px-4 pt-10 pb-4 bg-white dark:bg-neutral-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-100 dark:bg-neutral-700 p-2 rounded-full">
          <ChevronLeftIcon size={25} strokeWidth={3} color={colorScheme === "dark" ? "white" : "gray"} />
        </TouchableOpacity>

        <View className="flex-row space-x-3">
          <TouchableOpacity className="bg-gray-100 dark:bg-neutral-700 p-2 rounded-full">
            <ShareIcon size={25} color={colorScheme === "dark" ? "white" : "gray"} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-100 dark:bg-neutral-700 p-2 rounded-full" onPress={toggleBookmarkAndSave}>
            <BookmarkSquareIcon size={25} color={isBookmarked ? "green" : (colorScheme === "dark" ? "white" : "gray")} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <WebView
        source={{ uri: item.link }}
        onLoadStart={() => setVisible(true)}
        onLoadEnd={() => setVisible(false)}
        style={{ flex: 1 }}
      />

      {visible && (
        <ActivityIndicator
          size="large"
          color="white"
          style={{
            position: "absolute",
            top: height / 2,
            left: width / 2,
          }}
        />
      )}
    </View>
  );
}
