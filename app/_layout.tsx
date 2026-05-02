import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { MiniPlayer } from '../src/components/MiniPlayer';

import { useColorScheme } from '../hooks/use-color-scheme';
import { AudioProvider } from '../src/context/AudioContext';
import { ThemeProvider as AppThemeProvider } from '../src/context/ThemeContext';

import { NoteProvider } from '../src/context/NoteContext';
import { UserProvider } from '../src/context/UserContext';
import { useOTAUpdate } from '../src/hooks/useOTAUpdate';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AudioProvider>
        <UserProvider>
          <NoteProvider>
            <LayoutContent />
          </NoteProvider>
        </UserProvider>
      </AudioProvider>

    </AppThemeProvider>
  );
}

function LayoutContent() {
  const colorScheme = useColorScheme();
  const { onFetchUpdateAsync } = useOTAUpdate();

  React.useEffect(() => {
    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="pdf-viewer" options={{ title: 'PDF Viewer' }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen name="derse-detail" options={{ headerShown: false }} />
        </Stack>
        <MiniPlayer />
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

