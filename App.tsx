import React, { useEffect } from 'react';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppAlertProvider } from './src/components/AppAlertProvider';
import {
  handlePushNotificationNavigation,
  PushNotificationData,
  subscribeFcmNotificationNavigationHandlers,
  subscribeFcmTokenRefresh,
} from './src/services/FcmService';

async function displayForegroundNotification(
  title?: string,
  body?: string,
  data?: PushNotificationData,
) {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: '기본 알림',
    importance: AndroidImportance.HIGH,
  });
  await notifee.displayNotification({
    title,
    body,
    data,
    android: { channelId },
  });
}

export default function App() {
  useEffect(() => {
    const messagingInstance = getMessaging();
    const unsubscribeFcm = subscribeFcmTokenRefresh();
    const unsubscribeNotificationNavigation = subscribeFcmNotificationNavigationHandlers();
    const unsubscribeMessage = onMessage(messagingInstance, async remoteMessage => {
      await displayForegroundNotification(
        remoteMessage.notification?.title,
        remoteMessage.notification?.body,
        remoteMessage.data as PushNotificationData | undefined,
      );
    });
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        handlePushNotificationNavigation(
          detail.notification?.data as PushNotificationData | undefined,
        );
      }
    });
    return () => {
      unsubscribeFcm();
      unsubscribeNotificationNavigation();
      unsubscribeMessage();
      unsubscribeNotifee();
    };
  }, []);

  return (
    <AppAlertProvider>
      <AppNavigator />
    </AppAlertProvider>
  );
}
