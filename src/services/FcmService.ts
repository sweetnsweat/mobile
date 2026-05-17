import axios from 'axios';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { API_BASE_URL } from '../config/api';
import { getStoredAuth } from './AuthService';

interface PushTokenResponse {
  id: number;
  platform: string;
  deviceId: string;
  enabled: boolean;
  lastSeenAt: string;
}

let registeredPushTokenId: number | null = null;

function authHeader(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

function getDeviceId(): string {
  const auth = getStoredAuth();
  return auth?.user?.id ? `android-user-${auth.user.id}` : 'android-device';
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

  await messaging().registerDeviceForRemoteMessages();
  return messaging().getToken();
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
    console.warn(
      'FCM token registration skipped:',
      error?.response?.data?.message ?? error?.message ?? error,
    );
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
    console.warn(
      'FCM token deactivation skipped:',
      error?.response?.data?.message ?? error?.message ?? error,
    );
  }
}

export function subscribeFcmTokenRefresh(): () => void {
  if (Platform.OS !== 'android') return () => {};

  return messaging().onTokenRefresh(token => {
    registerFcmTokenForCurrentUser(token);
  });
}
