import axios from 'axios';
import { API_BASE_URL, API_ORIGIN } from '../config/api';
import { getStoredAuth } from './AuthService';

const BASE_URL = `${API_BASE_URL}/users`;

export interface OnboardingProfileRequest {
  gender: string;
  birthDate: string;
  heightCm: number;
  weightKg: number;
  experienceLevel: string;
  currentExerciseStatus: string;
  fitnessGoal: string;
  preferredWorkoutPlace: string;
  weeklyWorkoutFrequency: number;
  availableWorkoutMinutes: number;
  preferredExerciseTypes: string[];
}

export interface UserProfileResponse {
  id: number;
  loginId: string;
  nickname: string;
  email?: string | null;
  level?: number | null;
  totalExp?: number | null;
  currentLevelExp?: number | null;
  nextLevelRequiredExp?: number | null;
  nextLevelRemainingExp?: number | null;
  balanceCurrency?: number | null;
  gender?: string;
  birthDate?: string | number[] | null;
  heightCm?: number;
  weightKg?: number;
  experienceLevel?: string;
  preferredExerciseTypes?: string[];
  onboardingCompleted: boolean;
  requiresOnboarding: boolean;
  todayConditionCompleted: boolean;
  activeRoutineId: number | null;
  routineSetupRequired: boolean;
  profileImageUrl?: string | null;
}

export type UserGender = 'male' | 'female' | 'prefer_not_to_say';

export interface UpdateUserInfoRequest {
  nickname?: string;
  email?: string;
  gender?: UserGender;
  birthDate?: string;
  heightCm?: number;
  weightKg?: number;
}

export interface UserBadge {
  itemId: number;
  badgeCode: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  criteria: string | null;
  earned: boolean;
  earnedAt: string | null;
  metadata: Record<string, unknown>;
}

export interface UserBadgesResponse {
  badges: UserBadge[];
  earnedCount: number;
  totalCount: number;
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

export function resolveProfileImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
}

export async function saveOnboardingProfile(req: OnboardingProfileRequest): Promise<UserProfileResponse> {
  const response = await axios.put<{ data: UserProfileResponse }>(
    `${BASE_URL}/me/onboarding-profile`,
    req,
    { headers: { 'Content-Type': 'application/json', ...authHeader() } },
  );
  return response.data.data;
}

export async function updateUserInfo(body: UpdateUserInfoRequest): Promise<UserProfileResponse> {
  const response = await axios.put<{ data: UserProfileResponse }>(
    `${BASE_URL}/me`,
    body,
    { headers: { 'Content-Type': 'application/json', ...authHeader() } },
  );
  return response.data.data;
}

export async function getMyProfile(): Promise<UserProfileResponse> {
  const response = await axios.get<{ data: UserProfileResponse }>(
    `${BASE_URL}/me`,
    { headers: authHeader() },
  );
  return response.data.data;
}

export async function getMyBadges(): Promise<UserBadgesResponse> {
  const url = `${BASE_URL}/me/badges`;

  console.log('[BadgeAPI] get badges request', {
    method: 'GET',
    url,
    body: null,
  });

  const response = await axios.get<{ data: UserBadgesResponse }>(
    url,
    { headers: authHeader() },
  );

  console.log('[BadgeAPI] get badges response', JSON.stringify(response.data, null, 2));
  console.log('[BadgeAPI] get badges summary', {
    earnedCount: response.data.data.earnedCount,
    totalCount: response.data.data.totalCount,
    earnedBadges: response.data.data.badges
      .filter(badge => badge.earned)
      .map(badge => badge.badgeCode),
  });

  return response.data.data;
}

export async function syncMyBadges(): Promise<UserBadgesResponse> {
  const url = `${BASE_URL}/me/badges/sync`;

  console.log('[BadgeAPI] sync badges request', {
    method: 'POST',
    url,
    body: {},
  });

  const response = await axios.post<{ data: UserBadgesResponse }>(
    url,
    {},
    { headers: authHeader() },
  );

  console.log('[BadgeAPI] sync badges response', JSON.stringify(response.data, null, 2));
  console.log('[BadgeAPI] sync badges summary', {
    earnedCount: response.data.data.earnedCount,
    totalCount: response.data.data.totalCount,
    earnedBadges: response.data.data.badges
      .filter(badge => badge.earned)
      .map(badge => badge.badgeCode),
  });

  return response.data.data;
}
