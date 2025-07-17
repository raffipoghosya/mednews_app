import React from 'react';
import { StyleSheet, Image, SafeAreaView, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');


const Header = () => (
  <SafeAreaView style={styles.wrapper}>
    <Image
      source={require('../../assets/logo.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  </SafeAreaView>
);

export default Header;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 0, // 0 px from top of safe area
    height: height * 0.1, // occupy ~10% height but can be adjusted
    backgroundColor: '#fff',
  },
  logo: {
    width: 140,
    height: 40,
  },
});