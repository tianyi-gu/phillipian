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
