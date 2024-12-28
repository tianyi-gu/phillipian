import axios from "axios";

// WordPress API Configuration
const WORDPRESS_API_BASE_URL = "https://phillipian.net/wp-json/wp/v2";
const POSTS_URL = `${WORDPRESS_API_BASE_URL}/posts`;
const PER_PAGE = 5;
const SEARCH_PER_PAGE = 10;

// Generic WordPress API call function with better error handling
const wordpressApiCall = async (endpoints, params = {}) => {
  const options = {
    method: "GET",
    url: endpoints,
    params: params,
  };

  try {
    console.log("API call to:", endpoints, "with params:", params);
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(`API call failed for endpoint: ${endpoints}`);
    console.error("Params:", params);
    
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      console.error("No response received");
    } else {
      console.error("Error setting up request:", error.message);
    }
    
    return [];
  }
};

// Fetch breaking news with proper error handling
export const fetchWordPressBreakingNews = async () => {
  console.log("Fetching breaking news...");
  try {
    const result = await wordpressApiCall(POSTS_URL, { 
      per_page: PER_PAGE 
    });

    console.log("Breaking news fetched:", result?.length, "items");
    
    if (!Array.isArray(result)) {
      console.error("Breaking news result is not an array:", result);
      return [];
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching breaking news:", error);
    return [];
  }
};

// Fetch recommended news with categories
export const fetchWordPressRecommendedNews = async () => {
  console.log("Fetching recommended news...");
  try {
    const result = await wordpressApiCall(POSTS_URL, { 
      per_page: PER_PAGE,
      categories: PER_PAGE 
    });
    
    console.log("Recommended news fetched:", result?.length, "items");
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error fetching recommended news:", error);
    return [];
  }
};

// Search WordPress news with validation
export const searchWordPressNews = async (searchQuery) => {
  if (!searchQuery || searchQuery.trim().length < 2) {
    console.log("Search query too short or empty");
    return [];
  }

  console.log("Searching WordPress news for:", searchQuery);
  try {
    const result = await wordpressApiCall(POSTS_URL, {
      search: searchQuery.trim(),
      per_page: SEARCH_PER_PAGE
    });

    console.log("Search results:", result?.length, "items found");
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error in searchWordPressNews:", error);
    return [];
  }
};
