import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { NotificationPreferences } from '../types/auth';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Lazily load expo-notifications only outside of Expo Go on Android
// to prevent the fatal SDK 53+ remote notification removal error.
let Notifications: any = null;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications?.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (err) {
    console.warn('[NotificationService] Could not load expo-notifications:', err);
  }
}

export async function requestNotificationPermission(): Promise<{ granted: boolean; token?: string }> {
  if (isExpoGo || !Notifications) {
    // In Expo Go, push notifications are removed as of SDK 53.
    // Return simulated granted state for local UI testing.
    return { granted: true };
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { granted: false };
    }

    // Try to obtain push token
    let token: string | undefined;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      token = tokenData.data;
    } catch {
      // Simulator or push token error — local notifications will still work
    }

    return { granted: true, token };
  } catch (err) {
    console.warn('Error requesting notification permissions:', err);
    return { granted: false };
  }
}

/**
 * Schedules daily and weekly reminders based on user preferences.
 */
export async function scheduleReminders(prefs: NotificationPreferences): Promise<void> {
  if (isExpoGo || !Notifications) {
    console.log('[NotificationService] Reminders configured (simulated in Expo Go):', {
      workout: prefs.workoutReminders ? prefs.workoutTime || '07:00' : 'off',
      meals: prefs.mealReminders ? 'active' : 'off',
      weighin: prefs.weighinReminders ? prefs.weighinTime || '08:00' : 'off',
    });
    return;
  }

  try {
    // 1. Cancel existing scheduled local notifications to prevent duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 2. Schedule Daily Workout Reminder
    if (prefs.workoutReminders && prefs.workoutTime) {
      const [hourStr, minStr] = prefs.workoutTime.split(':');
      const hour = parseInt(hourStr || '7', 10);
      const minute = parseInt(minStr || '0', 10);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💪 Workout Time — Foodie Fit',
          body: "Let's keep your streak alive! Today's session is ready for you.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }

    // 3. Schedule Daily Meal Prep Reminders (Breakfast 08:00, Lunch 12:30, Dinner 18:30)
    if (prefs.mealReminders) {
      // Lunch reminder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🥗 Fuel Your Body',
          body: 'Check out today’s healthy lunch recipe and keep your nutrition on track!',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 12,
          minute: 30,
        },
      });

      // Dinner reminder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🍲 Dinner Time',
          body: 'Time to prepare tonight’s balanced meal tailored to your goals.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 18,
          minute: 30,
        },
      });
    }

    // 4. Schedule Weekly Weigh-In Reminder (Default: Sunday 08:00)
    if (prefs.weighinReminders) {
      const [hourStr, minStr] = (prefs.weighinTime || '08:00').split(':');
      const hour = parseInt(hourStr || '8', 10);
      const minute = parseInt(minStr || '0', 10);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚖️ Weekly Check-In',
          body: 'Log your current weight today to keep your progress chart accurate!',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: 1, // Sunday in Expo Notifications
          hour,
          minute,
        },
      });
    }
  } catch (err) {
    console.warn('Error scheduling notifications:', err);
  }
}
