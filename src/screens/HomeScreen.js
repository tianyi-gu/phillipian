// import { View, ScrollView } from "react-native";
// import React, { useState } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useColorScheme } from "nativewind";
// import { StatusBar } from "expo-status-bar";
// import Loading from "../components/Loading/Loading";
// import Header from "../components/Header/Header";
// import NewsSection from "../components/NewsSection/NewsSection";
// import { useQuery } from "@tanstack/react-query";
// import { fetchPosts } from "../../utils/NewsApi"; // Updated import
// import MiniHeader from "../components/Header/MiniHeader";
// import { heightPercentageToDP as hp } from "react-native-responsive-screen";
// import BreakingNews from "../components/BreakingNews";

// export default function HomeScreen() {
//   const { colorScheme, toggleColorScheme } = useColorScheme();
  
//   // Fetching posts from WordPress
//   const { data: breakingNews, isLoading: isBreakingLoading } = useQuery({
//     queryKey: ["breakingNews"],
//     queryFn: () => fetchPosts({ per_page: 5 }), // Fetch the latest 5 posts
//   });

//   const { data: recommendedNews, isLoading: isRecommendedLoading } = useQuery({
//     queryKey: ["recommendedNews"],
//     queryFn: () => fetchPosts({ per_page: 5, categories: "recommended" }), // Example of fetching recommended category
//   });

//   return (
//     <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
//       <StatusBar style={colorScheme == "dark" ? "light" : "dark"} />

//       <View>
//         {/* Header */}
//         <Header />

//         {/* Breaking News */}
//         {isBreakingLoading ? (
//           <Loading />
//         ) : (
//           <View>
//             <MiniHeader label="Latest Posts" />
//             <BreakingNews label="Latest Posts" data={breakingNews} />
//           </View>
//         )}

//         {/* Recommended News */}
//         <View>
//           <MiniHeader label="Recommended" />
//           <ScrollView
//             contentContainerStyle={{
//               paddingBottom: hp(80),
//             }}
//           >
//             {isRecommendedLoading ? (
//               <Loading />
//             ) : (
//               <NewsSection
//                 label="Recommendation"
//                 newsProps={recommendedNews}
//               />
//             )}
//           </ScrollView>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }


import { View, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import Loading from "../components/Loading/Loading";
import Header from "../components/Header/Header";
import NewsSection from "../components/NewsSection/NewsSection";
import { useQuery } from "@tanstack/react-query";
import { fetchBreakingNews, fetchRecommendedNews } from "../../utils/NewsApi";
import MiniHeader from "../components/Header/MiniHeader";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import BreakingNews from "../components/BreakingNews";

export default function HomeScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  // Default color scheme is set to dark, to enable light mode switching comment below out and uncomment section in header.js
  useEffect(() => {
    if (colorScheme !== "dark") {
      toggleColorScheme("dark");
    }
  }, []);

  // Breaking News
  const { data, isLoading: isBreakingLoading } = useQuery({
    queryKey: ["breakingNewss"],
    queryFn: fetchBreakingNews,
  });

  // Recommended News
  const { data: recommendedNew, isLoading: isRecommendedLoading } = useQuery({
    queryKey: ["recommededNewss"],
    queryFn: fetchRecommendedNews,
  });

  return (
    <SafeAreaView className=" flex-1 bg-white dark:bg-neutral-900">
      <StatusBar style={colorScheme == "dark" ? "light" : "dark"} />

      <View>
        {/* Header */}
        <Header />

        {/* Breaking News */}
        {isBreakingLoading ? (
          <Loading />
        ) : (
          <View className="">
            <MiniHeader label="This Month's Top Stories" />
            <BreakingNews label="Breaking News" data={data.articles} />
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
                label="Recommendation"
                newsProps={recommendedNew.articles}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
