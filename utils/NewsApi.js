import { newsApiKey } from "./ApiKey";
import axios from "axios";


// Wordpress API
const wordpressApiBaseUrl = "https://phillipian.net/wp-json/wp/v2";

// Endpoints
const postsUrl = `${wordpressApiBaseUrl}/posts`;

const wordpressApiCall = async (endpoints, params) => {
  const options = {
    method: "GET",
    url: endpoints,
    params: params ? params : {},
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(`API call failed for endpoint: ${endpoints}`);
    console.error(`Params:`, params);
    console.error(`Error:`, error.response ? error.response.data : error.message);
    return [];
  }
};

export const fetchWordPressBreakingNews = async () => {
  console.log("Fetching breaking news...");
  const result = await wordpressApiCall(postsUrl, { per_page: 5 });
  console.log("Breaking news fetched:", result.length, "items");
  return result;
};

export const fetchWordPressRecommendedNews = async () => {
  console.log("Fetching recommended news...");
  const result = await wordpressApiCall(postsUrl, { per_page: 5, categories: 5 });
  console.log("Recommended news fetched:", result.length, "items");
  return result;
};

// Working with News API

const apiBaseUrl = "https://newsapi.org/v2";

const breakingNewsUrl = `${apiBaseUrl}/top-headlines?country=us&apiKey=${newsApiKey}`;
const recommendedNewsUrl = `${apiBaseUrl}/top-headlines?country=us&category=business&apiKey=${newsApiKey}`;

const discoverNewsUrl = (discover) =>
  `${apiBaseUrl}/top-headlines?country=us&category=${discover}&apiKey=${newsApiKey}`;


const searchNewsUrl = (query) =>
  `${apiBaseUrl}/everything?q=${query}&apiKey=${newsApiKey}`;


const newsApiCall = async (endpoints, params) => {
  const options = {
    method: "GET",
    url: endpoints,
    params: params ? params : {},
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const fetchBreakingNews = async () => {
  return await newsApiCall(breakingNewsUrl);
};

export const fetchRecommendedNews = async () => {
  return await newsApiCall(recommendedNewsUrl);
};

export const fetchDiscoverNews = async (discover) => {
  return await newsApiCall(discoverNewsUrl(discover));
};


export const fetchSearchNews = async (query) => {
  const endpoint = searchNewsUrl(query);
  return await newsApiCall(endpoint);
};


const testFetchBreakingNews = async () => {
  console.log("Testing fetchBreakingNews API call...");
  try {
    const data = await fetchBreakingNews();
    console.log("Breaking News:", data);
  } catch (error) {
    console.error("Test Failed: ", error);
  }
};

// testFetchBreakingNews();
