import axios from 'axios';
import {
  getInitialNotification,
  getMessaging,
  getToken,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { API_BASE_URL } from '../config/api';
import { getStoredAuth } from './AuthService';
import { navigationRef, runWhenNavigationReady } from '../navigation/NavigationService';

interface PushTokenResponse {
  id: number;
  platform: string;
  deviceId: string;
  enabled: boolean;
  lastSeenAt: string;
}

let registeredPushTokenId: number | null = null;

export type PushNotificationType =
  | 'BATTLE_MATCHED'
  | 'BATTLE_RESULT_READY'
  | 'WEEKLY_STATS_READY';

export type PushNotificationData = {
  type?: PushNotificationType | string;
  route?: string;
  battleId?: string;
  battleMode?: 'DAILY' | 'WEEKLY' | string;
  result?: 'WIN' | 'LOSS' | 'DRAW' | 'PENDING' | string;
  weekStartDate?: string;
  weekEndDate?: string;
};

function authHeader(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

function getDeviceId(): string {
  const auth = getStoredAuth();
  return auth?.user?.id ? `android-user-${auth.user.id}` : 'android-device';
}

function logFcmRequestError(label: string, error: any): void {
  const status = error?.response?.status;
  const url = error?.config?.url;
  const responseData = error?.response?.data;

  console.warn(label, {
    status,
    url,
    responseData,
    message: error?.message,
  });
}

export async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 33) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function getFcmToken(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;

  const granted = await requestAndroidNotificationPermission();
  if (!granted) return null;

  const messagingInstance = getMessaging();
  await registerDeviceForRemoteMessages(messagingInstance);
  return getToken(messagingInstance);
}

export async function registerFcmTokenForCurrentUser(tokenOverride?: string): Promise<boolean> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) return false;

  try {
    const token = tokenOverride ?? await getFcmToken();
    if (!token) return false;

    const response = await axios.post<{ data: PushTokenResponse }>(
      `${API_BASE_URL}/push-tokens`,
      {
        token,
        platform: 'android',
        deviceId: getDeviceId(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(auth.accessToken),
        },
      },
    );

    registeredPushTokenId = response.data.data.id;
    return true;
  } catch (error: any) {
    logFcmRequestError('FCM token registration skipped:', error);
    return false;
  }
}

export async function deactivateRegisteredFcmToken(accessToken?: string): Promise<void> {
  if (!registeredPushTokenId || !accessToken) return;

  const tokenId = registeredPushTokenId;
  registeredPushTokenId = null;

  try {
    await axios.delete(
      `${API_BASE_URL}/push-tokens/${tokenId}`,
      { headers: authHeader(accessToken) },
    );
  } catch (error: any) {
    logFcmRequestError('FCM token deactivation skipped:', error);
  }
}

export function subscribeFcmTokenRefresh(): () => void {
  if (Platform.OS !== 'android') return () => {};

  return onTokenRefresh(getMessaging(), token => {
    registerFcmTokenForCurrentUser(token);
  });
}

function battleDuration(battleMode?: string): '1d' | '7d' {
  return battleMode === 'WEEKLY' ? '7d' : '1d';
}

function parseBattleId(value?: string): number | null {
  if (!value) return null;
  const battleId = Number(value);
  return Number.isFinite(battleId) ? battleId : null;
}

export function handlePushNotificationNavigation(data?: PushNotificationData): boolean {
  if (!data?.type) return false;

  const navigate = () => {
    switch (data.type) {
      case 'BATTLE_MATCHED': {
        const battleId = parseBattleId(data.battleId);
        if (battleId == null) return;
        navigationRef.navigate('Battle', {
          battleId,
          duration: battleDuration(data.battleMode),
        });
        break;
      }
      case 'BATTLE_RESULT_READY': {
        const battleId = parseBattleId(data.battleId);
        if (battleId == null) return;
        navigationRef.navigate('BattleResult', {
          battleId,
          duration: battleDuration(data.battleMode),
        });
        break;
      }
      case 'WEEKLY_STATS_READY':
        navigationRef.navigate('Statistics');
        break;
      default:
        break;
    }
  };

  runWhenNavigationReady(navigate);
  return true;
}

export function subscribeFcmNotificationNavigationHandlers(): () => void {
  if (Platform.OS !== 'android') return () => {};

  const messagingInstance = getMessaging();
  const unsubscribeOpened = onNotificationOpenedApp(messagingInstance, remoteMessage => {
    handlePushNotificationNavigation(remoteMessage.data as PushNotificationData | undefined);
  });

  getInitialNotification(messagingInstance)
    .then(remoteMessage => {
      handlePushNotificationNavigation(remoteMessage?.data as PushNotificationData | undefined);
    })
    .catch(error => {
      console.warn('FCM initial notification handling skipped:', error?.message ?? error);
    });

  return unsubscribeOpened;
}
