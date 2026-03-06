import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
