import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Dimensions, Share, ScrollView, Platform, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeftIcon, ShareIcon, XMarkIcon, LanguageIcon } from "react-native-heroicons/outline";
import { BookmarkSquareIcon } from "react-native-heroicons/solid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import { useColorScheme } from "nativewind";
import { API_URL } from '../config/api';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import RNPickerSelect from 'react-native-picker-select';

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

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    height: 36,
    minWidth: 90,
    maxWidth: 120,
  },
  inputAndroid: {
    // keep existing Android styles
  }
};

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
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [translatedContent, setTranslatedContent] = useState(null);
  const [translating, setTranslating] = useState(false);

  const languages = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'de': 'German',
    'ru': 'Russian',
    'ar': 'Arabic',
    'hi': 'Hindi'
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const pickerItems = Object.entries(languages).map(([code, name]) => ({
    label: code.toUpperCase(),
    value: code,
  }));

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

  const handleTranslate = async (lang) => {
    if (lang === targetLanguage) return;
    
    // Update the language display immediately
    setTargetLanguage(lang);
    
    if (lang === 'en') {
      setTranslatedContent(null);
      return;
    }

    setTranslating(true);
    let retryCount = 0;
    const maxRetries = 2;

    const tryTranslation = async () => {
      try {
        const textToTranslate = summary;
        if (!textToTranslate) {
          console.error('No text to translate');
          return;
        }

        const response = await fetch(`${API_URL}/api/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: textToTranslate,
            target_language: lang
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.translated_text) {
          setTranslatedContent(data.translated_text);
        } else {
          throw new Error('No translation received');
        }

      } catch (error) {
        console.error('Translation error:', error);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying translation (${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return tryTranslation();
        }
        
        Alert.alert(
          'Translation Error',
          'Failed to translate. Please try again later.',
          [{ text: 'OK' }]
        );
        
        // On error, keep the selected language but clear translated content
        setTranslatedContent(null);
      }
    };

    try {
      await tryTranslation();
    } finally {
      setTranslating(false);
    }
  };

  const loadVoices = async () => {
    try {
      const availableVoices = await Speech.getAvailableVoicesAsync();
      // Filter for better quality voices (usually en-US or en-GB)
      const bestVoices = availableVoices.filter(voice => 
        (voice.identifier.includes('en-US') || voice.identifier.includes('en-GB')) &&
        voice.quality === Speech.VoiceQuality.Enhanced
      );
      setVoices(bestVoices);
      if (bestVoices.length > 0) {
        setSelectedVoice(bestVoices[0]);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  };

  const handleSpeak = async () => {
    try {
      const textToSpeak = translatedContent || summary;
      
      // Stop any ongoing speech
      if (isPlaying) {
        await Speech.stop();
        setIsPlaying(false);
        return;
      }

      // Configure speech options based on selected language
      const languageVoiceMap = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'zh': 'zh-CN',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'ru': 'ru-RU',
        'ar': 'ar-SA',
        'hi': 'hi-IN'
      };

      const options = {
        language: languageVoiceMap[targetLanguage] || 'en-US',
        pitch: 1.0,
        rate: 0.9,
      };

      setIsPlaying(true);
      
      await Speech.speak(textToSpeak, {
        ...options,
        onDone: () => {
          setIsPlaying(false);
        },
        onError: (error) => {
          console.error('Speech error:', error);
          setIsPlaying(false);
        }
      });

    } catch (error) {
      console.error('Speech error:', error);
      setIsPlaying(false);
      Alert.alert('Error', 'Failed to play speech');
    }
  };

  useEffect(() => {
    loadVoices();
    loadSavedArticles();
    return () => {
      Speech.stop();
    };
  }, [loadSavedArticles]);

  // Add a function to get language display name
  const getLanguageDisplay = (code) => {
    const languageMap = {
      'en': 'EN',
      'es': 'ES',
      'fr': 'FR',
      'de': 'DE',
      'zh': 'ZH',
      'ja': 'JA',
      'ko': 'KO',
      'ru': 'RU',
      'ar': 'AR',
      'hi': 'HI'
    };
    return languageMap[code] || code.toUpperCase();
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <View className="w-full flex-row justify-between items-center px-4 pt-10 pb-4 bg-white dark:bg-neutral-800">
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

      {summary ? (
        <View className="absolute bottom-0 left-0 right-0 bg-neutral-900">
          <View className="flex-row justify-between items-center px-4 py-3 border-b border-neutral-800">
            <View className="flex-row items-center space-x-4">
              <Text className="text-lg font-semibold text-white">
                Summary
              </Text>
              <TouchableOpacity 
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#404040',
                  borderRadius: 8,
                  height: 32,
                  paddingHorizontal: 8,
                  opacity: translating ? 0.6 : 1,
                }}
                onPress={() => {
                  if (translating) return;
                  Alert.alert(
                    "Select Language",
                    "",
                    [
                      { 
                        text: "English (EN)", 
                        onPress: () => handleTranslate('en'),
                        style: targetLanguage === 'en' ? 'default' : 'none'
                      },
                      { 
                        text: "Spanish (ES)", 
                        onPress: () => handleTranslate('es'),
                        style: targetLanguage === 'es' ? 'default' : 'none'
                      },
                      { 
                        text: "French (FR)", 
                        onPress: () => handleTranslate('fr'),
                        style: targetLanguage === 'fr' ? 'default' : 'none'
                      },
                      { 
                        text: "German (DE)", 
                        onPress: () => handleTranslate('de'),
                        style: targetLanguage === 'de' ? 'default' : 'none'
                      },
                      { 
                        text: "Chinese (ZH)", 
                        onPress: () => handleTranslate('zh'),
                        style: targetLanguage === 'zh' ? 'default' : 'none'
                      },
                      { 
                        text: "Japanese (JA)", 
                        onPress: () => handleTranslate('ja'),
                        style: targetLanguage === 'ja' ? 'default' : 'none'
                      },
                      { 
                        text: "Korean (KO)", 
                        onPress: () => handleTranslate('ko'),
                        style: targetLanguage === 'ko' ? 'default' : 'none'
                      },
                      { 
                        text: "Russian (RU)", 
                        onPress: () => handleTranslate('ru'),
                        style: targetLanguage === 'ru' ? 'default' : 'none'
                      },
                      { 
                        text: "Arabic (AR)", 
                        onPress: () => handleTranslate('ar'),
                        style: targetLanguage === 'ar' ? 'default' : 'none'
                      },
                      { 
                        text: "Hindi (HI)", 
                        onPress: () => handleTranslate('hi'),
                        style: targetLanguage === 'hi' ? 'default' : 'none'
                      },
                      { text: "Cancel", style: "cancel" }
                    ]
                  );
                }}
                disabled={translating}
              >
                <LanguageIcon 
                  size={14} 
                  color="white"
                  style={{ marginRight: 4 }}
                />
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                  {getLanguageDisplay(targetLanguage)}
                </Text>
                {translating ? (
                  <ActivityIndicator 
                    size="small" 
                    color="white" 
                    style={{ marginLeft: 4 }}
                  />
                ) : (
                  <View style={{ 
                    height: 8, 
                    width: 8, 
                    borderTopWidth: 2, 
                    borderRightWidth: 2, 
                    borderColor: 'white',
                    transform: [{ rotate: '135deg' }],
                    marginLeft: 4,
                    marginTop: -4,
                  }} />
                )}
              </TouchableOpacity>
            </View>
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                onPress={handleSpeak}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: '#404040',
                }}
              >
                <Ionicons 
                  name={isPlaying ? "pause-circle" : "play-circle"} 
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setSummary(null)}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: '#404040',
                }}
              >
                <XMarkIcon size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="p-4" style={{ maxHeight: height * 0.6 }}>
            {translating ? (
              <ActivityIndicator 
                size="large" 
                color="white"
              />
            ) : (
              <Text className="text-base text-gray-300">
                {translatedContent || summary}
              </Text>
            )}
          </ScrollView>
        </View>
      ) : (
        <TouchableOpacity
          onPress={generateSummary}
          disabled={summaryLoading}
          className="absolute bottom-4 right-4 bg-neutral-800 dark:bg-neutral-900 p-4 rounded-full shadow-lg"
          style={{
            opacity: summaryLoading ? 0.6 : 1,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <View className="flex-row items-center space-x-2">
            {summaryLoading && (
              <ActivityIndicator size="small" color="white" />
            )}
            <Text className="text-white font-bold">
              {summaryLoading ? "Generating..." : "Generate Summary"}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
