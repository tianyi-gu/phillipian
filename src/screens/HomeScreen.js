import React, { useState, useEffect } from "react";
import { View, FlatList, Platform, Dimensions, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import Loading from "../components/Loading/Loading";
import Header from "../components/Header/Header";
import NewsSection from "../components/NewsSection/NewsSection";
import MiniHeader from "../components/Header/MiniHeader";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import BreakingNews from "../components/BreakingNews";
import axios from "axios";

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 80,
  },
  queryButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#0066cc',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  queryButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function HomeScreen({ navigation }) {
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
  const includedCategories = [2, 3, 8, 5, 4, 106];
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
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: colorScheme === 'dark' ? '#171717' : '#ffffff'
      }}
    >
      <View 
        style={{ 
          flex: 1,
          width: '100%',
          alignSelf: 'center'
        }}
      >
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <FlatList
          style={{ 
            flex: 1,
            width: '100%'
          }}
          contentContainerStyle={{
            paddingBottom: hp(5),
            width: '100%'
          }}
          ListHeaderComponent={
            <View style={{ width: '100%' }}>
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
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {
                console.log('Item structure:', JSON.stringify(item, null, 2));
                
                const articleData = {
                  title: item.title?.rendered || 'No Title',
                  content: item.content?.rendered || '',
                  author: item.yoast_head_json?.author || 'Unknown',
                  publishDate: new Date(item.date).toLocaleDateString(),
                  filename: `phillipian_${item.date.split('T')[0].replace(/-/g, '')}.txt`
                };
                
                navigation.navigate('NewsDetails', {
                  article: articleData
                });
              }}
              style={{ width: '100%' }}
            >
              <NewsSection newsProps={[item]} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={isRecommendedLoading ? <Loading /> : null}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          removeClippedSubviews={false}
          maxToRenderPerBatch={5}
          windowSize={10}
          initialNumToRender={5}
          scrollEventThrottle={16}
        />
      </View>
    </SafeAreaView>
  );
}