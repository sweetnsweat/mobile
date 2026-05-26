import axios from 'axios';
import { AUTH_API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: AUTH_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function koreanAuthErrorMessage(message?: string | null, fallback = '요청 처리 중 오류가 발생했습니다.'): string {
  const raw = (message ?? '').trim();
  const normalized = raw.toLowerCase();

  if (!raw) return fallback;
  if (
    normalized.includes('invalid login') ||
    normalized.includes('invalid credentials') ||
    normalized.includes('bad credentials') ||
    normalized.includes('unauthorized') ||
    normalized.includes('authentication failed')
  ) {
    return '아이디 또는 비밀번호가 올바르지 않습니다.';
  }
  if (
    normalized.includes('invalid password') ||
    normalized.includes('wrong password') ||
    normalized.includes('incorrect password') ||
    normalized.includes('current password') ||
    normalized.includes('password mismatch')
  ) {
    return '현재 비밀번호가 올바르지 않습니다.';
  }
  if (normalized.includes('inactive') || normalized.includes('disabled')) {
    return '비활성화된 계정입니다. 고객센터에 문의해 주세요.';
  }
  if (normalized.includes('network')) {
    return '네트워크 연결을 확인해 주세요.';
  }
  if (normalized.includes('login id') || normalized.includes('nickname already exists')) {
    return '이미 사용 중인 아이디 또는 닉네임입니다.';
  }
  if (normalized.includes('signup failed')) {
    return '회원가입에 실패했습니다.';
  }
  if (normalized.includes('login failed')) {
    return '로그인에 실패했습니다.';
  }

  return raw;
}

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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
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
        throw new Error(koreanAuthErrorMessage(data.message, '이미 사용 중인 아이디 또는 닉네임입니다.'));
      }
      throw new Error(koreanAuthErrorMessage(data.message, '회원가입에 실패했습니다.'));
    }
    throw new Error('네트워크 연결을 확인해 주세요.');
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
        throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
      if (status === 403) {
        throw new Error('비활성화된 계정입니다. 고객센터에 문의해 주세요.');
      }
      throw new Error(koreanAuthErrorMessage(data.message || data.detail, '로그인에 실패했습니다.'));
    }
    throw new Error('네트워크 연결을 확인해 주세요.');
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

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');

  try {
    const request: ChangePasswordRequest = { currentPassword, newPassword };
    await api.put('/password', request, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
  } catch (error: any) {
    if (error.response) {
      const data = error.response.data;
      throw new Error(koreanAuthErrorMessage(data?.detail || data?.message, '비밀번호 변경에 실패했습니다.'));
    }
    throw new Error('네트워크 연결을 확인해 주세요.');
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
