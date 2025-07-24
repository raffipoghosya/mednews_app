import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_ROWS = 6; // 3 × 6 = 18 images

/**
 * SplashScreen
 * ─ Shows MedNews logo centred, fades+slides in from left → right, then lifts to top (10 px from status-bar).
 * ─ When logo reaches top, a 3 × 6 grid of images fades in below it. Grid cells are separated by thin lines.
 * ─ After 10 s total → navigates to Home.
 */
const SplashScreen = () => {
  const navigation = useNavigation();

  /* Animations */
  const logoOpacity     = useRef(new Animated.Value(0)).current;
  const logoTranslateX  = useRef(new Animated.Value(-50)).current; // slide in
  const logoTranslateY  = useRef(new Animated.Value(0)).current;   // lift up
  const gridOpacity     = useRef(new Animated.Value(0)).current;

  /* Grid images (local) */
  const images = [
    { id: '1',  src: require('../../assets/grid/1.png') },
    { id: '2',  src: require('../../assets/grid/2.png') },
    { id: '3',  src: require('../../assets/grid/3.png') },
    { id: '4',  src: require('../../assets/grid/4.png') },
    { id: '5',  src: require('../../assets/grid/5.png') },
    { id: '6',  src: require('../../assets/grid/6.png') },
    { id: '7',  src: require('../../assets/grid/7.png') },
    { id: '8',  src: require('../../assets/grid/8.png') },
    { id: '9',  src: require('../../assets/grid/9.png') },
    { id: '10', src: require('../../assets/grid/10.png') },
    { id: '11', src: require('../../assets/grid/11.png') },
    { id: '12', src: require('../../assets/grid/12.png') },
    { id: '13', src: require('../../assets/grid/13.png') },
    { id: '14', src: require('../../assets/grid/14.png') },
    { id: '15', src: require('../../assets/grid/15.png') },
    { id: '16', src: require('../../assets/grid/16.png') },
    { id: '17', src: require('../../assets/grid/17.png') },
    { id: '18', src: require('../../assets/grid/18.png') },
  ];

  useEffect(() => {
    /* 1) logo fade + slide-in */
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
    Animated.timing(logoTranslateX, {
      toValue: 0,
      duration: 700,
      useNativeDriver: true,
    }).start(() => {
      /* 2) lift logo to top */
      const targetY = -height / 2 + 70; // 10 px from top
      Animated.timing(logoTranslateY, {
        toValue: targetY,
        duration: 700,
        useNativeDriver: true,
      }).start(() => {
        /* 3) fade grid in */
        Animated.timing(gridOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      });
    });

    /* 4) after 10 s → Home */
    const timeout = setTimeout(() => {
      navigation.navigate('Home' as never);
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      {/* LOGO */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: logoOpacity,
            transform: [
              { translateX: logoTranslateX },
              { translateY: logoTranslateY },
            ],
          },
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* GRID */}
      <Animated.View style={[styles.gridContainer, { opacity: gridOpacity }]}>
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={GRID_COLUMNS}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <Image
              source={item.src}
              style={[
                styles.gridImage,
                {
                  borderRightWidth: (index + 1) % GRID_COLUMNS === 0 ? 0 : 1,
                  borderBottomWidth:
                    Math.floor(index / GRID_COLUMNS) + 1 === GRID_ROWS ? 0 : 1,
                },
              ]}
            />
          )}
        />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

/* ──────────────────────────── Styles ──────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    position: 'absolute',
    top: '46%',      // centre before animation
    zIndex: 10,
  },
  logo: {
    width: 180,
    height: 70,
  },
  gridContainer: {
    marginTop: 30,   // ↓ space between logo & grid (reduced)
    width: width,
  },
  gridImage: {
    width: width / GRID_COLUMNS,
    height: (height - 150) / GRID_ROWS,
    borderColor: '#cccccc55',
  },
});