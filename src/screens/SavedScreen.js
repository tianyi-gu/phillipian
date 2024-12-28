import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { BookmarkSquareIcon } from "react-native-heroicons/solid";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import coverImage from '../../assets/images/plippaper.png';

const STORAGE_KEY = "savedArticles";

export default function SavedScreen() {
  const { colorScheme } = useColorScheme();
  const navigation = useNavigation();
  const [savedArticles, setSavedArticles] = useState([]);

  const formatDate = useCallback((isoDate) => {
    if (!isoDate) return 'No Date';
    
    const options = {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString(undefined, options);
    } catch {
      return 'Invalid Date';
    }
  }, []);

  const loadSavedArticles = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      setSavedArticles(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error("Error loading saved articles:", error);
    }
  }, []);

  const toggleBookmarkAndSave = useCallback(async (item) => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      let savedArray = saved ? JSON.parse(saved) : [];
      
      const isBookmarked = savedArray.some(article => article.url === item.url);
      
      if (isBookmarked) {
        savedArray = savedArray.filter(article => article.url !== item.url);
      } else {
        savedArray.push(item);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedArray));
      setSavedArticles(savedArray);
    } catch (error) {
      console.error("Error managing bookmark:", error);
    }
  }, []);

  const clearSavedArticles = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setSavedArticles([]);
    } catch (error) {
      console.error("Error clearing articles:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedArticles();
    }, [loadSavedArticles])
  );

  const getImageSource = useCallback((item) => {
    if (item.jetpack_featured_media_url) {
      return { uri: item.jetpack_featured_media_url };
    }
    
    if (item.yoast_head_json?.og_image?.[0]?.url) {
      return { uri: item.yoast_head_json.og_image[0].url };
    }
    
    return coverImage;
  }, []);

  const renderItem = useCallback(({ item, index }) => {
    if (!item) return null;

    const title = item.title?.rendered || item.title || 'No Title';
    const date = item.date || item.publishedAt || 'No Date';
    const imageSource = getImageSource(item);

    return (
      <TouchableOpacity
        className="mb-4 space-y-1"
        key={item.id || index.toString()}
        onPress={() => navigation.navigate("NewsDetails", item)}
      >
        <View className="flex-row justify-start w-[100%] shadow-sm">
          <View className="items-start justify-start w-[20%]">
            <Image
              source={imageSource}
              style={{ width: hp(9), height: hp(10) }}
              resizeMode="cover"
              className="rounded-lg"
            />
          </View>

          <View className="w-[70%] pl-4 justify-center space-y-1">
            <Text
              className="text-neutral-800 dark:text-white"
              style={{
                fontSize: hp(1.7),
                fontFamily: "SpaceGroteskBold",
              }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {typeof title === 'string' ? title : 'No Title'}
            </Text>

            <Text className="text-xs text-gray-700 dark:text-neutral-300">
              {formatDate(date)}
            </Text>
          </View>

          <View className="w-[10%] justify-center">
            <TouchableOpacity onPress={() => toggleBookmarkAndSave(item)}>
              <BookmarkSquareIcon color="green" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, formatDate, getImageSource, toggleBookmarkAndSave]);

  return (
    <SafeAreaView className="p-4 bg-white flex-1 dark:bg-neutral-900">
      <StatusBar style={colorScheme == "dark" ? "light" : "dark"} />
      
      <View className="flex-row justify-between items-center">
        <Text
          className="font-bold text-xl text-green-800 dark:text-white"
          style={{ fontFamily: "SpaceGroteskBold" }}
        >
          Saved Articles
        </Text>
        <TouchableOpacity
          onPress={clearSavedArticles}
          className="bg-white py-1 px-4 rounded-lg border border-gray-300"
        >
          <Text
            className="font-bold text-lg text-black dark:text-black"
            style={{ fontFamily: "SpaceGroteskBold" }}
          >
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginVertical: hp(2) }} className="space-y-2">
        <FlatList
          data={savedArticles}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => (item?.url || index.toString())}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: hp(2) }}
          ListEmptyComponent={() => (
            <Text className="text-center text-gray-500 mt-4">
              No saved articles
            </Text>
          )}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
          initialNumToRender={10}
        />
      </View>
    </SafeAreaView>
  );
}
