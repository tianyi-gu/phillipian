import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Dimensions, Share, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeftIcon, ShareIcon, XMarkIcon } from "react-native-heroicons/outline";
import { BookmarkSquareIcon } from "react-native-heroicons/solid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import { useColorScheme } from "nativewind";
import { API_URL } from '../config/api';

const { height, width } = Dimensions.get("window");
const STORAGE_KEY = "savedArticles";

const INJECTED_JAVASCRIPT = `
  (function() {
    function hideElements() {
      // First approach: Hide by ID and class
      const elementsToHide = document.querySelectorAll('header, nav, .nav, #nav, .banner, .header, #header, .top-banner, .site-header, .main-header, .navigation, .main-navigation, .nav-primary, .nav-secondary, .navbar, .topbar, .top-bar, .site-navigation, #masthead, #site-header, #main-header, #top-header, .header-wrapper, .header-container, .nav-container');
      elementsToHide.forEach(el => {
        if(el) {
          el.style.display = 'none';
          el.style.height = '0px';
          el.style.minHeight = '0px';
          el.style.maxHeight = '0px';
          el.style.padding = '0px';
          el.style.margin = '0px';
          el.style.opacity = '0';
          el.style.position = 'absolute';
          el.style.top = '-9999px';
          el.style.pointerEvents = 'none';
        }
      });

      // Second approach: Remove elements completely
      elementsToHide.forEach(el => {
        if(el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });

      // Third approach: Add CSS to override all possible header styles
      const style = document.createElement('style');
      style.innerHTML = \`
        header, nav, .nav, #nav, .banner, .header, #header, .top-banner, 
        .site-header, .main-header, .navigation, .main-navigation, 
        .nav-primary, .nav-secondary, .navbar, .topbar, .top-bar, 
        .site-navigation, #masthead, #site-header, #main-header, 
        #top-header, .header-wrapper, .header-container, .nav-container,
        div[class*="header"], div[class*="nav"], div[id*="header"], 
        div[id*="nav"], div[class*="banner"], div[id*="banner"] {
          display: none !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          top: -9999px !important;
          z-index: -9999 !important;
        }
        body, #page, .site-content, .entry-content, article {
          padding-top: 0 !important;
          margin-top: 0 !important;
        }
        * {
          margin-top: 0 !important;
        }
      \`;
      document.head.appendChild(style);

      // Fourth approach: Force body content to top
      document.body.style.paddingTop = '0px';
      document.body.style.marginTop = '0px';
    }

    // Initial run
    hideElements();

    // Run multiple times to catch dynamic content
    setTimeout(hideElements, 100);
    setTimeout(hideElements, 500);
    setTimeout(hideElements, 1000);
    setTimeout(hideElements, 2000);

    // Watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      hideElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    true;
  })();
`;

