import { fetchWordPressBreakingNews, fetchWordPressRecommendedNews } from "../../utils/NewsApi";
import { View, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import Loading from "../components/Loading/Loading";
import Header from "../components/Header/Header";
import NewsSection from "../components/NewsSection/NewsSection";
import { useQuery } from "@tanstack/react-query";
import MiniHeader from "../components/Header/MiniHeader";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import BreakingNews from "../components/BreakingNews";

export default function HomeScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  useEffect(() => {
    if (colorScheme !== "dark") {
      toggleColorScheme("dark");
    }
  }, []);

  // Breaking News
  const { data: breakingNews, isLoading: isBreakingLoading } = useQuery({
    queryKey: ["breakingNews"],
    queryFn: fetchWordPressBreakingNews,
    // onSuccess: (data) => console.log("Breaking News data:", data),
    // onError: (error) => console.error("Breaking News error:", error),
  });

  // Recommended News
  const { 
    data: recommendedNews, 
    isLoading: isRecommendedLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useQuery({
    queryKey: ["recommendedNews", page],
    queryFn: () => fetchWordPressRecommendedNews(page),
    getNextPageParam: (lastPage, pages) => lastPage.length === 10 ? pages.length + 1 : undefined,
  });

  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMoreNews = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const getNewsItems = () => {
    if (!recommendedNews) return [];
    return recommendedNews.pages ? recommendedNews.pages.flat() : recommendedNews;
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <StatusBar style={colorScheme == "dark" ? "light" : "dark"} />
      <FlatList
        ListHeaderComponent={
          <>
            <Header />
            {isBreakingLoading ? (
              <Loading />
            ) : (
              <View>
                <MiniHeader label="This Month's Top Stories" />
                <BreakingNews label="Breaking News" data={breakingNews} />
              </View>
            )}
            <MiniHeader label="Recommended" />
          </>
        }
        data={getNewsItems()}
        renderItem={({ item }) => <NewsSection newsProps={[item]} />}
        keyExtractor={(item, index) => item.id.toString() + index}
        ListEmptyComponent={isRecommendedLoading ? <Loading /> : null}
        contentContainerStyle={{ paddingBottom: hp(80) }}
        onEndReached={loadMoreNews}
        onEndReachedThreshold={0.1}
        ListFooterComponent={isFetchingNextPage ? <Loading /> : null}
      />
    </SafeAreaView>
  );
}