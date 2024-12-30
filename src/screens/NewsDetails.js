import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Dimensions, Share } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeftIcon, ShareIcon } from "react-native-heroicons/outline";
import { BookmarkSquareIcon } from "react-native-heroicons/solid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import { useColorScheme } from "nativewind";

const { height, width } = Dimensions.get("window");
const STORAGE_KEY = "savedArticles";

export default function NewsDetails() {
  const { params: item } = useRoute();
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { colorScheme } = useColorScheme();
  const webViewRef = useRef(null);

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

  // Remove banner from WebView content
  const processContent = (content) => {
    // If content is in rendered format
    if (content?.rendered) {
      return content.rendered;
    }
    // If content is direct HTML
    return content || '';
  };

  useEffect(() => {
    loadSavedArticles();
  }, [loadSavedArticles]);

  useEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        headerShown: false
      });
    }
    return () => {
      if (parent) {
        parent.setOptions({
          headerShown: true
        });
      }
    };
  }, [navigation]);

  // Create the injection script with more aggressive selectors
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
    </View>
  );
}
