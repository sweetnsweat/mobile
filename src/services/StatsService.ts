import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getStoredAuth } from './AuthService';

const BASE_URL = `${API_BASE_URL}/users`;

export interface WeeklyStatsResponse {
  weekStartDate: string;
  weekEndDate: string;
  completedWorkoutCount: number;
  maxStreakDays: number;
  estimatedCaloriesKcal: number;
  earnedExp: number;
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('Login is required');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

export async function getWeeklyStats(): Promise<WeeklyStatsResponse> {
  const response = await axios.get<{ data: WeeklyStatsResponse }>(
    `${BASE_URL}/me/weekly-stats`,
    { headers: authHeader() },
  );
  return response.data.data;
}
