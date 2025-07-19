import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

// Import các màn hình hiện có
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import ArticleScreen from './src/screens/ArticleScreen';
import NewsScreen from './src/screens/NewsScreen';
import InterviewScreen from './src/screens/InterviewScreen';
import DoctorsScreen from './src/screens/DoctorsScreen';
import VideosScreen from './src/screens/VideosScreen'; 
// ⭐ 1. Import màn hình ShortsPlayer mới
import ShortsPlayerScreen from './src/screens/ShortsPlayerScreen';

// Import kiểu dữ liệu VideoItem để sử dụng trong ParamList
import { VideoItem } from './src/api'; 

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  ArticleScreen: { id: string };
  NewsScreen: undefined;
  InterviewScreen: undefined;
  Videos: undefined;
  Doctors: undefined;
  // ⭐ 2. Thêm định tuyến và các tham số của nó vào danh sách
  ShortsPlayer: { shorts: VideoItem[]; startIndex: number };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ArticleScreen" component={ArticleScreen} />
          <Stack.Screen name="NewsScreen" component={NewsScreen} />
          <Stack.Screen name="InterviewScreen" component={InterviewScreen} />
          <Stack.Screen name="Doctors" component={DoctorsScreen} />
          <Stack.Screen name="Videos" component={VideosScreen} />
          {/* ⭐ 3. Thêm màn hình mới vào stack điều hướng */}
          <Stack.Screen name="ShortsPlayer" component={ShortsPlayerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Bạn không cần bất kỳ kiểu nào ở đây, vì vậy tôi để nó trống
const styles = StyleSheet.create({});