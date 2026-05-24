import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getStoredAuth } from './AuthService';

const BASE_URL = API_BASE_URL;

export interface QuestExercise {
  exerciseId: number;
  exerciseName: string;
  category: string;
  seq: number;
  targetSets: number | null;
  targetReps: number | null;
  targetDurationSec: number | null;
}

export interface QuestVerificationWindow {
  startTime: string;
  endTime: string | null;
}

export interface HealthMetricSampleRequest {
  type?: string;
  value: number;
  unit?: string;
  startTime: string;
  endTime?: string;
  source: 'health_connect' | string;
  dataOrigin?: string;
  rawRecordType?: string;
}

export interface CompleteQuestRequest {
  progressValue?: number;
  proof?: Record<string, unknown>;
  healthSamples?: HealthMetricSampleRequest[];
}

export type QuestCompletionType = 'VERIFIED' | 'MANUAL' | string;
export type QuestVerificationStatus =
  | 'VERIFIED'
  | 'NOT_PROVIDED'
  | 'INSUFFICIENT_DATA'
  | string;

export interface QuestResponse {
  id: number;
  questDate: string;
  questType: string;
  targetMetric: string;
  status: string;
  completed: boolean;
  title: string;
  description: string;
  targetValue: number;
  progressValue: number;
  conditionAdjusted: boolean;
  routineId: number | null;
  routineName: string | null;
  sourceSessionId: number | null;
  sessionName: string | null;
  sessionType: string | null;
  sessionTypeDisplayName: string | null;
  conditionScore: number | null;
  exerciseMultiplier: number | null;
  rewardCurrency: number;
  rewardExp: number;
  rewardGold: number | null;
  completedAt: string | null;
  completionType?: QuestCompletionType | null;
  verificationStatus?: QuestVerificationStatus | null;
  battleEligible?: boolean | null;
  verificationWindow?: QuestVerificationWindow | null;
  exercises: QuestExercise[];
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

export async function getTodayQuest(): Promise<QuestResponse> {
  const res = await axios.get<{ data: QuestResponse }>(
    `${BASE_URL}/quests/today`,
    { headers: authHeader() },
  );
  return res.data.data;
}

export async function completeQuest(
  questId: number,
  request: CompleteQuestRequest = {},
): Promise<QuestResponse> {
  const res = await axios.patch<{ data: QuestResponse }>(
    `${BASE_URL}/quests/${questId}/complete`,
    request,
    { headers: authHeader() },
  );
  return res.data.data;
}
