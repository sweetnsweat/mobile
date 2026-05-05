import axios from 'axios';
import { getStoredAuth } from './AuthService';

const BASE_URL = 'http://100.89.171.113:8080/api';

export interface QuestExercise {
  exerciseId: number;
  exerciseName: string;
  category: string;
  seq: number;
  targetSets: number | null;
  targetReps: number | null;
  targetDurationSec: number | null;
}

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

export async function completeQuest(questId: number): Promise<QuestResponse> {
  const res = await axios.patch<{ data: QuestResponse }>(
    `${BASE_URL}/quests/${questId}/complete`,
    {},
    { headers: authHeader() },
  );
  return res.data.data;
}
