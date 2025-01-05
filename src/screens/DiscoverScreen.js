import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import Loading from "../components/Loading/Loading";
import { useInfiniteQuery } from "@tanstack/react-query";
import CategoriesCard from "../components/CategoriesCard";
import NewsSection from "../components/NewsSection/NewsSection";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';

const categories = [
  { id: 2, title: "News" },
  { id: 3, title: "Commentary" },
  { id: 8, title: "Editorial" },
  { id: 5, title: "Arts" },
  { id: 4, title: "Sports" },
  { id: 106, title: "Multilingual" },
];

export default function DiscoverScreen() {
  const { colorScheme } = useColorScheme();
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const navigation = useNavigation();

  const fetchWordPressCategoryNews = useCallback(async ({ pageParam = 1 }) => {
    const url = `https://phillipian.net/wp-json/wp/v2/posts?categories=${activeCategory.id}&per_page=10&page=${pageParam}`;
    const response = await axios.get(url);
    return response.data;
  }, [activeCategory]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isCategoryNewsLoading,
    error
  } = useInfiniteQuery({
    queryKey: ["categoryNews", activeCategory.id],
    queryFn: fetchWordPressCategoryNews,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    enabled: !!activeCategory,
  });

  const categoryNews = data ? data.pages.flat() : [];

  const handleChangeCategory = useCallback((categoryTitle) => {
    const newCategory = categories.find(cat => cat.title === categoryTitle);
    if (newCategory) {
      setActiveCategory(newCategory);
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <StatusBar style={colorScheme == "dark" ? "light" : "dark"} />

      {/* Fixed Header Section */}
      <View className="px-4 mb-6 justify-between pt-6">
        <Text
          className="text-3xl text-green-800 dark:text-white"
          style={{ fontFamily: "SpaceGroteskBold" }}
        >
          Discover
        </Text>

        <Text
          className="text-base text-gray-600 dark:text-neutral-300"
          style={{ fontFamily: "SpaceGroteskMedium" }}
        >
          Explore <Text style={styles.italicText}>The Phillipian's</Text> Various Sections!
        </Text>
      </View>

      {/* Search Bar */}
      <View className="mx-4 mb-8 flex-row p-2 py-3 justify-between items-center bg-neutral-100 rounded-full">
        <View className="pl-2">
          <Ionicons 
            name="search-outline"
            size={24}
            color={colorScheme === 'dark' ? '#666666' : '#999999'}
          />
        </View>
        <TextInput
          onPressIn={() => navigation.navigate("Search")}
          placeholder="Search"
          placeholderTextColor={"gray"}
          className="pl-4 flex-1 font-medium text-black tracking-wider"
        />
      </View>

      {/* Categories Section */}
      <View className="flex-row mx-4 mb-4">
        <CategoriesCard
          categories={categories}
          activeCategory={activeCategory.title}
          handleChangeCategory={handleChangeCategory}
        />
      </View>

      {/* News Content Section */}
      <View className="px-4 flex-1">
        <Text
          className="text-xl mb-4 dark:text-white"
          style={{ fontFamily: "SpaceGroteskBold" }}
        >
          {activeCategory.title}
        </Text>

        {isCategoryNewsLoading ? (
          <Loading />
        ) : error ? (
          <Text>Error loading news: {error.message}</Text>
        ) : categoryNews && categoryNews.length > 0 ? (
          <View className="flex-1">
            <NewsSection 
              newsProps={categoryNews}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={isFetchingNextPage ? <Loading /> : null}
            />
          </View>
        ) : (
          <Text>No articles available for this category.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  italicText: {
    fontStyle: 'italic',
    fontFamily: 'System',
  },
});
