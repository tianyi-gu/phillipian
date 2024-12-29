import React, { useState, useEffect } from "react";
import { View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import { fetchWordPressBreakingNews, fetchWordPressRecommendedNews } from "../../utils/NewsApi";
import Loading from "../components/Loading/Loading";
import Header from "../components/Header/Header";
import NewsSection from "../components/NewsSection/NewsSection";
import MiniHeader from "../components/Header/MiniHeader";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import BreakingNews from "../components/BreakingNews";

export default function HomeScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (colorScheme !== "dark") {
      toggleColorScheme("dark");
    }
  }, []);

  // Breaking News Query
  const { 
    data: breakingNews, 
    isLoading: isBreakingLoading 
  } = useQuery({
    queryKey: ["breakingNews"],
    queryFn: fetchWordPressBreakingNews,
    staleTime: 60000,
    cacheTime: 3600000,
    retry: 2
  });

  // Recommended News Query
  const { 
    data: recommendedNews, 
    isLoading: isRecommendedLoading 
  } = useQuery({
    queryKey: ["recommendedNews", page],
    queryFn: () => fetchWordPressRecommendedNews(page)
  });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
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
        data={recommendedNews || []}
        renderItem={({ item }) => <NewsSection newsProps={[item]} />}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={isRecommendedLoading ? <Loading /> : null}
        contentContainerStyle={{ paddingBottom: hp(80) }}
        onEndReached={() => setPage(prev => prev + 1)}
        onEndReachedThreshold={0.1}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
      />
    </SafeAreaView>
  );
}