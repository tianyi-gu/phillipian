import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { XMarkIcon } from "react-native-heroicons/outline";
import { searchWordPressNews } from "../../utils/NewsApi";
import { debounce } from "lodash";
import NewsSection from "../components/NewsSection/NewsSection";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function SearchScreen() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async (search) => {
    if (search && search?.length > 2) {
      setLoading(true);
      setResults([]);
      setSearchTerm(search);

      try {
        const data = await searchWordPressNews(search);

        setLoading(false);

        if (data && Array.isArray(data)) {
          setResults(data);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
      }
    }
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 400), []);

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      {/* Search Input */}

      <View className="mx-4 mb-3 mt-12 flex-row p-2 justify-between items-center bg-neutral-100 rounded-lg">
        <TextInput
          onChangeText={handleTextDebounce}
          placeholder="Search"
          placeholderTextColor={"gray"}
          className=" font-medium text-black tracking-wider p-3 py-1 w-[90%] "
        />
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <XMarkIcon size="25" color="gray" strokeWidth={3} />
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

          <View className="flex-1">
            <NewsSection newsProps={results} label="Search Results" />
          </View>
        </View>
      )}
    </View>
  );
}
