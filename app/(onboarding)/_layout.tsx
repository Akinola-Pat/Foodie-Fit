import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAF8F0' },
      }}
    >
      <Stack.Screen name="step1-basics" />
      <Stack.Screen name="step2-goal" />
      <Stack.Screen name="step3-activity" />
      <Stack.Screen name="step4-diet" />
      <Stack.Screen name="step5-region-equip" />
      <Stack.Screen name="step6-reminders" />
      <Stack.Screen name="plan-summary" />
      <Stack.Screen name="create-account-prompt" />
    </Stack>
  );
}
