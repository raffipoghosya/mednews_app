import React, { useEffect, useState } from 'react';
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
import Header from '../components/Header';
import FooterNav from '../components/FooterNav'; // Այս անունով եք օգտագործում footer-ը
import { fetchIndexData } from '../api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 14;
const SIDE_PADDING = 16;
const CARD_W = (SCREEN_WIDTH - SIDE_PADDING * 2 - CARD_GAP) / 2;
const CARD_H = 151;

// Օգնական ֆունկցիա՝ HTML թեգերը տեքստից հեռացնելու համար
const stripHtmlTags = (htmlString: string) => {
  if (!htmlString) return '';
  return htmlString.replace(/<\/?[^>]+(>|$)/g, ""); // Կանոնավոր արտահայտություն HTML թեգերը հեռացնելու համար
};

const HomeScreen = ({ navigation }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndexData().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const renderPostCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ArticleScreen', { id: item.id })}>
      <Image source={{ uri: item.image_url }} style={styles.cardImg} />
      <LinearGradient colors={['rgba(0,0,0,0.35)', 'transparent']} style={styles.cardGradient} />
      <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#802382" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      {/* ScrollView-ն այժմ զբաղեցնում է ամբողջ տարածքը, բացառությամբ Header-ի և Footer-ի համար նախատեսված հատվածների */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* New container for the top purple section */}
        <View style={styles.topSectionContainer}>
          {/* HERO */}
          {data?.lastPost && (
            <TouchableOpacity style={styles.heroBox} onPress={() => navigation.navigate('ArticleScreen', { id: data.lastPost.id })}>
              <Image source={{ uri: data.lastPost.image_url }} style={styles.heroImg} />
              <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent']} style={styles.heroGradient} />
              <Text style={styles.heroTitle}>{data.lastPost.title}</Text>
            </TouchableOpacity>
          )}

          {/* SLIDE */}
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

        {/* The rest of the content sits directly on the white background */}
        
        {/* ---------- INTERVIEWS ---------- */}
        {data?.interviews && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>ՀԱՐՑԱԶՐՈՒՅՑՆԵՐ</Text>
            <View style={styles.articlesBox}>
              {data.interviews.slice(0, 3).map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.articleCard}
                  onPress={() => navigation.navigate('ArticleScreen', { id: item.id })}
                >
                  <Image source={{ uri: item.image_url }} style={styles.articleImg} />
                  <View style={styles.articleContent}>
                    <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
                    {/* HTML թեգերը հեռացված են այստեղ */}
                    <Text style={styles.articleExcerpt} numberOfLines={2}>
                      {stripHtmlTags(item.excerpt || item.description || '')}
                    </Text>
                    <Text style={styles.articleDate}>{item.date}</Text>
                  </View>
                </TouchableOpacity>
              ))}
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
            <View style={styles.articlesBox}>
              {data.news.slice(0, 3).map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.articleCard}
                  onPress={() => navigation.navigate('ArticleScreen', { id: item.id })}
                >
                  <Image source={{ uri: item.image_url }} style={styles.articleImg} />
                  <View style={styles.articleContent}>
                    <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
                    {/* HTML թեգերը հեռացված են այստեղ */}
                    <Text style={styles.articleExcerpt} numberOfLines={2}>
                      {stripHtmlTags(item.excerpt || item.description || '')}
                    </Text>
                    <Text style={styles.articleDate}>{item.date}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer-ը տեղադրում ենք էկրանի ներքևում՝ բացարձակ դիրքով */}
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
    backgroundColor: '#fff', // Էկրանի հիմնական ֆոնը թող սպիտակ մնա
  },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // ScrollView-ի բովանդակության ոճեր
  scrollContent: {
    backgroundColor: '#fff', // ScrollView-ի բովանդակությունը սպիտակ է
  },

  // Footer-ի համար բացարձակ դիրք
  footerAbsolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1, // Համոզվեք, որ Footer-ը բովանդակությունից վերև է
  },

  // NEW: Container for the top purple section
  topSectionContainer: {
    backgroundColor: '#d8c9de',
    paddingTop: 18,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  heroBox: {
    marginHorizontal: CARD_GAP,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 22,
  },
  heroImg: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%' },
  heroTitle: { position: 'absolute', bottom: 14, left: 14, right: 14, color: '#fff', fontSize: 20, fontWeight: '700' },
  
  cardsWrapper: {
    marginHorizontal: CARD_GAP,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: CARD_GAP,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  card: { width: CARD_W, height: CARD_H, borderRadius: 12, overflow: 'hidden' },
  cardImg: { width: '100%', height: '100%' },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%' },
  cardTitle: { position: 'absolute', bottom: 12, left: 10, right: 10, color: '#fff', fontSize: 14, fontWeight: '600' },

  // NEW: A container for content sections on the white background
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

  // RENAMED from whiteBox to articlesBox for clarity
  articlesBox: {
    marginHorizontal: CARD_GAP,
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 14,
  },
  
  articleCard: { flexDirection: 'row', backgroundColor: '#ececec', borderRadius: 18, padding: 12 },
  articleImg: { width: 90, height: 90, borderRadius: 16, marginRight: 14, backgroundColor: '#eee' },

  articleContent: { flex: 1, minWidth: 0 },
  articleTitle: { fontSize: 16, fontWeight: '800', color: '#1c1c1c', lineHeight: 20, flexShrink: 1, flexWrap: 'wrap' },
  articleExcerpt: { fontSize: 14, color: '#555', marginTop: 4, lineHeight: 18 }, // Այս ոճն է օգտագործվում նկարագրության համար
  articleDate: { fontSize: 12, color: '#999', marginTop: 6, alignSelf: 'flex-end' },

  middleBanner: {
    height: 175,
    borderRadius: 14,
    marginLeft:35, // Ձախ կողմից
    marginRight: 10, // Աջ կողմից
    marginTop: 28,
  },
});