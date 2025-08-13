import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ViewToken,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { VideoItem } from '../api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ✅ Extract YouTube video ID from iframe/source
const getYouTubeVideoId = (source: string | undefined): string | null => {
  if (!source) return null;
  const match = source.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|embed\/|v\/|watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
};

// ✅ Return autoplay-enabled embed HTML
// Խնդրում եմ, համոոզվեք, որ այս ֆունկցիան նույնպես թարմացված է VideosScreen.tsx-ում
const getVideoEmbedHtml = (videoId: string): string => {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&controls=0&modestbranding=1&loop=1&playlist=${videoId}`;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        html, body {
          margin: 0;
          padding: 0;
          background-color: black;
          height: 100%;
          overflow: hidden;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }
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

interface ShortPlayerItemProps {
  item: VideoItem;
  isFocused: boolean;
}

const ShortPlayerItem = React.memo(({ item, isFocused }: ShortPlayerItemProps) => {
  const videoId = getYouTubeVideoId(item.iframe);

  if (!videoId) {
    return <View style={styles.videoContainer}><Text style={styles.errorText}>Վիդեոյի սխալ ձևաչափ</Text></View>;
  }

  const userName = item.author || "Օգտատեր";
  const musicTitle = item.musicTitle || "Օրիգինալ ձայն";

  return (
    <View style={styles.videoContainer}>
      {isFocused ? (
        <WebView
          originWhitelist={['*']}
          javaScriptEnabled
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          source={{ html: getVideoEmbedHtml(videoId) }}
          style={styles.webView}
        />
      ) : (
        <View style={styles.placeholder} />
      )}
      <View style={styles.overlayContent}>
        <Text
          style={styles.videoTitle}
          //numberOfLines-ը և ellipsizeMode-ը հեռացված են՝ ամբողջ վերնագիրը ցույց տալու համար
        >
          {item.title}
        </Text>
        <TouchableOpacity>
          <Text style={styles.userName}>@{userName}</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.musicInfo}>♫ {musicTitle}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionsContainer}>
        {/* Like Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>❤️</Text>
          <Text style={styles.actionText}>{(item.likes || 0) > 999 ? `${(item.likes / 1000).toFixed(1)}K` : item.likes || 0}</Text>
        </TouchableOpacity>
        {/* Comments Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{(item.comments || 0) > 999 ? `${(item.comments / 1000).toFixed(1)}K` : item.comments || 0}</Text>
        </TouchableOpacity>
        {/* Share Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>➡️</Text>
          <Text style={styles.actionText}>Կիսվել</Text>
        </TouchableOpacity>
        {/* More Options / Save Button (Optional) */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>...</Text>
          <Text style={styles.actionText}>Ավելին</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const ShortsPlayerScreen = ({ route, navigation }: any) => {
  const { shorts, startIndex } = route.params;
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null && index !== undefined) {
        setCurrentIndex(index);
      }
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

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
      {/* Close Button */}
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
    bottom: 90, // Այս արժեքը կարող է կարգավորման կարիք ունենալ, եթե վերնագիրը շատ երկար է դառնում
    left: 15,
    right: 100, // Այս արժեքը թողնում է 100px ազատ տարածք աջից գործողությունների համար
    paddingBottom: 15,
    // Add maxHeight if you want to cap how much vertical space it can take
    // maxHeight: SCREEN_HEIGHT * 0.3, // Օրինակ: Էկրանի բարձրության 30%-ը
  },
  videoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    marginBottom: 8,
    // numberOfLines-ը և ellipsizeMode-ը հեռացված են այս հատվածից
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 5,
  },
  musicInfo: {
    color: '#fff',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 90,
    right: 15,
    alignItems: 'center',
  },
  actionButton: {
    marginBottom: 20,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 30,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});



export default ShortsPlayerScreen;