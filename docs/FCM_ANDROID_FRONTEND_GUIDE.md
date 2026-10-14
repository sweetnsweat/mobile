# Android FCM Frontend Guide

이 문서는 Android 앱에서 FCM registration token을 발급받아 백엔드에 등록하는 프론트 작업 범위를 정리한다.

## 현재 PR에서 완료된 것

- `android/app/google-services.json` 추가
- Android 앱 package name 확인: `com.mindfitnative`
- Google Services Gradle plugin 추가
- Firebase Android BoM 추가
- Firebase Messaging Android SDK 추가

## 프론트에서 다음에 할 일

React Native 코드에서 FCM token을 읽으려면 RN Firebase 패키지가 필요하다.

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

설치 후 Android 빌드를 다시 실행한다.

```bash
npm run android
```

## Android 알림 권한

Android 13(API 33) 이상에서는 알림 권한이 런타임 권한이다.

앱 시작 시점 또는 로그인 후 푸시 알림을 켜는 시점에 `POST_NOTIFICATIONS` 권한을 요청해야 한다.

```tsx
import {PermissionsAndroid, Platform} from 'react-native';

export async function requestAndroidNotificationPermission() {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}
```

## FCM Token 발급

로그인 직후 또는 앱 시작 후 access token이 있는 시점에 FCM token을 가져온다.

```tsx
import messaging from '@react-native-firebase/messaging';

export async function getFcmToken() {
  await messaging().registerDeviceForRemoteMessages();
  return messaging().getToken();
}
```

토큰은 변경될 수 있으므로 token refresh 이벤트도 처리해야 한다.

```tsx
import messaging from '@react-native-firebase/messaging';

export function subscribeFcmTokenRefresh(onToken: (token: string) => void) {
  return messaging().onTokenRefresh(onToken);
}
```

## 백엔드 토큰 등록

FCM token을 받으면 로그인 access token으로 백엔드에 등록한다.

```http
POST /api/push-tokens
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "token": "{fcmRegistrationToken}",
  "platform": "android",
  "deviceId": "{deviceId}"
}
```

개발 서버 기준 URL:

```text
http://100.89.171.113:8080/api/push-tokens
```

응답 예시:

```json
{
  "success": true,
  "code": "OK",
  "message": "푸시 토큰이 등록되었습니다.",
  "data": {
    "id": 1,
    "platform": "android",
    "deviceId": "android-device-id",
    "enabled": true,
    "lastSeenAt": "2026-05-17T06:03:54.637782848Z"
  }
}
```

응답의 `data.id`는 로그아웃 또는 알림 해제 시 토큰 비활성화에 사용할 수 있다.

## 로그아웃 또는 알림 해제

로그아웃하거나 사용자가 푸시 알림을 끄면 등록된 토큰을 비활성화한다.

```http
DELETE /api/push-tokens/{tokenId}
Authorization: Bearer {accessToken}
```

## 테스트 발송 API

등록된 현재 사용자 토큰으로 테스트 발송을 요청할 수 있다.

```http
POST /api/notifications/test
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "테스트",
  "body": "알림 확인"
}
```

개발 서버는 Firebase service account가 설정되기 전까지 `FIREBASE_ENABLED=false`로 동작한다. 이 상태에서는 API 응답은 오지만 실제 푸시는 발송되지 않고 `enabled=false`로 응답할 수 있다.

## 역할 분리

- 모바일 앱: FCM token 발급, 알림 권한 요청, 백엔드 토큰 등록
- 백엔드: 사용자별 FCM token 저장, 알림 발송 API 제공
- 개발 서버: Firebase service account 설정 후 실제 FCM 발송 활성화

