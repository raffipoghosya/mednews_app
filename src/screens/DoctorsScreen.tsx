// src/screens/DoctorsScreen.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Header from '../components/Header';
import FooterNav from '../components/FooterNav';

const { width } = Dimensions.get('window');
const SCREEN_WIDTH = Dimensions.get('window').width;
// Սահմանում ենք նկարի և վերնագրի բլոկների հարաբերական չափերը
const IMAGE_CONTAINER_HEIGHT_RATIO = 0.5; // Նկարի բարձրությունը իր լայնության 50%-ը

// ImageContainer-ի վերին լուսանցքը primaryBackgroundShape-ի վերևից
const IMAGE_CONTAINER_VERTICAL_OFFSET = 40; // Ֆիքսված օֆսեթ Header-ից ներքև (կարգավորել ըստ ցանկության)

const PRIMARY_COLOR = '#833F6D';
const primaryBackgroundHeight =
IMAGE_CONTAINER_VERTICAL_OFFSET + // Հեռավորություն վերևից մինչև նկարի սկիզբը
(SCREEN_WIDTH * IMAGE_CONTAINER_HEIGHT_RATIO) - // Նկարի ամբողջ բարձրությունը
150; // Լրացուցիչ տարածք ներքևի կորության համար և նկարի տակ (կարգավորել)

// Your original data structure for banner images
const bannerImages = [
  {
    id: '1',
    image: require('../../assets/banners/1.png'),
    url: 'https://facebook.com/doctor1',
  },
  {
    id: '2',
    image: require('../../assets/banners/2.png'),
    url: 'https://instagram.com/doctor2',
  },
  {
    id: '3',
    image: require('../../assets/banners/3.png'),
    url: 'https://youtube.com/doctor3',
  },
  {
    id: '4',
    image: require('../../assets/banners/4.png'),
    url: 'https://t.me/doctor4',
  },
  {
    id: '5',
    image: require('../../assets/banners/5.png'),
    url: 'https://linkedin.com/in/doctor5',
  },
  {
    id: '6',
    image: require('../../assets/banners/6.png'),
    url: 'https://example.com/doctor6',
  },
  {
    id: '7',
    image: require('../../assets/banners/7.png'),
    url: 'https://facebook.com/doctor7',
  },
  {
    id: '8',
    image: require('../../assets/banners/8.png'),
    url: 'https://instagram.com/doctor8',
  },
  {
    id: '9',
    image: require('../../assets/banners/9.png'),
    url: 'https://youtube.com/doctor9',
  },
  {
    id: '10',
    image: require('../../assets/banners/10.png'),
    url: 'https://t.me/doctor10',
  },
  {
    id: '11',
    image: require('../../assets/banners/11.png'),
    url: 'https://linkedin.com/in/doctor11',
  },
  {
    id: '12',
    image: require('../../assets/banners/12.png'),
    url: 'https://example.com/doctor12',
  },
];

const DoctorsScreen = () => {
  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Չհաջողվեց բացել հղումը', url);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header component at the top */}
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent}>
                 {/* 1. Մուգ ֆոնային բլոկը Header-ից հետո */}
                 <View style={[styles.primaryBackground, { height: primaryBackgroundHeight, width:'108%' }]}></View>

        <View style={styles.listContainer}>
          {bannerImages.map((banner) => (
            <TouchableOpacity
              key={banner.id}
              onPress={() => openLink(banner.url)}
              style={styles.cardWrapper}
            >
              <Image
                source={banner.image}
                style={styles.cardImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FooterNav component at the bottom */}
      <FooterNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Updated background color to match the image
    backgroundColor: '#E6D7E3', // A light purple/pinkish color based on the image
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    paddingBottom: 100, // Sufficient space for the footer
  },
  listContainer: {
    // This container simply holds our list items
  },
  cardWrapper: {
    width: '100%',
    marginBottom: 15, // Spacing between cards
  },
  cardImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 850 / 350, // Aspect ratio calculated based on your provided image dimensions
  },
  primaryBackground: {
    width: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
},
});

export default DoctorsScreen;