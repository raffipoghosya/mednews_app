// /Users/raffipoghosyan/Desktop/mednews-app/src/api/index.ts

export const BASE_URL = 'https://mednews.am/api'; // Ձեր API-ի բազային URL-ը
const IMAGE_BASE_URL = 'https://mednews.am/uploads/'; // Ձեր նկարների բազային URL-ը

export interface Article {
  id: string;
  title: string;
  description?: string;
  excerpt?: string;
  image_url: string;
  date: string;
  content?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  excerpt?: string;
  image_url: string; // Thumbnail URL from API (Laravel's image_url appends)
  thumbnailUrl: string; // Mapped thumbnail URL for client
  iframe?: string; // <--- Սա այն դաշտն է, որը Laravel-ը տրամադրում է
  videoUrl: string; // Mapped video URL for client (սա կլինի ստանդարտ YouTube դիտման URL)
  type?: 'regular' | 'short' | 'slide';
  subtitle?: string;
}

interface FetchArticlesResponse {
  articles: Article[];
  totalCount: number;
}

export interface FetchVideosResponse {
  mainVideo: VideoItem | null;
  videos: VideoItem[];
  shorts: VideoItem[];
}

export function getImageSrc(o: any): string | null {
  const r = o.image_url || o.cover || o.img || o.image || o.thumbnail || o.thumb || null;
  if (!r) return null;
  if (r.startsWith('/')) return `https://mednews.am/${r}`;
  if (/^https?:\/\//.test(r)) return r;
  return IMAGE_BASE_URL + r;
}

// -----------------------------------------------------------
// ✅ ԿԱՐԵՎՈՐ ՓՈՓՈԽՈՒԹՅՈՒՆ: getVideoSource ֆունկցիան ավելի լավ է մշակում YouTube-ի ID-ները
// -----------------------------------------------------------
function getVideoSource(item: any): string {
  // Սկզբում վերցնում ենք iframe դաշտը, քանի որ դա Laravel-ն է տրամադրում
  const rawSource = item.iframe || item.video_url || ''; // video_url-ը պահում ենք որպես պահեստային տարբերակ

  if (!rawSource) {
    return ''; // Եթե աղբյուր չկա, վերադարձնում ենք դատարկ տող
  }

  let videoId = '';

  // 1. Փորձում ենք քաղել ID-ն ընդհանուր YouTube դիտման կամ կարճ հղումներից
  const watchOrShortsMatch = rawSource.match(/(?:youtube\.com\/(?:watch\?v=|v\/)|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})(?:\?|&|$)/);
  if (watchOrShortsMatch && watchOrShortsMatch[1]) {
    videoId = watchOrShortsMatch[1];
  }

  // 2. Եթե չգտնվեց, փորձում ենք քաղել ID-ն embed հղումից
  if (!videoId) {
      const embedMatch = rawSource.match(/(?:youtube\.com\/(?:embed|v)\/)([\w-]{11})(?:\?|&|$)/);
      if (embedMatch && embedMatch[1]) {
          videoId = embedMatch[1];
      }
  }

  // 3. Եթե դեռ չգտնվեց և հղումը բավական կարճ է (հնարավոր է ուղղակի ID է), փորձում ենք օգտագործել այն
  // Սա ստուգում է, թե արդյոք տողը 11 նիշ է և բաղկացած է YouTube ID-ի թույլատրելի նիշերից
  if (!videoId && rawSource.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(rawSource)) {
      videoId = rawSource;
  }

  if (videoId) {
    // Միշտ ստեղծում ենք ստանդարտ YouTube դիտման URL
    // Օգտագործում ենք HTTPS՝ ավելի հուսալի լինելու համար
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  // Եթե ոչ մի վավեր YouTube ID չգտնվեց, և հղումը ուղղակի HTTP/HTTPS հղում է, վերադարձնում ենք ինչպես կա (որպես պահեստային տարբերակ)
  if (rawSource.startsWith('http')) {
      return rawSource;
  }

  return ''; // Եթե ոչ մի վավեր URL կամ ID չգտնվեց
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

export const fetchVideosData = async (): Promise<FetchVideosResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/videos`);
    if (!response.ok) {
      throw new Error(`Failed to fetch videos data. Status: ${response.status}`);
    }
    const data = await response.json();

    const mapToVideoItems = (items: any[]): VideoItem[] => {
      return items.map((item: any) => ({
        id: String(item.id),
        title: item.title,
        description: item.description || '',
        excerpt: item.excerpt || '',
        image_url: item.image_url || '',
        thumbnailUrl: getImageSrc(item) || 'https://via.placeholder.com/300x200',
        iframe: item.iframe || '', // Laravel-ը ուղարկում է 'iframe' դաշտը
        videoUrl: getVideoSource(item), // Սա կօգտագործի 'iframe' դաշտը
        type: item.type || 'regular',
        subtitle: item.subtitle || '',
      }));
    };

    const slideVideos = mapToVideoItems(data.slideVideos || []);
    const videos = mapToVideoItems(data.videos || []);
    const shorts = mapToVideoItems(data.shorts || []);

    let mainVideo: VideoItem | null = null;
    if (slideVideos.length > 0) {
      mainVideo = { ...slideVideos[0], subtitle: slideVideos[0].subtitle || 'Դիտեք հիմա' };
    } else if (videos.length > 0) {
      mainVideo = { ...videos[0], subtitle: videos[0].subtitle || 'Դիտեք հիմա' };
    }

    const filteredSlideVideos = slideVideos.filter(v => v.id !== mainVideo?.id);
    const filteredVideos = videos.filter(v => v.id !== mainVideo?.id);


    return {
      mainVideo: mainVideo,
      videos: filteredVideos,
      shorts: shorts,
    };

  } catch (error) {
    console.error('Error fetching videos data:', error);
    return {
      mainVideo: null,
      videos: [],
      shorts: [],
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