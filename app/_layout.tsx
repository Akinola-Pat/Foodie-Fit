import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useLogStore } from '../src/store/useLogStore';
import { useAuthStore } from '../src/store/useAuthStore';

export default function RootLayout() {
  const loadInitialData = useLogStore((state) => state.loadInitialData);
  const { userId, isGuest } = useAuthStore();

  useEffect(() => {
    loadInitialData(userId || undefined, isGuest);
  }, [userId, isGuest]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FAF8F0' },
        }}
      >
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="settings/account" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
