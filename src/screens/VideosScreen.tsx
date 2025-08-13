// src/screens/VideosScreen.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView, // We use this for the content area
  ListRenderItem,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Header from '../components/Header';
import FooterNav from '../components/FooterNav';
import { fetchVideosData, VideoItem, FetchVideosResponse } from '../api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 15;
const CARD_GAP = 15;

// ✅ Extract YouTube video ID from iframe/source
const getYouTubeVideoId = (source: string | undefined): string | null => {
  if (!source) return null;

  const idMatch = source.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|embed\/|v\/|watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return idMatch ? idMatch[1] : null;
};

// ✅ Return autoplay-enabled embed HTML
const getVideoEmbedHtml = (videoId: string): string => {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&controls=1&modestbranding=1&rel=0`;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        html, body { margin: 0; padding: 0; background-color: black; height: 100%; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: 0; }
      </style>
    </head>
    <body>
      <iframe
        src="${embedUrl}"
        frameborder="0"
        allow="autoplay; encrypted-media; fullscreen"
        allowfullscreen
      ></iframe>
    </body>
    </html>
  `;
};

// --- ✅ Updated Video Player Component ---
const VideoPlayer = ({ videoId }: { videoId: string }) => {
  return (
    <View style={styles.webViewPlayer}>
      <WebView
        originWhitelist={['*']}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        source={{ html: getVideoEmbedHtml(videoId) }}
      />
    </View>
  );
};

const VideosScreen = ({ navigation }: any) => {
    const [data, setData] = useState<FetchVideosResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');

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

    const filteredData = useMemo(() => {
        if (!data) return { videos: [], shorts: [] };
        const lowerCaseSearchText = searchText.toLowerCase();

        const filterItems = (items: VideoItem[]) => {
            if (!lowerCaseSearchText) return items;
            return items.filter(item =>
                item.title.toLowerCase().includes(lowerCaseSearchText) ||
                (item.subtitle && item.subtitle.toLowerCase().includes(lowerCaseSearchText)) ||
                (item.author && item.author.toLowerCase().includes(lowerCaseSearchText))
            );
        };

        return {
            videos: filterItems(data.videos || []),
            shorts: filterItems(data.shorts || []),
        };
    }, [data, searchText]);

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
    
    const renderShortCard: ListRenderItem<VideoItem> = ({ item }) => (
        <TouchableOpacity
            style={styles.shortCard}
            onPress={() => item.iframe && filteredData.shorts && handleShortPress(item.id, filteredData.shorts)}
            activeOpacity={0.9}
        >
            <Image source={{ uri: item.thumbnailUrl }} style={styles.imageThumbnail} />
            <View style={styles.shortOverlay} />
            <Text style={styles.shortTitle} numberOfLines={2}>{item.title}</Text>
        </TouchableOpacity>
    );

    const renderShortsSection = () => {
        if (!filteredData.shorts || filteredData.shorts.length === 0) return null;
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>SHORTS</Text>
                <FlatList
                    data={filteredData.shorts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderShortCard}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.shortsListContent}
                />
            </View>
        );
    };

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
    const regularVideos = filteredData.videos || [];
    const initialVideos = regularVideos.slice(0, 3);
    initialVideos.forEach(video => allItems.push({ ...video, type: 'regular' }));

    if (filteredData.shorts && filteredData.shorts.length > 0) {
        allItems.push({ type: 'shorts_section', id: 'shorts_section_unique_id' });
    }

    const remainingVideos = regularVideos.slice(3);
    remainingVideos.forEach(video => allItems.push({ ...video, type: 'regular' }));

    return (
        // The main container is now a View to allow the Header to sit at the very top.
        <View style={styles.container}>
            {/* <Header /> */}
            {/* The content is wrapped in a SafeAreaView to protect it from notches and the home indicator. */}
            <SafeAreaView style={styles.safeContentContainer}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.contentArea}>
                        {/* Search Input */}
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Որոնել տեսանյութեր կամ շորթեր..."
                                placeholderTextColor="#999"
                                value={searchText}
                                onChangeText={setSearchText}
                                clearButtonMode="while-editing"
                                autoCapitalize="none"
                            />
                        </View>
                        {/* FlatList for videos and shorts */}
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
                                <View style={{ height: 40 }}>
                                    {(!filteredData.videos || filteredData.videos.length === 0) && (!filteredData.shorts || filteredData.shorts.length === 0) && (
                                        <Text style={styles.noVideosText}>Առայժմ տեսանյութեր չկան։</Text>
                                    )}
                                </View>
                            }
                            contentContainerStyle={{ paddingBottom: 20 }}
                            keyboardShouldPersistTaps="handled"
                        />
                    </View>
                </TouchableWithoutFeedback>
                {/* <FooterNav /> */}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // The background color should match the Header's color to fill the status bar area.
        backgroundColor: '#802382',
    },
    safeContentContainer: {
        flex: 1,
        // This container for the list and footer has the page's main background color.
        backgroundColor: '#f4f4f4',
    },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    contentArea: {
        flex: 1,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#802382',
      textAlign: 'left',
      marginVertical: 20,
      paddingLeft: HORIZONTAL_PADDING,
    },
    sectionContainer: { marginBottom: 25 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
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
    searchContainer: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 10,
        paddingBottom: 5,
        backgroundColor: '#f4f4f4', // Ensures search bar background is correct
    },
    searchInput: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
});

export default VideosScreen;