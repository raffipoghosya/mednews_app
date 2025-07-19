// src/screens/VideosScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  ListRenderItem,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Header from '../components/Header';
import FooterNav from '../components/FooterNav';
import { fetchVideosData, VideoItem, FetchVideosResponse } from '../api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 15;
const CARD_GAP = 15;

// --- ⚙️ ՆՈՐ, ՊԱՐԶ ԵՎ ՃԻՇՏ ՖՈՒՆԿՑԻԱ ---
// Ստանում է ցանկացած YouTube հղում և վերադարձնում է embed տարբերակը
const getYouTubeVideoId = (source: string | undefined): string | null => {
  if (!source) return null;

  const idMatch = source.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|embed\/|v\/|watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return idMatch ? idMatch[1] : null;
};






// --- ✅ Թարմացված Video Player կոմպոնենտ ---
// Այժմ սպասում է `uri`, ոչ թե `html`
const VideoPlayer = ({ videoId }: { videoId: string }) => {
  return (
    <View style={styles.webViewPlayer}>
      <WebView
        originWhitelist={['*']}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        source={{
          html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                html, body {
                  margin: 0;
                  padding: 0;
                  background-color: black;
                }
                iframe {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  border: 0;
                }
              </style>
            </head>
            <body>
              <iframe
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&controls=1"
                allow="autoplay; encrypted-media"
                allowfullscreen
              ></iframe>
            </body>
          </html>
          `,
        }}
      />
    </View>
  );
};





const VideosScreen = ({ navigation }: any) => {
    const [data, setData] = useState<FetchVideosResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

    useEffect(() => {
        const loadVideos = async () => {
            try {
                const videosData = await fetchVideosData();
                setData(videosData);
            } catch (error) {
                console.error("Error fetching videos:", error);
                alert('An error occurred while loading videos.');
            } finally {
                setLoading(false);
            }
        };
        loadVideos();
    }, []);

    const handlePlayVideo = (videoId: string) => {
        setPlayingVideoId(currentId => (currentId === videoId ? null : videoId));
    };

    const handleShortPress = (shortId: string, allShorts: VideoItem[]) => {
        const startIndex = allShorts.findIndex(s => s.id === shortId);
        navigation.navigate('ShortsPlayer', {
            shorts: allShorts,
            startIndex: startIndex,
        });
    };

    // --- ✅ Թարմացված Regular Video Card ---
    const renderVideoCard: ListRenderItem<VideoItem> = ({ item }) => {
      const isPlaying = playingVideoId === item.id;
      const videoId = isPlaying ? getYouTubeVideoId(item.iframe) : null;
    
      return (
        <View style={styles.cardWrapper}>
          {isPlaying && videoId ? (
            <View style={styles.videoCard}>
              <View style={styles.videoThumbnail}>
                <VideoPlayer videoId={videoId} />
              </View>
              <View style={styles.videoContent}>
                <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.videoSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.videoCard}
              onPress={() => item.iframe && handlePlayVideo(item.id)}
              activeOpacity={0.9}>
              <View style={styles.videoThumbnail}>
                <Image source={{ uri: item.thumbnailUrl }} style={styles.imageThumbnail} />
                <View style={styles.playIconOverlay}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              </View>
              <View style={styles.videoContent}>
                <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.videoSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
      );
    };
    
    

    // --- Component to render Short Card ---
    const renderShortCard: ListRenderItem<VideoItem> = ({ item }) => (
        <TouchableOpacity
            style={styles.shortCard}
            onPress={() => item.iframe && data?.shorts && handleShortPress(item.id, data.shorts)}
            activeOpacity={0.9}
        >
            <Image source={{ uri: item.thumbnailUrl }} style={styles.imageThumbnail} />
            <View style={styles.shortOverlay} />
            <Text style={styles.shortTitle} numberOfLines={2}>{item.title}</Text>
        </TouchableOpacity>
    );

    // --- Component to render Shorts Section ---
    const renderShortsSection = () => {
        if (!data?.shorts || data.shorts.length === 0) return null;
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>SHORTS</Text>
                <FlatList
                    data={data.shorts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderShortCard}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.shortsListContent}
                />
            </View>
        );
    };

    // --- Main renderItem for the combined FlatList ---
    const renderCombinedItem: ListRenderItem<VideoItem | { type: 'shorts_section' }> = ({ item }) => {
        if ((item as any).type === 'shorts_section') {
            return renderShortsSection();
        }
        return renderVideoCard({ item: item as VideoItem, index: 0, separators: null as any });
    };


    if (loading) {
        return (
            <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#802382" />
            </View>
        );
    }

    const allItems: (VideoItem | { type: 'shorts_section', id: string })[] = [];
    const regularVideos = data?.videos || [];
    const initialVideos = regularVideos.slice(0, 3);
    initialVideos.forEach(video => allItems.push({ ...video, type: 'regular' }));

    if (data?.shorts && data.shorts.length > 0) {
        allItems.push({ type: 'shorts_section', id: 'shorts_section_unique_id' });
    }

    const remainingVideos = regularVideos.slice(3);
    remainingVideos.forEach(video => allItems.push({ ...video, type: 'regular' }));

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <FlatList
                data={allItems}
                keyExtractor={(item, index) => item.id || `item-${index}`}
                renderItem={renderCombinedItem}
                extraData={playingVideoId}
                ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
                ListHeaderComponent={
                    <Text style={styles.pageTitle}>ՏԵՍԱԴԱՐԱՆ</Text>
                }
                ListFooterComponent={
                    <View style={{ height: 100 }}>
                        {(!data?.videos || data.videos.length === 0) && (!data?.shorts || data.shorts.length === 0) && (
                            <Text style={styles.noVideosText}>Առայժմ տեսանյութեր չկան։</Text>
                        )}
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 20 }}
            />
            <View style={styles.footerAbsolute}>
                <FooterNav />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f4' },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    footerAbsolute: { position: 'absolute', bottom: 0, left: 0, right: 0 },
    pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#802382', textAlign: 'left', marginVertical: 20 , marginRight:30},
    sectionContainer: { marginBottom: 25 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, paddingHorizontal: HORIZONTAL_PADDING },
    noVideosText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },

    cardWrapper: { paddingHorizontal: HORIZONTAL_PADDING },
    videoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    videoThumbnail: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageThumbnail: {
        width: '100%',
        height: '100%',
    },
    webViewPlayer: {
      width: '100%',
      height: (SCREEN_WIDTH - (HORIZONTAL_PADDING * 2)) * 9 / 16,
      backgroundColor: '#000',
      opacity: 0.99,
      overflow: 'hidden',
    },
    playIconOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    playIcon: {
        fontSize: 45,
        color: 'rgba(255,255,255,0.95)',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    videoContent: { padding: 12 },
    videoTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    videoSubtitle: { fontSize: 13, color: '#666', marginTop: 4 },

    shortsListContent: { paddingHorizontal: HORIZONTAL_PADDING },
    shortCard: {
        width: SCREEN_WIDTH * 0.35,
        aspectRatio: 9 / 16,
        marginRight: CARD_GAP,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
        justifyContent: 'flex-end',
    },
    shortOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    shortTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#fff',
        padding: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
});

export default VideosScreen;