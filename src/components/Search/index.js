import { searchWordPressNews } from '../../api/NewsApi';

const handleSearch = async (searchTerm) => {
  try {
    const results = await searchWordPressNews(searchTerm);
    // handle results
  } catch (error) {
    console.error('Error fetching news:', error);
  }
}; 