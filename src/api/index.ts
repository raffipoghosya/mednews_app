// /Users/raffipoghosyan/Desktop/mednews-app/src/api/index.ts

export const BASE_URL = 'http://192.168.15.106:8000/api'; // Your specified base URL
const IMAGE_BASE_URL = 'http://192.168.15.106:8000/uploads/'; // Assuming this is for direct image paths
// http://192.168.15.107:8000
export interface Article {
  id: string;
  title: string;
  description?: string;
  excerpt?: string;
  image_url: string;
  date: string;
  content?: string;
}

interface FetchArticlesResponse {
  articles: Article[];
  totalCount: number;
}

export function getImageSrc(o: any): string | null {
  const r = o.image_url || o.cover || o.img || o.image || o.thumbnail || o.thumb || null;
  if (!r) return null;
  if (r.startsWith('/')) return `http://192.168.15.106:8000${r}`;
  if (/^https?:\/\//.test(r)) return r;
  return IMAGE_BASE_URL + r;
}


export async function fetchLatestArticles(
  category: string,
  limit: number
): Promise<Article[]> {
  try {
    const response = await fetch(`${BASE_URL}/${category}?limit=${limit}&page=1`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    let articles = Array.isArray(data) ? data : (data.data || []); 

    // ✅ FIX: Ensure we only take the number of articles we asked for.
    articles = articles.slice(0, limit);

    return articles.map((item: any) => ({
      id: String(item.id),
      title: item.title,
      description: item.description || '',
      excerpt: item.excerpt || '',
      image_url: getImageSrc(item) || 'https://via.placeholder.com/150',
      date: item.date || new Date().toISOString(),
    }));
  } catch (error) {
    console.error(`Error fetching latest ${category} articles:`, error);
    return [];
  }
}

export async function fetchArticlesByCategory(
  category: string,
  page: number = 1,
  limit: number = 10
): Promise<FetchArticlesResponse> {
  try {
    const response = await fetch(`${BASE_URL}/${category}?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    let articles = Array.isArray(data) ? data : (data.data || []); 
    const totalCount = data.total || data.meta?.total || articles.length;
    
    // ✅ FIX: Apply the same logic here for consistency.
    articles = articles.slice(0, limit);

    const mappedArticles: Article[] = articles.map((item: any) => ({
      id: String(item.id),
      title: item.title,
      description: item.description || '',
      excerpt: item.excerpt || '',
      image_url: getImageSrc(item) || 'https://via.placeholder.com/150',
      date: item.date || new Date().toISOString(),
    }));

    return { articles: mappedArticles, totalCount };
  } catch (error) {
    console.error(`Error fetching ${category} articles for page ${page}:`, error);
    return { articles: [], totalCount: 0 };
  }
}

export const fetchIndexData = async () => {
  try {
    const [indexRes, interviewRes, newsRes] = await Promise.all([
      fetch(`${BASE_URL}/index`),
      fetch(`${BASE_URL}/interview?page=1&limit=3`), 
      fetch(`${BASE_URL}/news?page=1&limit=3`),
    ]);

    if (!indexRes.ok || !interviewRes.ok || !newsRes.ok) {
      if (!indexRes.ok) console.error('Failed to fetch index data:', await indexRes.text());
      if (!interviewRes.ok) console.error('Failed to fetch interviews:', await interviewRes.text());
      if (!newsRes.ok) console.error('Failed to fetch news:', await newsRes.text());
      throw new Error('Failed to fetch home data from one or more endpoints.');
    }

    const indexData = await indexRes.json();
    const interviewsData = await interviewRes.json();
    const newsData = await newsRes.json();

    const mapToArticles = (items: any[]): Article[] => {
      return items.map((item: any) => ({
        id: String(item.id),
        title: item.title,
        description: item.description || '',
        excerpt: item.excerpt || '',
        image_url: getImageSrc(item) || 'https://via.placeholder.com/150',
        date: item.date || new Date().toISOString(),
      }));
    };

    // ✅ FIX: Apply the slice fix here as well before mapping.
    const interviews = Array.isArray(interviewsData.data) ? interviewsData.data : interviewsData;
    const news = Array.isArray(newsData.data) ? newsData.data : newsData;

    return {
      lastPost: indexData.lastPost ? { 
        ...indexData.lastPost, 
        id: String(indexData.lastPost.id),
        image_url: getImageSrc(indexData.lastPost) || 'https://via.placeholder.com/150',
        description: indexData.lastPost.description || '',
        excerpt: indexData.lastPost.excerpt || '',
        date: indexData.lastPost.date || new Date().toISOString(),
      } : null,
      lastPosts: mapToArticles(indexData.lastPosts || []),
      slidePosts: mapToArticles(indexData.slidePosts || []),
      interviews: mapToArticles(interviews.slice(0, 3)),
      news: mapToArticles(news.slice(0, 3)),
    };
  } catch (error) {
    console.error('Error fetching index data:', error);
    return {
      lastPost: null,
      lastPosts: [],
      slidePosts: [],
      interviews: [],
      news: [],
    };
  }
};

export const fetchArticleData = async (id: string | number) => {
  try {
    const response = await fetch(`${BASE_URL}/post/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch article with ID ${id}. Status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.post) {
      throw new Error(`Article data for ID ${id} not found in response.`);
    }

    return {
      ...data.post,
      id: String(data.post.id),
      title: data.post.title || '',
      description: data.post.description || '',
      excerpt: data.post.excerpt || '',
      content: data.post.content || '',
      image_url: getImageSrc(data.post) || 'https://via.placeholder.com/150',
      date: data.post.date || new Date().toISOString(),
      images: (data.gallery || []).map((img: any) => ({ url: getImageSrc(img) || 'https://via.placeholder.com/150' })),
    } as Article & { images: { url: string }[] };
  } catch (error) {
    console.error(`Error fetching article with ID ${id}:`, error);
    throw error;
  }
};