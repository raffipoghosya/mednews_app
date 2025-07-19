// src/components/Header.tsx
import React from 'react';
import {
  StyleSheet,
  Image,
  View,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

const Header = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        { paddingTop: insets.top }, // 👈 Պաշտպանիչ padding՝ վերևից
      ]}
    >
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    width: '100%',
  },
  logo: {
    width: 200,
    height: 50,
    marginTop: 10, // Եթե ուզում ես լոգոն մի քիչ ներքև լինի
  },
});
