// src/components/MainLayout.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './Header';
import FooterNav from './FooterNav';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        {children}
      </View>
      <FooterNav />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});

export default MainLayout;