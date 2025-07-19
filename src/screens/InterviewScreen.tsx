import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Header from '../components/Header';
import FooterNav from '../components/FooterNav';
import { fetchArticlesByCategory, Article, fetchLatestArticles, fetchIndexData } from '../api/index';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
// ✅ Ավելացրել ենք BlurView-ի ներմուծումը
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient'; // Սա դեռ պահպանում ենք, եթե այլ տեղ օգտագործվում է

// ────────────────────────────────────────────────
// Navigation types
// ────────────────────────────────────────────────

type RootStackParamList = {
  Home: undefined;
  NewsScreen: undefined;
  Videos: undefined;
  InterviewScreen: undefined;
  Doctors: undefined;
  ArticleScreen: { id: string };
};

type InterviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'InterviewScreen'>;

// ────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 16; // Քարտերի միջև բացը և cardsWrapper-ի ներքին padding-ը
const SIDE_PADDING = 16; // cardsWrapper-ի արտաքին marginHorizontal-ի համար
const PRIMARY_COLOR = '#833F6D';
const LATEST_ARTICLE_BG = '#C5B2BF'; // Վերին հատվածի ֆոնի գույնը

// ✅ ՓՈՓՈԽՈՒԹՅՈՒՆ: Ավելի ճշգրիտ CARD_W հաշվարկ՝ համապատասխան HomeScreen-ին
// cardsWrapper-ի ներքին padding-ը մեր դեպքում նույն CARD_GAP-ն է
const CARDS_WRAPPER_INTERNAL_PADDING = CARD_GAP;

// (Ընդհանուր լայնություն - 2 * cardsWrapper-ի արտաքին margin - 2 * cardsWrapper-ի ներքին padding - քարտերի միջև եղած gap) / 2
const CARD_W = (SCREEN_WIDTH - (SIDE_PADDING * 2) - (CARDS_WRAPPER_INTERNAL_PADDING * 2) - CARD_GAP) / 2;

const CARD_H = 151;

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

const removeHtmlTags = (htmlString: string): string => htmlString?.replace(/<[^>]*>/g, '') ?? '';

const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
  const paddingToBottom = 20;
  return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
};

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────

