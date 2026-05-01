import axios from 'axios';
import { getStoredAuth } from './AuthService';

const BASE_URL = 'http://100.89.171.113:8080/api/users';

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
  gender?: string;
  birthDate?: string;
  heightCm?: number;
  weightKg?: number;
  experienceLevel?: string;
  preferredExerciseTypes?: string[];
  onboardingCompleted: boolean;
  requiresOnboarding: boolean;
  todayConditionCompleted: boolean;
  activeRoutineId: number | null;
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

export async function saveOnboardingProfile(req: OnboardingProfileRequest): Promise<UserProfileResponse> {
  const response = await axios.put<{ data: UserProfileResponse }>(
    `${BASE_URL}/me/onboarding-profile`,
    req,
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
