import axios from "axios";

const WORDPRESS_API_BASE_URL = "https://phillipian.net/wp-json/wp/v2";
const POSTS_URL = `${WORDPRESS_API_BASE_URL}/posts`;
const PER_PAGE = 5;
const DEFAULT_IMAGE = 'https://phillipian.net/wp-content/uploads/2016/04/P-12.jpg';

const wordpressApiCall = async (endpoints, params = {}) => {
  try {
    const response = await axios.get(endpoints, { 
      params: {
        ...params,
        _fields: 'id,title,date,content,jetpack_featured_media_url,_links,_embedded',
        _embed: 'wp:featuredmedia,author'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("API call failed:", error.message);
    return [];
  }
};

const getImageUrl = (post) => {
  // Try to get image from different sources
  if (post.jetpack_featured_media_url && post.jetpack_featured_media_url !== '') {
    return post.jetpack_featured_media_url;
  }
  
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  
  // Try to extract first image from content if available
  if (post.content?.rendered) {
    const imgMatch = post.content.rendered.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) {
      return imgMatch[1];
    }
  }
  
  return DEFAULT_IMAGE;
};

const transformPost = (post) => {
  const imageUrl = getImageUrl(post);
  
  return {
    id: post.id.toString(), // Ensure id is a string
    title: post.title.rendered,
    date: post.date,
    jetpack_featured_media_url: imageUrl,
    yoast_head_json: {
      author: "The Phillipian",
      og_image: [{ url: imageUrl }]
    },
    urlToImage: imageUrl,
    content: post.content?.rendered || ''
  };
};

export const fetchWordPressBreakingNews = async () => {
  try {
    const url = 'https://phillipian.net/wp-json/wp/v2/posts?per_page=10';
    const response = await axios.get(url);
    // Return the data directly, just like in DiscoverScreen
    return response.data;
  } catch (error) {
    console.error("Error fetching breaking news:", error);
    return [];
  }
};

export const fetchWordPressRecommendedNews = async (page = 1) => {
  try {
    console.log('Fetching recommended news for page:', page);
    const url = `https://phillipian.net/wp-json/wp/v2/posts?per_page=10&page=${page}`;
    console.log('Fetching from URL:', url);
    
    const response = await axios.get(url);
    console.log('Received data length:', response.data?.length);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching recommended news:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return [];
  }
};

export const searchWordPressNews = async (searchTerm) => {
  try {
    const url = `https://phillipian.net/wp-json/wp/v2/posts?search=${encodeURIComponent(searchTerm)}`;
    const response = await axios.get(url);
    // Return the data directly, just like in DiscoverScreen and other functions
    return response.data;
  } catch (error) {
    console.error("Error searching news:", error);
    return [];
  }
};