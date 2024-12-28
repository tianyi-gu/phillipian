import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeftIcon, ShareIcon } from "react-native-heroicons/outline";
import { BookmarkSquareIcon } from "react-native-heroicons/solid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import { useColorScheme } from "nativewind";

const { height, width } = Dimensions.get("window");
const STORAGE_KEY = "savedArticles";

export default function NewsDetails() {
  const { params: item } = useRoute();
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { colorScheme } = useColorScheme();

  const loadSavedArticles = useCallback(async () => {
    try {
      const savedArticles = await AsyncStorage.getItem(STORAGE_KEY);
      const savedArticlesArray = savedArticles ? JSON.parse(savedArticles) : [];
      const isArticleBookmarked = savedArticlesArray.some(
        (savedArticle) => savedArticle.url === item.url
      );
      setIsBookmarked(isArticleBookmarked);
    } catch (error) {
      console.error("Error Loading Saved Articles:", error);
    }
  }, [item.url]);

  const toggleBookmarkAndSave = useCallback(async () => {
    try {
      const savedArticles = await AsyncStorage.getItem(STORAGE_KEY);
      let savedArticlesArray = savedArticles ? JSON.parse(savedArticles) : [];
      
      const isArticleBookmarked = savedArticlesArray.some(
        (savedArticle) => savedArticle.url === item.url
      );

      if (!isArticleBookmarked) {
        savedArticlesArray.push(item);
        setIsBookmarked(true);
      } else {
        savedArticlesArray = savedArticlesArray.filter(
          (savedArticle) => savedArticle.url !== item.url
        );
        setIsBookmarked(false);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedArticlesArray));
    } catch (error) {
      console.error("Error Saving Article:", error);
    }
  }, [item]);

  useEffect(() => {
    loadSavedArticles();
  }, [loadSavedArticles]);

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <View className="w-full flex-row justify-between items-center px-4 pt-10 pb-4 bg-white dark:bg-neutral-800">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="bg-gray-100 dark:bg-neutral-700 p-2 rounded-full"
        >
          <ChevronLeftIcon 
            size={25} 
            strokeWidth={3} 
            color={colorScheme === "dark" ? "white" : "gray"} 
          />
        </TouchableOpacity>

        <View className="flex-row space-x-3">
          <TouchableOpacity className="bg-gray-100 dark:bg-neutral-700 p-2 rounded-full">
            <ShareIcon 
              size={25} 
              color={colorScheme === "dark" ? "white" : "gray"} 
              strokeWidth={2} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-gray-100 dark:bg-neutral-700 p-2 rounded-full" 
            onPress={toggleBookmarkAndSave}
          >
            <BookmarkSquareIcon 
              size={25} 
              color={isBookmarked ? "green" : (colorScheme === "dark" ? "white" : "gray")} 
              strokeWidth={2} 
            />
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
          color={colorScheme === "dark" ? "white" : "gray"}
          style={{
            position: "absolute",
            top: height / 2,
            left: width / 2,
            transform: [{ translateX: -12 }, { translateY: -12 }]
          }}
        />
      )}
    </View>
  );
}
