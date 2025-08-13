// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';

// Import all your screens
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import NewsScreen from '../screens/NewsScreen';
import InterviewScreen from '../screens/InterviewScreen';
import VideosScreen from '../screens/VideosScreen';
import DoctorsScreen from '../screens/DoctorsScreen';
import ArticleScreen from '../screens/ArticleScreen';
import ShortsPlayerScreen from '../screens/ShortsPlayerScreen';

// Import persistent Header and Footer
import Header from '../components/Header';
import FooterNav from '../components/FooterNav';
import { VideoItem } from '../api';

// --- TYPE DEFINITIONS ---

// This defines screens reachable from WITHIN a tab stack
export type TabStackParamList = {
  Home: undefined;
  NewsScreen: undefined;
  InterviewScreen: undefined;
  Videos: undefined;
  // ArticleScreen is now part of these stacks, so it's defined here
  ArticleScreen: { id: string };
};

const TabStack = createStackNavigator<TabStackParamList>();

// --- STACK NAVIGATORS FOR EACH TAB ---
// This architecture keeps the Tab Bar (FooterNav) visible when navigating to an article

const HomeStack = () => (
  <TabStack.Navigator screenOptions={{ headerShown: false }}>
    <TabStack.Screen name="Home" component={HomeScreen} />
    <TabStack.Screen name="ArticleScreen" component={ArticleScreen} />
  </TabStack.Navigator>
);

const NewsStack = () => (
  <TabStack.Navigator screenOptions={{ headerShown: false }}>
    <TabStack.Screen name="NewsScreen" component={NewsScreen} />
    <TabStack.Screen name="ArticleScreen" component={ArticleScreen} />
  </TabStack.Navigator>
);

const InterviewStack = () => (
  <TabStack.Navigator screenOptions={{ headerShown: false }}>
    <TabStack.Screen name="InterviewScreen" component={InterviewScreen} />
    <TabStack.Screen name="ArticleScreen" component={ArticleScreen} />
  </TabStack.Navigator>
);

// Videos screen has a special case for the full-screen ShortsPlayer
const VideosStack = () => (
  <TabStack.Navigator screenOptions={{ headerShown: false }}>
    <TabStack.Screen name="Videos" component={VideosScreen} />
  </TabStack.Navigator>
);

// --- MAIN TAB NAVIGATOR ---
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    // This View ensures the Header and FooterNav are always present
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <Tab.Navigator
        tabBar={props => <FooterNav {...props} />}
        screenOptions={{ headerShown: false }}
      >
        {/* We now point each tab to its own Stack Navigator */}
        <Tab.Screen name="HomeStack" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
        <Tab.Screen name="NewsStack" component={NewsStack} options={{ tabBarLabel: 'NewsScreen' }}/>
        <Tab.Screen name="InterviewStack" component={InterviewStack} options={{ tabBarLabel: 'InterviewScreen' }}/>
        <Tab.Screen name="VideosStack" component={VideosStack} options={{ tabBarLabel: 'Videos' }}/>
        <Tab.Screen name="Doctors" component={DoctorsScreen} />
      </Tab.Navigator>
    </View>
  );
}

// --- ROOT NAVIGATOR (for the entire app) ---
// This navigator handles transitions between the Splash screen, the main app, and any full-screen modal pages.
const Root = createStackNavigator();

function AppNavigator() {
  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      <Root.Screen name="Splash" component={SplashScreen} />
      {/* Այս էկրանի համար անջատում ենք հետ գնալու ժեստը */}
      <Root.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ gestureEnabled: false }}
      />
      <Root.Screen name="ShortsPlayer" component={ShortsPlayerScreen} options={{ presentation: 'modal' }}/>
    </Root.Navigator>
  );
}


export default AppNavigator;