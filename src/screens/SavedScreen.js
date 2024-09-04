import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { BookmarkSquareIcon } from "react-native-heroicons/solid";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import coverImage from '../../assets/images/plippaper.png';

export default function SavedScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const navigation = useNavigation();
  const [savedArticles, setSavedArticles] = useState([]);
  const [bookmarkStatus, setBookmarkStatus] = useState([]);
  const [urlList, setUrlList] = useState([]);

  // Function to handle click on an item
  const handleClick = (item) => {
    navigation.navigate("NewsDetails", item);
  };

  useEffect(() => {
    const loadSavedArticles = async () => {
      try {
        const savedArticles = await AsyncStorage.getItem("savedArticles");
        const savedArticlesArray = savedArticles
          ? JSON.parse(savedArticles)
          : [];

        // console.log('Loaded saved articles:', JSON.stringify(savedArticlesArray, null, 2));

        setSavedArticles(savedArticlesArray);
      } catch (error) {
        console.log("Error loading saved articles", error);
      }
    };

    loadSavedArticles();
  }, [navigation]);

  // Function to format the date
  function formatDate(isoDate) {
    if (!isoDate) return 'No Date';
    
    const options = {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    
    let date;
    if (typeof isoDate === 'string') {
      date = new Date(isoDate);
    } else if (isoDate instanceof Date) {
      date = isoDate;
    } else {
      return 'Invalid Date';
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString(undefined, options);
  }

  const toggleBookmarkAndSave = async (item, index) => {
    try {
      const savedArticles = await AsyncStorage.getItem("savedArticles");
      let savedArticlesArray = savedArticles ? JSON.parse(savedArticles) : [];

      // Check if the article is already in the bookmarked list
      const isArticleBookmarked = savedArticlesArray.some(
        (savedArticle) => savedArticle.url === item.url
      );

      if (!isArticleBookmarked) {
        // If the article is not bookmarked, add it to the bookmarked list
        savedArticlesArray.push(item);
      } else {
        // If the article is already bookmarked, remove it from the list
        savedArticlesArray = savedArticlesArray.filter(
          (savedArticle) => savedArticle.url !== item.url
        );
        console.log("Article is removed from bookmarks");
      }

      // Update AsyncStorage
      await AsyncStorage.setItem(
        "savedArticles",
        JSON.stringify(savedArticlesArray)
      );

      // Update the state immediately
      setSavedArticles(savedArticlesArray);

      // Update bookmark status
      const updatedStatus = [...bookmarkStatus];
      updatedStatus[index] = !isArticleBookmarked;
      setBookmarkStatus(updatedStatus);
    } catch (error) {
      console.log("Error Saving/Removing Article", error);
    }
  };

  // Load saved articles from AsyncStorage when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      const loadSavedArticles = async () => {
        try {
          const savedArticles = await AsyncStorage.getItem("savedArticles");
          const savedArticlesArray = savedArticles
            ? JSON.parse(savedArticles)
            : [];

          // const isArticleBookmarkedList = urlList.map((url) =>
          //   savedArticlesArray.some((savedArticle) => savedArticle.url === url)
          // );

          // Set the bookmark status for all items based on the loaded data
          // setBookmarkStatus(isArticleBookmarkedList);
          setSavedArticles(savedArticlesArray);
        } catch (error) {
          // console.log("Error loading saved articles", error);
        }
      };

      loadSavedArticles();
      // console.log("Pull saved articles from AsyncStorage");
    }, [navigation, urlList]) // Include 'navigation' in the dependencies array if needed
  );

  const clearSavedArticles = async () => {
    try {
      await AsyncStorage.removeItem("savedArticles");
      setSavedArticles([]);
      console.log("Clear all saved articles");
    } catch (error) {
      // console.log("Error clearing saved articles", error);
    }
  };

  const renderItem = ({ item, index }) => {
    // console.log('Rendering item:', JSON.stringify(item, null, 2));

    if (!item) return null;

    // Extract the necessary information from the item structure
    const title = item.title?.rendered || item.title || 'No Title';
    const author = typeof item.author === 'number' ? 'Author' : (item.yoast_head_json?.author || item.author || 'Unknown Author');
    const date = item.date || item.publishedAt || 'No Date';

    // Function to get the image source
    const getImageSource = () => {
      if (item.jetpack_featured_media_url) {
        return { uri: item.jetpack_featured_media_url };
      }
      
      if (item.yoast_head_json && item.yoast_head_json.og_image && item.yoast_head_json.og_image[0] && item.yoast_head_json.og_image[0].url) {
        return { uri: item.yoast_head_json.og_image[0].url };
      }
      
      return coverImage;
    };

    const imageSource = getImageSource();

    return (
      <TouchableOpacity
        className="mb-4 space-y-1"
        key={item.id || index.toString()}
        onPress={() => handleClick(item)}
      >
        <View className="flex-row justify-start w-[100%] shadow-sm">
          {/* Image */}
          <View className="items-start justify-start w-[20%]">
            <Image
              source={imageSource}
              style={{ width: hp(9), height: hp(10) }}
              resizeMode="cover"
              className="rounded-lg"
            />
          </View>

          {/* Content */}
          <View className="w-[70%] pl-4 justify-center space-y-1">
            {/* Display Authorship of the Article */}
            {/* <Text className="text-xs font-bold text-gray-900 dark:text-neutral-300">
              {author}
            </Text> */}

            {/* Title */}
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

            {/* Date */}
            <Text className="text-xs text-gray-700 dark:text-neutral-300">
              {formatDate(date)}
            </Text>
          </View>

          {/* Save */}
          <View className="w-[10%] justify-center">
            <TouchableOpacity
              onPress={() => toggleBookmarkAndSave(item, index)}
            >
              <BookmarkSquareIcon color={bookmarkStatus[index] ? "green" : "white"} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="p-4 bg-white flex-1 dark:bg-neutral-900">
      <StatusBar style={colorScheme == "dark" ? "light" : "dark"} />
      
      {/* Header  */}
      <View className="flex-row justify-between items-center">
        <Text
          className="font-bold text-xl text-green-800 dark:text-white"
          style={{
            fontFamily: "SpaceGroteskBold",
          }}
        >
          Saved Articles
        </Text>
        <TouchableOpacity
          onPress={clearSavedArticles}
          className="bg-white py-1 px-4 rounded-lg border border-gray-300"
        >
          <Text
            className="font-bold text-lg text-black dark:text-black"
            style={{
              fontFamily: "SpaceGroteskBold",
            }}
          >
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginVertical: hp(2) }} className="space-y-2 ">
        <FlatList
          data={savedArticles}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => (item?.url || index.toString())}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: hp(2),
          }}
          ListEmptyComponent={() => (
            <Text className="text-center text-gray-500 mt-4">No saved articles</Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
