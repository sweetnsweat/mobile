import axios from 'axios';
import { getStoredAuth } from './AuthService';

const BASE_URL = 'http://100.89.171.113:8080/api/users';

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
