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
