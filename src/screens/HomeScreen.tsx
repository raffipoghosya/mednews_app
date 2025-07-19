import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Header from '../components/Header';
import FooterNav from '../components/FooterNav';
import { fetchIndexData } from '../api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 14;
const SIDE_PADDING = 16;
const CARDS_WRAPPER_PADDING = CARD_GAP; // cardsWrapper-ի ներքին padding-ը

// ՓՈՓՈԽՈՒԹՅՈՒՆ: Ավելի ճշգրիտ CARD_W հաշվարկ
// Հաշվարկում ենք առկա տարածությունը երկու քարտի համար
// Ընդհանուր էկրանի լայնությունից հանում ենք կողքերի դատարկ տարածքները (SIDE_PADDING * 2)
// և cardsWrapper-ի ներքին padding-ները (CARDS_WRAPPER_PADDING * 2)
// և քարտերի միջև եղած բացը (CARD_GAP)
const TOTAL_SPACE_FOR_CARDS = SCREEN_WIDTH - (SIDE_PADDING * 2) - (CARDS_WRAPPER_PADDING * 2) - CARD_GAP;
const CARD_W = TOTAL_SPACE_FOR_CARDS / 2;

const CARD_H = 151;

// Օգնական ֆունկցիա՝ HTML թեգերը տեքստից հեռացնելու համար
const stripHtmlTags = (htmlString: string) => {
  if (!htmlString) return '';
  return htmlString.replace(/<\/?[^>]+(>|$)/g, "");
};

const HomeScreen = ({ navigation }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    fetchIndexData().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  // useEffect՝ սլայդերը ավտոմատ փոխելու համար
  useEffect(() => {
    if (data?.slidePosts && data.slidePosts.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlideIndex(prevIndex =>
          (prevIndex + 1) % Math.min(data.slidePosts.length, 6)
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [data?.slidePosts]);

  const renderPostCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ArticleScreen', { id: item.id })}>
      <Image source={{ uri: item.image_url }} style={styles.cardImg} />
      <BlurView
        intensity={70}
        tint="dark"
        style={styles.cardBlurOverlay}
      >
        <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
      </BlurView>
    </TouchableOpacity>
  );

  const renderArticleCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.articleCard}
      onPress={() => navigation.navigate('ArticleScreen', { id: item.id })}
    >
      <Image source={{ uri: item.image_url }} style={styles.articleImg} />
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.articleExcerpt} numberOfLines={2}>
          {stripHtmlTags(item.excerpt || item.description || '')}
        </Text>
        <Text style={styles.articleDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#802382" />
      </View>
    );
  }

  const currentSlidePost = data?.slidePosts ? data.slidePosts.slice(0, 6)[currentSlideIndex] : null;

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSectionContainer}>
          {currentSlidePost && (
            <TouchableOpacity style={styles.heroBox} onPress={() => navigation.navigate('ArticleScreen', { id: currentSlidePost.id })}>
              <Image source={{ uri: currentSlidePost.image_url }} style={styles.heroImg} />
              <BlurView
                intensity={70}
                tint="dark"
                style={styles.heroGradient}
              />
              <Text style={styles.heroTitle}>{currentSlidePost.title}</Text>
            </TouchableOpacity>
          )}

          {data?.slidePosts && (
            <View style={styles.cardsWrapper}>
              <FlatList
                data={data.slidePosts.slice(0, 6)}
                keyExtractor={(i) => String(i.id)}
                renderItem={renderPostCard}
                numColumns={2}
                columnWrapperStyle={{ gap: CARD_GAP }}
                ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* ---------- INTERVIEWS ---------- */}
        {data?.interviews && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>ՀԱՐՑԱԶՐՈՒՅՑՆԵՐ</Text>
            <View style={styles.articlesBoxWrapper}>
              <FlatList
                data={data.interviews.slice(0, 3)}
                keyExtractor={(item: any) => String(item.id)}
                renderItem={renderArticleCard}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
              />
            </View>
          </View>
        )}

        {/* Banner */}
        <Image
          source={require('../../assets/grid/reclam.png')}
          style={styles.middleBanner}
          resizeMode="cover"
        />

        {/* NEWS */}
        {data?.news && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>ԼՐԱՀՈՍ</Text>
            <View style={styles.articlesBoxWrapper}>
              <FlatList
                data={data.news.slice(0, 3)}
                keyExtractor={(item: any) => String(item.id)}
                renderItem={renderArticleCard}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footerAbsolute}>
        <FooterNav />
      </View>
    </View>
  );
};

export default HomeScreen;

/* ----------------------- STYLES ----------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: {
    backgroundColor: '#fff',
  },
  footerAbsolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  topSectionContainer: {
    backgroundColor: '#C5B2BF',
    paddingTop: 18,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginTop: CARD_GAP,
  },
  heroBox: {
    marginHorizontal: CARD_GAP,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 22,
  },
  heroImg: { width: '100%', height: '100%' },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    overflow: 'hidden',
  },
  heroTitle: { position: 'absolute', bottom: 14, left: 14, right: 14, color: '#fff', fontSize: 20, fontWeight: '700' },

  cardsWrapper: {
    marginHorizontal: SIDE_PADDING,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: CARDS_WRAPPER_PADDING, // Այստեղ կօգտագործվի նոր CARDS_WRAPPER_PADDING-ը, որը նույնն է CARD_GAP-ի հետ
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    width: CARD_W, // Օգտագործում ենք ճշգրտված CARD_W
    height: CARD_H,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImg: { width: '100%', height: '100%' },
  cardBlurOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },

  sectionContainer: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#802382',
    marginBottom: 12,
    paddingHorizontal: CARD_GAP,
  },
  articlesBoxWrapper: {
    marginHorizontal: CARD_GAP,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: CARD_GAP,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  articleImg: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  articleContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingLeft: 10,
  },
  articleTitle: { fontSize: 16, fontWeight: 'bold', color: '#1c1c1c' },
  articleExcerpt: { fontSize: 14, color: '#555', marginTop: 4, flexShrink: 1 },
  articleDate: { fontSize: 10, color: '#666', alignSelf: 'flex-end', marginRight: 10 },
  middleBanner: {
    height: 175,
    borderRadius: 14,
    marginHorizontal: CARD_GAP,
    marginTop: 28,
  },
});