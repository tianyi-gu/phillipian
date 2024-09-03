import { fetchWordPressBreakingNews, fetchWordPressRecommendedNews } from "../../utils/NewsApi";
import { View, ScrollView } from "react-native";
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
  const { data: recommendedNews, isLoading: isRecommendedLoading } = useQuery({
    queryKey: ["recommendedNews"],
    queryFn: fetchWordPressRecommendedNews,
    // onSuccess: (data) => console.log("Recommended News data:", data),
    // onError: (error) => console.error("Recommended News error:", error),
  });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <StatusBar style={colorScheme == "dark" ? "light" : "dark"} />

      <View>
        {/* Header */}
        <Header />

        {/* Breaking News */}
        {isBreakingLoading ? (
          <Loading />
        ) : (
          <View>
            <MiniHeader label="This Month's Top Stories" />
            <BreakingNews label="Breaking News" data={breakingNews} />
          </View>
        )}

        {/* Recommended News */}
        <View>
          <MiniHeader label="Recommended" />
          <ScrollView
            contentContainerStyle={{
              paddingBottom: hp(80),
            }}
          >
            {isRecommendedLoading ? (
              <Loading />
            ) : (
              <NewsSection
                newsProps={recommendedNews}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}