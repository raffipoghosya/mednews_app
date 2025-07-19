// src/screens/ShortsPlayerScreen.tsx
import React, { useState, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  FlatList, 
  TouchableOpacity, 
  Text, 
  SafeAreaView,
  ViewToken
} from 'react-native';
import { WebView } from 'react-native-webview';
import { VideoItem } from '../api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- ⚙️ Օգնական ֆունկցիա՝ վիդեոյի HTML կոդը ստանալու համար ---
const getVideoEmbedHtml = (videoId: string): string => {
    // 👇 Ահա ուղղված տողը՝ $ նշանն ավելացված է
    const embedUrl = `https://www.youtube.com/embed/$${videoId}?autoplay=1&playsinline=1&controls=0&modestbranding=1&loop=1&playlist=${videoId}`;
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                body, html { margin: 0; padding: 0; overflow: hidden; background-color: black; height: 100%; }
                iframe { width: 100%; height: 100%; border: 0; }
            </style>
        </head>
        <body>
            <iframe
                src="${embedUrl}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
        </body>
        </html>
    `;
};

// --- Short Player-ի էլեմենտ ---
interface ShortPlayerItemProps {
  item: VideoItem;
  isFocused: boolean;
}

const ShortPlayerItem = React.memo(({ item, isFocused }: ShortPlayerItemProps) => {
    const getYouTubeId = (source: string): string | null => {
        const idMatch = source.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|embed\/|v\/|watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
        return idMatch ? idMatch[1] : null;
    };
    const videoId = getYouTubeId(item.iframe || '');

    if (!videoId) {
        return <View style={styles.videoContainer}><Text style={styles.errorText}>Վիդեոյի սխալ ձևաչափ։</Text></View>;
    }

    return (
        <View style={styles.videoContainer}>
            {isFocused ? (
                <WebView
                    originWhitelist={['*']}
                    source={{ html: getVideoEmbedHtml(videoId) }}
                    style={styles.webView}
                    javaScriptEnabled={true}
                    mediaPlaybackRequiresUserAction={false}
                    allowsInlineMediaPlayback={true}
                    onError={(e) => console.warn('WebView Error: ', e.nativeEvent)}
                />
            ) : (
                <View style={styles.placeholder} />
            )}
            <View style={styles.overlayContent}>
                <Text style={styles.videoTitle}>{item.title}</Text>
            </View>
        </View>
    );
});


// --- Shorts Player հիմնական էկրան ---
const ShortsPlayerScreen = ({ route, navigation }: any) => {
  const { shorts, startIndex } = route.params;
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    if (viewableItems.length > 0) {
      const firstViewableItem = viewableItems[0];
      if (firstViewableItem.index !== null) {
        setCurrentIndex(firstViewableItem.index);
      }
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const flatListRef = useRef<FlatList>(null);

  return (
    <SafeAreaView style={styles.container}>
        <FlatList
            ref={flatListRef}
            data={shorts}
            renderItem={({ item, index }) => (
                <ShortPlayerItem item={item} isFocused={index === currentIndex} />
            )}
            keyExtractor={(item) => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            initialScrollIndex={startIndex}
            getItemLayout={(data, index) => (
                { length: SCREEN_HEIGHT, offset: SCREEN_HEIGHT * index, index }
            )}
        />
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    webView: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    placeholder: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: '#000',
    },
    overlayContent: {
        position: 'absolute',
        bottom: 100,
        left: 15,
        right: 15,
    },
    videoTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        left: 15,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'white'
    }
});

export default ShortsPlayerScreen;