import axios from 'axios';
import { AUTH_API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: AUTH_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types based on backend DTOs
export interface SignupRequest {
  loginId: string;
  password: string;
  nickname: string;
  email: string;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface UserProfile {
  id: number;
  email: string | null;
  loginId: string;
  nickname: string;
  status: string;
  onboardingCompleted: boolean;
  requiresOnboarding: boolean;
  todayConditionCompleted: boolean;
  activeRoutineId: number | null;
  routineSetupRequired: boolean;
  currentExerciseStatus: string | null;
  fitnessGoal: string | null;
  preferredWorkoutPlace: string | null;
  weeklyWorkoutFrequency: number | null;
  availableWorkoutMinutes: number | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserProfile;
}

let storedAuth: { accessToken: string; refreshToken: string; user: UserProfile } | null = null;

const storeTokens = (response: AuthResponse): void => {
  storedAuth = {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: response.user,
  };
};

export const getStoredAuth = (): { accessToken: string; refreshToken: string; user: UserProfile } | null => {
  return storedAuth;
};

export const clearStoredAuth = (): void => {
  storedAuth = null;
};

// Signup API
export const signup = async (loginId: string, password: string, nickname: string, email: string): Promise<AuthResponse> => {
  try {
    const request: SignupRequest = { loginId, password, nickname, email };
    const response = await api.post<{ data: AuthResponse }>('/signup', request);
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 409) {
        throw new Error(data.message || 'Login ID or nickname already exists');
      }
      throw new Error(data.message || 'Signup failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

// Login API
export const login = async (loginId: string, password: string): Promise<AuthResponse> => {
  try {
    const request: LoginRequest = { loginId, password };
    const response = await api.post<{ data: AuthResponse }>('/login', request);
    storeTokens(response.data.data);
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        throw new Error('Invalid login credentials');
      }
      if (status === 403) {
        throw new Error('User account is inactive');
      }
      throw new Error(data.message || 'Login failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

// 닉네임 중복 확인
export const checkNickname = async (nickname: string): Promise<{ available: boolean; duplicated: boolean }> => {
  try {
    const response = await api.get<{ data: { nickname: string; available: boolean; duplicated: boolean } }>(
      '/nickname/check',
      { params: { nickname } },
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || '닉네임 확인에 실패했습니다.');
    }
    throw new Error('네트워크 오류가 발생했습니다.');
  }
};

// 아이디 찾기 — 이메일로 로그인 아이디 발송
export const findLoginId = async (email: string): Promise<void> => {
  try {
    await api.post('/find-login-id', { email });
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || '아이디 찾기 요청에 실패했습니다.');
    }
    throw new Error('네트워크 오류가 발생했습니다.');
  }
};

// 임시 비밀번호 발급 — 로그인 아이디와 이메일 확인 후 임시 비밀번호 발송
export const requestPasswordReset = async (loginId: string, email: string): Promise<void> => {
  try {
    await api.post('/password-reset/request', { loginId, email });
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || '비밀번호 재설정 요청에 실패했습니다.');
    }
    throw new Error('네트워크 오류가 발생했습니다.');
  }
};

// Logout API
export const logout = async (accessToken: string): Promise<void> => {
  try {
    await api.post('/logout', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error: any) {
    // Even if logout fails on server, clear local tokens
    console.log('Logout API error (ignoring):', error.message);
  }
};
