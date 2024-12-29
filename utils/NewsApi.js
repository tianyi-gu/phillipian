import axios from "axios";

const WORDPRESS_API_BASE_URL = "https://phillipian.net/wp-json/wp/v2";
const POSTS_URL = `${WORDPRESS_API_BASE_URL}/posts`;
const PER_PAGE = 5;

const wordpressApiCall = async (endpoints, params = {}) => {
  try {
    console.log("Making API call to:", endpoints, "with params:", params);
    const response = await axios.get(endpoints, { params });
    
    console.log("API Response status:", response.status);
    if (response.data && Array.isArray(response.data)) {
      console.log("API returned", response.data.length, "items");
    }
    
    return response.data;
  } catch (error) {
    console.error("API call failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return [];
  }
};

const transformPost = (post) => {
  console.log("Transforming post:", post.id);
  return {
    id: post.id,
    title: post.title.rendered,
    date: post.date,
    jetpack_featured_media_url: post.jetpack_featured_media_url,
    yoast_head_json: {
      author: "The Phillipian",
      og_image: [{
        url: post.jetpack_featured_media_url || 'https://phillipian.net/wp-content/uploads/2016/04/P-12.jpg'
      }]
    },
    urlToImage: post.jetpack_featured_media_url || 'https://phillipian.net/wp-content/uploads/2016/04/P-12.jpg'
  };
};

export const fetchWordPressBreakingNews = async () => {
  console.log("Fetching breaking news...");
  try {
    const result = await wordpressApiCall(POSTS_URL, { 
      per_page: PER_PAGE,
      orderby: 'date',
      order: 'desc'
    });

    if (!Array.isArray(result)) {
      console.error("Breaking news result is not an array");
      return [];
    }

    const transformed = result.map(transformPost);
    console.log("Breaking news transformed:", transformed.length, "items");
    return transformed;
  } catch (error) {
    console.error("Error fetching breaking news:", error);
    return [];
  }
};

export const fetchWordPressRecommendedNews = async () => {
  console.log("Fetching recommended news...");
  try {
    const result = await wordpressApiCall(POSTS_URL, { 
      per_page: PER_PAGE,
      offset: PER_PAGE,
      orderby: 'date',
      order: 'desc'
    });
    
    if (!Array.isArray(result)) {
      console.error("Recommended news result is not an array");
      return [];
    }

    const transformed = result.map(transformPost);
    console.log("Recommended news transformed:", transformed.length, "items");
    return transformed;
  } catch (error) {
    console.error("Error fetching recommended news:", error);
    return [];
  }
};