export default function NewsDetails() {
  const { params: item } = useRoute();
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { colorScheme } = useColorScheme();
  const webViewRef = useRef(null);
  
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setError] = useState(null);

  const generateSummary = async () => {
    setSummaryLoading(true);
    setError(null);
    
    try {
      // Send the actual article content
      const articleData = {
        title: item.title?.rendered || '',
        content: item.content?.rendered?.replace(/<[^>]+>/g, '') || '', // Strip HTML tags
        url: item.link || '',
        date: item.date || ''
      };
      
      // console.log('Sending article data:', articleData);
      
      const response = await fetch(`${API_URL}/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      // console.log('Response status:', response.status);
      const data = await response.json();
      // console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      setSummary(data.summary);
    } catch (error) {
      console.error('Summary generation failed:', error);
      setError(error.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        message: item.title.rendered || item.title,
        url: item.link,
        title: item.title.rendered || item.title
      };
      
      await Share.share(shareContent, {
        dialogTitle: 'Share Article'
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const loadSavedArticles = useCallback(async () => {
    try {
      const savedArticles = await AsyncStorage.getItem(STORAGE_KEY);
      const savedArticlesArray = savedArticles ? JSON.parse(savedArticles) : [];
      const isArticleBookmarked = savedArticlesArray.some(
        (savedArticle) => savedArticle.url === item.url
      );
      setIsBookmarked(isArticleBookmarked);
    } catch (error) {
      console.error("Error Loading Saved Articles:", error);
    }
  }, [item.url]);

  const toggleBookmarkAndSave = useCallback(async () => {
    try {
      const savedArticles = await AsyncStorage.getItem(STORAGE_KEY);
      let savedArticlesArray = savedArticles ? JSON.parse(savedArticles) : [];
      
      const isArticleBookmarked = savedArticlesArray.some(
        (savedArticle) => savedArticle.url === item.url
      );

      if (!isArticleBookmarked) {
        savedArticlesArray.push(item);
        setIsBookmarked(true);
      } else {
        savedArticlesArray = savedArticlesArray.filter(
          (savedArticle) => savedArticle.url !== item.url
        );
        setIsBookmarked(false);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedArticlesArray));
    } catch (error) {
      console.error("Error Saving Article:", error);
    }
  }, [item]);

  useEffect(() => {
    loadSavedArticles();
  }, [loadSavedArticles]);

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900" style={{ backgroundColor: colorScheme === 'dark' ? '#171717' : '#ffffff' }}>
      <View className="w-full flex-row justify-between items-center px-4 pt-10 pb-4 bg-white dark:bg-neutral-800" style={{ backgroundColor: colorScheme === 'dark' ? '#262626' : '#ffffff' }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="bg-gray-100 dark:bg-neutral-700 p-2 rounded-full"
        >
          <ChevronLeftIcon 
            size={25} 
            strokeWidth={3} 
            color={colorScheme === "dark" ? "white" : "gray"} 
          />
        </TouchableOpacity>

        <View className="flex-row space-x-3">
          <TouchableOpacity 
            className="bg-gray-100 dark:bg-neutral-700 p-2 rounded-full"
            onPress={generateSummary}
            disabled={summaryLoading}
          >
            <Text style={{ color: colorScheme === "dark" ? "white" : "gray" }}>
              {summaryLoading ? "..." : "Summary"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-100 dark:bg-neutral-700 p-2 rounded-full"
            onPress={handleShare}
          >
            <ShareIcon 
              size={25} 
              color={colorScheme === "dark" ? "white" : "gray"} 
              strokeWidth={2} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-gray-100 dark:bg-neutral-700 p-2 rounded-full" 
            onPress={toggleBookmarkAndSave}
          >
            <BookmarkSquareIcon 
              size={25} 
              color={isBookmarked ? "green" : (colorScheme === "dark" ? "white" : "gray")} 
              strokeWidth={2} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <WebView
        source={{ uri: item.link }}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT}
        onLoadStart={() => setVisible(true)}
        onLoadEnd={() => setVisible(false)}
        style={{ flex: 1 }}
        key={item.id.toString()}
        containerStyle={{ marginTop: 0 }}
        automaticallyAdjustContentInsets={false}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        onNavigationStateChange={(navState) => {
          if (navState.loading) {
            webViewRef.current?.injectJavaScript(INJECTED_JAVASCRIPT);
          }
        }}
        ref={webViewRef}
      />

      {visible && (
        <ActivityIndicator
          size="large"
          color={colorScheme === "dark" ? "white" : "gray"}
          style={{
            position: "absolute",
            top: height / 2,
            left: width / 2,
            transform: [{ translateX: -12 }, { translateY: -12 }]
          }}
        />
      )}

      {summary ? (
        <View 
          className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-800"
          style={{ 
            backgroundColor: colorScheme === 'dark' ? '#262626' : '#ffffff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            maxHeight: height * 0.7, // Maximum 70% of screen height
          }}
        >
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <Text 
              className="text-lg font-semibold text-gray-900 dark:text-white"
              style={{ color: colorScheme === 'dark' ? '#ffffff' : '#000000' }}
            >
              Summary
            </Text>
            <TouchableOpacity 
              onPress={() => setSummary(null)}
              className="p-2 rounded-full bg-gray-100 dark:bg-neutral-700"
            >
              <XMarkIcon size={20} color={colorScheme === "dark" ? "white" : "gray"} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="p-4"
            style={{ maxHeight: height * 0.6 }} // Allow content to scroll if too long
          >
            <Text 
              className="text-base text-gray-700 dark:text-gray-300"
              style={{ color: colorScheme === 'dark' ? '#d1d1d1' : '#4a4a4a' }}
            >
              {summary}
            </Text>
          </ScrollView>
        </View>
      ) : (
        <View 
          className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-neutral-800"
          style={{ 
            backgroundColor: colorScheme === 'dark' ? '#262626' : '#ffffff',
            borderTopWidth: 1,
            borderTopColor: colorScheme === 'dark' ? '#404040' : '#e5e5e5'
          }}
        >
          <TouchableOpacity 
            className="w-full bg-white dark:bg-neutral-700 rounded-lg py-3 items-center border border-gray-200 dark:border-gray-600"
            style={{ 
              opacity: summaryLoading ? 0.7 : 1 
            }}
            onPress={generateSummary}
            disabled={summaryLoading}
          >
            <Text 
              className="font-semibold text-lg"
              style={{ 
                color: colorScheme === 'dark' ? '#ffffff' : '#000000'
              }}
            >
              {summaryLoading ? "Generating Summary..." : "Generate Summary"}
            </Text>
            {summaryLoading && (
              <ActivityIndicator 
                color={colorScheme === 'dark' ? '#ffffff' : '#000000'}
                style={{ marginLeft: 8 }}
                size="small"
              />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
