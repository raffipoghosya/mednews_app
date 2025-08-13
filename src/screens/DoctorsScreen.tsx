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
const IMAGE_CONTAINER_HEIGHT_RATIO = 0.5;
const IMAGE_CONTAINER_VERTICAL_OFFSET = 110;

const PRIMARY_COLOR = '#833F6D';
const primaryBackgroundHeight =
  IMAGE_CONTAINER_VERTICAL_OFFSET +
  (SCREEN_WIDTH * IMAGE_CONTAINER_HEIGHT_RATIO) -
  160;

const bannerImages = [
  // ... (Ձեր bannerImages զանգվածը նույնն է)
  { id: '1', image: require('../../assets/banners/1.png'), url: 'https://www.facebook.com/mashkabanpodolog' },
  { id: '2', image: require('../../assets/banners/2.png'), url: 'https://www.facebook.com/dr.Aivazyan' },
  { id: '3', image: require('../../assets/banners/3.png'), url: 'https://www.facebook.com/ValentinaSVardanyan' },
  { id: '4', image: require('../../assets/banners/4.png'), url: 'https://www.facebook.com/doctorbadalyan' },
  { id: '5', image: require('../../assets/banners/5.png'), url: 'https://www.facebook.com/dr.varzhapetyan' },
  { id: '6', image: require('../../assets/banners/6.png'), url: 'https://www.facebook.com/mankakanurolog' },
  { id: '7', image: require('../../assets/banners/7.png'), url: 'https://www.facebook.com/draroargishti' },
  { id: '8', image: require('../../assets/banners/8.png'), url: 'https://www.facebook.com/ValentinaSVardanyan' },
  { id: '9', image: require('../../assets/banners/9.png'), url: 'https://www.facebook.com/doctorArayikGharibyan' },
  { id: '10', image: require('../../assets/banners/10.png'), url: 'https://www.facebook.com/levonngrigoryan' },
  { id: '11', image: require('../../assets/banners/11.png'), url: 'https://www.facebook.com/lusinebekirskatamazyan' },
  { id: '12', image: require('../../assets/banners/12.png'), url: 'https://www.facebook.com/dr.tigrankamalyan' },
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
      <View style={[styles.primaryBackground, { height: primaryBackgroundHeight, marginTop:10, }]}></View>
      {/* <Header/> */}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.listContainer}>
          {bannerImages.map((banner) => (
            <TouchableOpacity
              key={banner.id}
              onPress={() => openLink(banner.url)}
              // Այստեղ կիրառում ենք transform: scale
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

      {/* <FooterNav /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6D7E3',
  },
  scrollContent: {
    paddingHorizontal: 15, // Այս լուսանցքը թողնում ենք բովանդակության համար
    paddingVertical: 20,
    paddingBottom: 100,
    paddingTop: 25, // Կարգավորեք սա ձեր դիզայնի համար
  },
  listContainer: {
    // Կենտրոնացնում ենք քարտերը listContainer-ի մեջ
    alignItems: 'center', // Սա կկենտրոնացնի width-ով փոքր տարրերը
  },
  cardWrapper: {
    width: '100%', // Թողնում ենք 100% լայնություն
    marginBottom: 15,
    // Ավելացնում ենք transform: scale՝ պատկերը մեծացնելու համար
    transform: [{ scale: 1.2 }], // Օրինակ՝ 1.1 կամ 1.2՝ ըստ ցանկության
  },
  cardImage: {
    width: '100%', // Վերադարձնում ենք 100%, քանի որ մեծացումը կատարվում է ծնողի վրա
    height: undefined,
    aspectRatio: 850 / 350,
  },
  primaryBackground: {
    width: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    position: 'absolute',
    marginTop:10,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
});

export default DoctorsScreen;