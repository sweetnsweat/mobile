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

function logQuestRequest(label: string, method: 'GET' | 'PATCH', url: string, body: unknown = null): void {
  console.log(`[QuestAPI] ${label} request`, {
    method,
    url,
    body: JSON.stringify(body, null, 2),
  });
}

function logQuestResponse(label: string, data: unknown): void {
  console.log(`[QuestAPI] ${label} response`, JSON.stringify(data, null, 2));
}

export async function getTodayQuest(): Promise<QuestResponse> {
  const url = `${BASE_URL}/quests/today`;
  logQuestRequest('today quest', 'GET', url);
  const res = await axios.get<{ data: QuestResponse }>(
    url,
    { headers: authHeader() },
  );
  logQuestResponse('today quest', res.data);
  return res.data.data;
}

export async function completeQuest(
  questId: number,
  request: CompleteQuestRequest = {},
): Promise<QuestResponse> {
  const url = `${BASE_URL}/quests/${questId}/complete`;
  logQuestRequest('complete quest', 'PATCH', url, request);
  const res = await axios.patch<{ data: QuestResponse }>(
    url,
    request,
    { headers: authHeader() },
  );
  logQuestResponse('complete quest', res.data);
  return res.data.data;
}
