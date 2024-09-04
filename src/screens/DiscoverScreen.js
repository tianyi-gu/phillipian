import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import Loading from "../components/Loading/Loading";
import { useQuery } from "@tanstack/react-query";
import CategoriesCard from "../components/CategoriesCard";
import NewsSection from "../components/NewsSection/NewsSection";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
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

  const fetchWordPressCategoryNews = useCallback(async () => {
    console.log('Fetching news for category:', activeCategory.title);
    const url = `https://phillipian.net/wp-json/wp/v2/posts?categories=${activeCategory.id}&per_page=10`;
    console.log('Fetching URL:', url);
    const response = await axios.get(url);
    // console.log('API response:', response.data);
    return response.data;
  }, [activeCategory]);

  const { data: categoryNews, isLoading: isCategoryNewsLoading, error } = useQuery({
    queryKey: ["categoryNews", activeCategory.id],
    queryFn: fetchWordPressCategoryNews,
    enabled: !!activeCategory,
  });

  const handleChangeCategory = useCallback((categoryTitle) => {
    const newCategory = categories.find(cat => cat.title === categoryTitle);
    if (newCategory) {
      console.log('Changing to category:', newCategory);
      setActiveCategory(newCategory);
    } else {
      console.error('Category not found:', categoryTitle);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <StatusBar style={colorScheme == "dark" ? "light" : "dark"} />

      <ScrollView>
        {/* Header */}
        <View className="px-4 mb-6 justify-between pt-6">
          <Text
            className="text-3xl text-green-800 dark:text-white"
            style={{
              fontFamily: "SpaceGroteskBold",
            }}
          >
            Discover
          </Text>

          <Text
            className="text-base text-gray-600 dark:text-neutral-300"
            style={{
              fontFamily: "SpaceGroteskMedium",
            }}
          >
            Explore <Text style={styles.italicText}>The Phillipian's</Text> Various Sections!
          </Text>
        </View>

        {/* Search */}
        <View className="mx-4 mb-8 flex-row p-2 py-3 justify-between items-center bg-neutral-100 rounded-full">
          <TouchableOpacity className="pl-2">
            <MagnifyingGlassIcon size="25" color="gray" />
          </TouchableOpacity>
          <TextInput
            onPressIn={() => navigation.navigate("Search")}
            placeholder="Search"
            placeholderTextColor={"gray"}
            className="pl-4 flex-1 font-medium text-black tracking-wider"
          />
        </View>

        {/* Categories */}
        <View className="flex-row mx-4 mb-4">
          <CategoriesCard
            categories={categories}
            activeCategory={activeCategory.title}
            handleChangeCategory={handleChangeCategory}
          />
        </View>

        {/* Category News */}
        <View className="px-4">
          <Text
            className="text-xl mb-4 dark:text-white"
            style={{
              fontFamily: "SpaceGroteskBold",
            }}
          >
            {activeCategory.title}
          </Text>

          {isCategoryNewsLoading ? (
            <Loading />
          ) : error ? (
            <Text>Error loading news: {error.message}</Text>
          ) : categoryNews && categoryNews.length > 0 ? (
            <NewsSection newsProps={categoryNews} />
          ) : (
            <Text>No articles available for this category.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  italicText: {
    fontStyle: 'italic',
    fontFamily: 'System',
  },
});
