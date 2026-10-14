import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getStoredAuth } from './AuthService';

const USERS_BASE_URL = `${API_BASE_URL}/users`;
const STATS_BASE_URL = `${API_BASE_URL}/records`;

export type RecordStatsPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface WeeklyStatsResponse {
  weekStartDate: string;
  weekEndDate: string;
  completedWorkoutCount: number;
  maxStreakDays: number;
  estimatedCaloriesKcal: number;
  earnedExp: number;
}

export interface RecordStatsSummary {
  averageConditionScore: number | null;
  averageConditionLevel: number | null;
  averageEnergyLevel: number | null;
  averageStressScore: number | null;
  exerciseCount: number;
  completedQuestCount: number;
  healthSyncedDays: number;
  improvementRatePercent: number;
  totalExerciseMinutes: number;
  totalSteps: number;
  totalDistanceMeters: number;
  totalActiveCaloriesKcal: number;
}

export interface ConditionTrendPoint {
  date: string;
  label: string;
  conditionLevel: number | null;
  conditionScore: number | null;
  energyLevel: number | null;
  stressScore: number | null;
  exerciseMinutes: number;
  steps: number;
  distanceMeters: number;
  activeCaloriesKcal: number;
  completedQuestCount: number;
}

export interface ExerciseEffect {
  exerciseType: string;
  label: string;
  completedCount: number;
  exerciseMinutes: number;
  averageConditionScore: number | null;
  conditionDelta: number | null;
  averageStressScore: number | null;
}

export interface DailyRecord {
  date: string;
  dayOfWeek: string;
  exerciseLabel: string;
  conditionLevel: number | null;
  conditionScore: number | null;
  energyLevel: number | null;
  stressScore: number | null;
  exerciseMinutes: number;
  steps: number;
  activeCaloriesKcal: number;
  completedQuestCount: number;
}

export interface RecordStatsInsight {
  title: string;
  summary: string;
  recommendation: string;
}

export interface RecordStatsResponse {
  period: RecordStatsPeriod;
  startDate: string;
  endDate: string;
  summary: RecordStatsSummary;
  conditionTrend: ConditionTrendPoint[];
  exerciseEffects: ExerciseEffect[];
  dailyRecords: DailyRecord[];
  insight: RecordStatsInsight;
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('Login is required');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

export async function getWeeklyStats(): Promise<WeeklyStatsResponse> {
  const response = await axios.get<{ data: WeeklyStatsResponse }>(
    `${USERS_BASE_URL}/me/weekly-stats`,
    { headers: authHeader() },
  );
  return response.data.data;
}

export async function getRecordStats(period: RecordStatsPeriod): Promise<RecordStatsResponse> {
  const url = `${STATS_BASE_URL}/stats`;
  const params = { period };

  console.log('[StatsAPI] record stats request', {
    method: 'GET',
    url,
    params,
    body: null,
  });

  const response = await axios.get<{ data: RecordStatsResponse }>(
    url,
    {
      headers: authHeader(),
      params,
    },
  );

  console.log('[StatsAPI] record stats response', JSON.stringify(response.data, null, 2));

  return response.data.data;
}
