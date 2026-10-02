import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useLogStore } from '../src/store/useLogStore';
import { useAuthStore } from '../src/store/useAuthStore';
import { useUserStore } from '../src/store/useUserStore';

export default function RootLayout() {
  const loadInitialData = useLogStore((state) => state.loadInitialData);
  const initProfile = useUserStore((state) => state.initProfile);
  const profile = useUserStore((state) => state.profile);
  const { userId } = useAuthStore();

  useEffect(() => {
    initProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      loadInitialData(
        userId || undefined,
        profile.regionPreference,
        profile.targetCalories,
        profile.dietaryPreference
      );
    } else {
      loadInitialData(userId || undefined);
    }
  }, [userId, profile?.targetCalories, profile?.regionPreference, profile?.dietaryPreference]);

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
      </Stack>
    </SafeAreaProvider>
  );
}
