import axios from 'axios';

const API_BASE_URL = 'http://100.89.171.113:8080/api/auth';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types based on backend DTOs
export interface SignupRequest {
  loginId: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface UserProfile {
  id: number;
  loginId: string;
  nickname: string;
  status: string;
  onboardingCompleted: boolean;
  requiresOnboarding: boolean;
  todayConditionCompleted: boolean;
  activeRoutineId: number | null;
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
export const signup = async (loginId: string, password: string, nickname: string): Promise<AuthResponse> => {
  try {
    const request: SignupRequest = { loginId, password, nickname };
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