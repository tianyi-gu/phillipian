import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookmarkContext = createContext();
const STORAGE_KEY = "savedArticles";

export const useBookmark = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmark must be used within a BookmarkProvider');
  }
  return context;
};

export const BookmarkProvider = ({ children }) => {
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);

  const loadBookmarkedArticles = useCallback(async () => {
    try {
      const savedArticles = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedArticles) {
        setBookmarkedArticles(JSON.parse(savedArticles));
      }
    } catch (error) {
      console.error("Error loading bookmarked articles:", error);
      // Optionally reset to empty state on error
      setBookmarkedArticles([]);
    }
  }, []);

  const toggleBookmark = useCallback(async (article) => {
    if (!article?.id) {
      console.error("Invalid article object");
      return;
    }

    try {
      const updatedBookmarks = bookmarkedArticles.some(item => item.id === article.id)
        ? bookmarkedArticles.filter(item => item.id !== article.id)
        : [...bookmarkedArticles, article];

      setBookmarkedArticles(updatedBookmarks);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      // Reload original state on error
      loadBookmarkedArticles();
    }
  }, [bookmarkedArticles, loadBookmarkedArticles]);

  const isBookmarked = useCallback((articleId) => {
    if (!articleId) return false;
    return bookmarkedArticles.some(item => item.id === articleId);
  }, [bookmarkedArticles]);

  const clearBookmarks = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setBookmarkedArticles([]);
    } catch (error) {
      console.error("Error clearing bookmarks:", error);
    }
  }, []);

  useEffect(() => {
    loadBookmarkedArticles();
  }, [loadBookmarkedArticles]);

  const value = {
    bookmarkedArticles,
    toggleBookmark,
    isBookmarked,
    loadBookmarkedArticles,
    clearBookmarks,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};