import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { NativeModules, Platform, useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Safely check if the native module is actually compiled into the app
      if (NativeModules.ExpoNavigationBar) {
        try {
          const NavigationBar = require('expo-navigation-bar');
          NavigationBar.setBackgroundColorAsync(
            colorScheme === 'dark' ? '#121212' : '#FFFFFF'
          );
          NavigationBar.setButtonStyleAsync(
            colorScheme === 'dark' ? 'light' : 'dark'
          );
        } catch (e) {
          console.warn('NavigationBar error:', e);
        }
      }
    }
  }, [colorScheme]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
        },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
