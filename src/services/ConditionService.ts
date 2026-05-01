import axios from 'axios';
import { getStoredAuth } from './AuthService';

const BASE_URL = 'http://100.89.171.113:8080/api/conditions';

const conditionLevelMap: Record<string, number> = {
  great:  5,
  good:   4,
  normal: 3,
  tired:  2,
  bad:    1,
};

const sleepScoreMap: Record<string, number> = {
  excellent: 4,
  good:      3,
  okay:      2,
  poor:      1,
};

export interface ConditionRequest {
  condition: string;
  sleepQuality: string;
  stressLevel: number;
  energy: number;
}

export interface ConditionLogResponse {
  conditionLevel: number;
  sleepScore: number;
  stressScore: number;
  energyLevel: number;
  conditionScore: number;
  exerciseMultiplier: number;
  logDate: string;
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

export async function saveCondition(req: ConditionRequest): Promise<ConditionLogResponse> {
  const body = {
    conditionLevel: conditionLevelMap[req.condition],
    sleepScore:     sleepScoreMap[req.sleepQuality],
    stressScore:    req.stressLevel,
    energyLevel:    req.energy,
  };

  const response = await axios.put<{ data: ConditionLogResponse }>(
    `${BASE_URL}/today`,
    body,
    { headers: { 'Content-Type': 'application/json', ...authHeader() } },
  );
  return response.data.data;
}

export async function getTodayCondition(): Promise<ConditionLogResponse> {
  const response = await axios.get<{ data: ConditionLogResponse }>(
    `${BASE_URL}/today`,
    { headers: authHeader() },
  );
  return response.data.data;
}
