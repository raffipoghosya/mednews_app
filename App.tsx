// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import the new central navigator
import AppNavigator from './src/navigation/AppNavigator';

// Import the DataProvider we created for performance optimization
import { DataProvider } from './src/context/DataContext';


export default function App() {
  return (
    <SafeAreaProvider>
      {/* DataProvider fetches global data once and provides it to the whole app */}
      <DataProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          {/* AppNavigator now controls all screen transitions */}
          <AppNavigator />
        </NavigationContainer>
      </DataProvider>
    </SafeAreaProvider>
  );
}