const InterviewScreen = () => {
  const navigation = useNavigation<InterviewScreenNavigationProp>();

  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [slideArticles, setSlideArticles] = useState<Article[]>([]);
  const [middleArticles, setMiddleArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ──────────────────────────────────────────────
  // Data fetching
  // ──────────────────────────────────────────────

  const fetchInitialData = useCallback(async () => {
    setLoadingInitial(true);
    try {
      const [indexData, latestInterviews, interviewPageData] = await Promise.all([
        fetchIndexData(),
        fetchLatestArticles('interview', 3),
        fetchArticlesByCategory('interview', 1, 13)
      ]);

      setSlideArticles(indexData.slidePosts.slice(0, 6));
      setLatestArticles(latestInterviews);
      setMiddleArticles(interviewPageData.articles.slice(0, 3));
      setAllArticles(interviewPageData.articles.slice(3));
      
      setPage(2);
      setHasMore(interviewPageData.articles.length + 3 < interviewPageData.totalCount);

    } catch (err) {
      console.error('Failed to fetch initial interview articles:', err);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  const fetchMoreArticles = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPageData = await fetchArticlesByCategory('interview', page, 10);
      setAllArticles(prev => [...prev, ...nextPageData.articles]);
      setPage(prev => prev + 1);
      setHasMore(
        latestArticles.length + slideArticles.length + allArticles.length + nextPageData.articles.length < nextPageData.totalCount
      );
    } catch (err) {
      console.error('Failed to fetch more interview articles:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, page, allArticles.length, latestArticles.length, slideArticles.length]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // ──────────────────────────────────────────────
  // Render helpers
  // ──────────────────────────────────────────────

  const renderPostCard = useCallback(({ item }: { item: Article }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ArticleScreen', { id: item.id })}>
      <Image source={{ uri: item.image_url }} style={styles.cardImg} />
      {/* ✅ ՓՈՓՈԽՈՒԹՅՈՒՆ: Կիրառում ենք BlurView LinearGradient-ի փոխարեն */}
      <BlurView
        intensity={70}
        tint="dark"
        style={styles.cardBlurOverlay} // Կօգտագործենք HomeScreen-ի նման ոճ
      >
        <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
      </BlurView>
    </TouchableOpacity>
  ), [navigation]);

  const renderLatestArticle = useCallback(({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.latestArticleCard}
      onPress={() => navigation.navigate('ArticleScreen', { id: item.id })}
    >
      <Image source={{ uri: item.image_url }} style={styles.latestArticleImage} />
      <View style={styles.latestArticleTextContent}>
        <Text style={styles.latestArticleTitle} numberOfLines={2}>{item.title}</Text>
        {(item.description || item.excerpt) && (
          <Text style={styles.latestArticleExcerpt} numberOfLines={2}>
            {removeHtmlTags(item.description || item.excerpt || '')}
          </Text>
        )}
        <Text style={styles.latestArticleDate}>{new Date(item.date).toLocaleDateString('hy-AM')}</Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  // ──────────────────────────────────────────────
  // Early loading state
  // ──────────────────────────────────────────────

  if (loadingInitial) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  // ──────────────────────────────────────────────
  // JSX
  // ──────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) fetchMoreArticles();
        }}
        scrollEventThrottle={400}
      >
        {/* ───── TOP SECTION (Latest + Slide) ───── */}
        <View style={styles.topSectionContainer}>
          {latestArticles.length > 0 && (
            <View style={styles.latestArticlesSection}>
              <Text style={styles.pageTitle}>ՀԱՐՑԱԶՐՈՒՅՑՆԵՐ</Text>
              <View style={styles.latestBox}>
                <FlatList
                  data={latestArticles}
                  keyExtractor={(item) => `latest-${item.id}`}
                  renderItem={renderLatestArticle}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
                />
              </View>
            </View>
          )}

          {slideArticles.length > 0 && (
            <View style={styles.cardsWrapper}>
              <FlatList
                data={slideArticles}
                keyExtractor={(item) => `slide-${item.id}`}
                renderItem={renderPostCard}
                numColumns={2}
                columnWrapperStyle={{ gap: CARD_GAP }}
                ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* ───── MIDDLE SECTION ───── */}
        {middleArticles.length > 0 && (
          <View style={styles.sectionContainerWithTitle}>
            <Text style={styles.sectionTitle}>ԱՅԼ ՀԱՐՑԱԶՐՈՒՅՑՆԵՐ</Text>
            <View style={styles.latestBoxWrapper}>
              <FlatList
                data={middleArticles}
                keyExtractor={(item) => `middle-${item.id}`}
                renderItem={renderLatestArticle}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
              />
            </View>
          </View>
        )}

        {/* ───── BANNER ───── */}
        <Image source={require('../../assets/grid/reclam.png')} style={styles.middleBanner} resizeMode="cover" />

        {/* ───── ALL ARTICLES SECTION ───── */}
        {allArticles.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.latestBoxWrapper}>
              <FlatList
                data={allArticles}
                keyExtractor={(item) => `all-${item.id}`}
                renderItem={renderLatestArticle}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
                ListFooterComponent={() =>
                  loadingMore ? <ActivityIndicator size="small" color={PRIMARY_COLOR} style={{ marginVertical: 20 }} /> : null
                }
              />
            </View>
          </View>
        )}

        {!hasMore && !loadingMore && allArticles.length > 0 && (
          <Text style={styles.endOfFeedText}>Վերջ։ Ավելին չկա։</Text>
        )}
      </ScrollView>
      <FooterNav />
    </View>
  );
};

// ────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { paddingBottom: 24, backgroundColor: '#fff' },

  topSectionContainer: {
    backgroundColor: LATEST_ARTICLE_BG, 
    paddingTop: 10,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginTop:14,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
    marginVertical: 20,
    paddingHorizontal: SIDE_PADDING, // ✅ Օգտագործում ենք SIDE_PADDING
  },

  latestArticlesSection: {
    backgroundColor: LATEST_ARTICLE_BG,
    paddingHorizontal: SIDE_PADDING, // ✅ Օգտագործում ենք SIDE_PADDING
    marginBottom: CARD_GAP,
  },

  latestBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: CARD_GAP,
  },

  latestArticleCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    overflow: 'hidden',
  },

  latestArticleImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
  },

  latestArticleTextContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingLeft: 10,
  },

  latestArticleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1c1c',
  },

  latestArticleExcerpt: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    flexShrink: 1,
  },

  latestArticleDate: {
    fontSize: 10,
    color: '#666',
    alignSelf: 'flex-end',
    marginRight: 10,
  },

  cardsWrapper: {
    marginHorizontal: SIDE_PADDING, // ✅ Օգտագործում ենք SIDE_PADDING
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: CARD_GAP, // ✅ Օգտագործում ենք CARD_GAP
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  card: {
    width: CARD_W, // ✅ Նոր հաշվարկված CARD_W
    height: CARD_H,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImg: { 
    width: '100%', 
    height: '100%',
  },
  // ✅ ՓՈՓՈԽՈՒԹՅՈՒՆ: BlurView-ի ոճը HomeScreen-ի նման
  cardBlurOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%', // Կարող եք կարգավորել ըստ ցանկության
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  cardTitle: { 
    position: 'absolute', // Դիրքը մնում է նույնը, բայց այն BlurView-ի ներսում է
    // bottom, left, right արժեքները կախված կլինեն cardBlurOverlay-ի padding-ից,
    // եթե դուք դրանք ուզում եք ճշգրտել ըստ բլուրի ներքին տարածքի։
    // Այս դեպքում, քանի որ cardBlurOverlay-ը ունի padding, կարելի է դրանք թողնել,
    // քանի որ cardTitle-ը կգտնվի այդ padding-ի ներսում։
    bottom: 12, 
    left: 10, 
    right: 10, 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600',
  },

  middleBanner: {
    height: 150,
    borderRadius: 14,
    marginHorizontal: SIDE_PADDING, // ✅ Օգտագործում ենք SIDE_PADDING
    marginVertical: CARD_GAP + 8,
  },

  endOfFeedText: {
    textAlign: 'center',
    paddingVertical: 20,
    color: '#666',
    fontSize: 14,
  },

  sectionContainer: {
    marginTop: CARD_GAP,
    paddingHorizontal: SIDE_PADDING, // ✅ Օգտագործում ենք SIDE_PADDING
  },

  sectionContainerWithTitle: {
    marginTop: CARD_GAP,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 12,
    paddingHorizontal: SIDE_PADDING, // ✅ Օգտագործում ենք SIDE_PADDING
  },

  latestBoxWrapper: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: CARD_GAP,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginHorizontal: SIDE_PADDING, // ✅ Օգտագործում ենք SIDE_PADDING
  },
});

export default InterviewScreen;