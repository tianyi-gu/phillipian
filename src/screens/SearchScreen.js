import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { debounce } from "lodash";
import NewsSection from "../components/NewsSection/NewsSection";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import axios from "axios";
import { useColorScheme } from "nativewind";

export default function SearchScreen() {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const handleSearch = async (search, pageNum = 1) => {
    if (search && search?.length > 2) {
      if (pageNum === 1) {
        setLoading(true);
        setResults([]);
      }
      setSearchTerm(search);

      try {
        const url = `https://phillipian.net/wp-json/wp/v2/posts?search=${encodeURIComponent(search)}&per_page=10&page=${pageNum}`;
        const response = await axios.get(url);
        const newData = response.data;

        setLoading(false);
        setIsFetchingMore(false);

        if (newData && Array.isArray(newData)) {
          if (pageNum === 1) {
            setResults(newData);
          } else {
            setResults(prev => [...prev, ...newData]);
          }
          // Check if we have more results
          setHasMore(newData.length === 10);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
        setIsFetchingMore(false);
        setHasMore(false);
      }
    }
  };

  const handleTextDebounce = useCallback(debounce((text) => {
    setPage(1);
    setHasMore(true);
    handleSearch(text, 1);
  }, 400), []);

  const loadMore = () => {
    if (hasMore && !isFetchingMore && !loading && searchTerm) {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      handleSearch(searchTerm, nextPage);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      {/* Search Input */}
      <View className="mx-4 mb-4 mt-14 flex-row justify-between items-center bg-neutral-100 rounded-lg">
        <TextInput
          onChangeText={handleTextDebounce}
          placeholder="Search"
          placeholderTextColor={"gray"}
          className="font-medium text-black tracking-wider px-4 py-3 w-[90%]"
        />
        <TouchableOpacity 
          onPress={() => navigation.navigate("Home")}
          className="pr-3"
        >
          <Ionicons 
            name="close" 
            size={24} 
            color={colorScheme === 'dark' ? '#666666' : '#999999'}
          />
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {loading ? (
        <View className="mx-4">
          <Text className="text-gray-500">Searching...</Text>
        </View>
      ) : (
        <View className="flex-1">
          <View className="mx-4 mb-4">
            <Text
              className="text-xl dark:text-white"
              style={{
                fontFamily: "SpaceGroteskBold",
              }}
            >
              {results?.length} Results for "{searchTerm}"
            </Text>
          </View>

          <FlatList
            data={results}
            renderItem={({ item }) => <NewsSection newsProps={[item]} />}
            keyExtractor={(item) => item.id.toString()}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => (
              isFetchingMore ? (
                <View className="py-4">
                  <ActivityIndicator color="gray" />
                </View>
              ) : null
            )}
          />
        </View>
      )}
    </View>
  );
}
