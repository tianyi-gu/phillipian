import React, { useState, useEffect } from "react";
import { View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchWordPressBreakingNews, fetchWordPressRecommendedNews } from "../../utils/NewsApi";
import Loading from "../components/Loading/Loading";
import Header from "../components/Header/Header";
import NewsSection from "../components/NewsSection/NewsSection";
import MiniHeader from "../components/Header/MiniHeader";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import BreakingNews from "../components/BreakingNews";
import axios from "axios";

export default function HomeScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  // Initialize dark mode
  useEffect(() => {
    const initDarkMode = async () => {
      try {
        if (colorScheme !== "dark") {
          await toggleColorScheme();
        }
      } catch (error) {
        console.error('Error setting dark mode:', error);
      }
    };

    initDarkMode();
  }, []);
  
  // Define included categories once to use in both queries
  const includedCategories = [2, 3, 8, 5, 4, 106]; // News, Commentary, Editorial, Arts, Sports, Multilingual
  const categoriesParam = includedCategories.join(',');

  const { 
    data: breakingNews, 
    isLoading: isBreakingLoading 
  } = useQuery({
    queryKey: ["breakingNews"],
    queryFn: async () => {
      const url = `https://phillipian.net/wp-json/wp/v2/posts?per_page=10&categories=${categoriesParam}`;
      const response = await axios.get(url);
      return response.data;
    }
  });

  const { 
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isRecommendedLoading
  } = useInfiniteQuery({
    queryKey: ["recommendedNews"],
    queryFn: async ({ pageParam = 1 }) => {
      const url = `https://phillipian.net/wp-json/wp/v2/posts?per_page=10&page=${pageParam}&categories=${categoriesParam}`;
      const response = await axios.get(url);
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length + 1 : undefined;
    }
  });

  const recommendedNews = data ? data.pages.flat() : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#171717' : '#ffffff' }}>
      <StatusBar style={colorScheme == "dark" ? "light" : "dark"} />
      <FlatList
        ListHeaderComponent={
          <View>
            <Header />
            {isBreakingLoading ? (
              <Loading />
            ) : breakingNews?.length > 0 ? (
              <>
                <MiniHeader label="This Month's Top Stories" />
                <BreakingNews data={breakingNews} />
                <MiniHeader label="Recommended" />
              </>
            ) : null}
          </View>
        }
        data={recommendedNews}
        renderItem={({ item }) => <NewsSection newsProps={[item]} />}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={isRecommendedLoading ? <Loading /> : null}
        contentContainerStyle={{ paddingBottom: hp(5) }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
      />
    </SafeAreaView>
  );
}