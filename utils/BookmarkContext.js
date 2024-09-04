import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookmarkContext = createContext();

export const useBookmark = () => useContext(BookmarkContext);

export const BookmarkProvider = ({ children }) => {
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);

  useEffect(() => {
    loadBookmarkedArticles();
  }, []);

  const loadBookmarkedArticles = async () => {
    try {
      const savedArticles = await AsyncStorage.getItem("savedArticles");
      if (savedArticles) {
        setBookmarkedArticles(JSON.parse(savedArticles));
      }
    } catch (error) {
      console.log("Error loading bookmarked articles", error);
    }
  };

  const toggleBookmark = async (article) => {
    try {
      const updatedBookmarks = bookmarkedArticles.some(item => item.id === article.id)
        ? bookmarkedArticles.filter(item => item.id !== article.id)
        : [...bookmarkedArticles, article];

      setBookmarkedArticles(updatedBookmarks);
      await AsyncStorage.setItem("savedArticles", JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.log("Error toggling bookmark", error);
    }
  };

  const isBookmarked = (articleId) => {
    return bookmarkedArticles.some(item => item.id === articleId);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarkedArticles, toggleBookmark, isBookmarked, loadBookmarkedArticles }}>
      {children}
    </BookmarkContext.Provider>
  );
};