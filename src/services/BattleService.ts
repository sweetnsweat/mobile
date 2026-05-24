import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getStoredAuth } from './AuthService';

const BASE_URL = API_BASE_URL;

export type BattleMode = 'DAILY' | 'WEEKLY';
export type BattleStatus = 'ACTIVE' | 'FINALIZED' | 'CANCELLED';
export type BattleResult = 'PENDING' | 'WIN' | 'LOSS' | 'DRAW';

export interface BattleSummaryBattle {
  battleId: number;
  mode: BattleMode;
  status: BattleStatus;
  periodStartDate: string;
  periodEndDate: string;
  endsAt: string;
}

export interface BattleSummary {
  rankName: string;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  currentDailyBattle: BattleSummaryBattle | null;
  currentWeeklyBattle: BattleSummaryBattle | null;
}

export interface BattleParticipant {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  me: boolean;
  score: number;
  result: BattleResult;
}

export interface BattleMetric {
  metricKey:
    | 'TOTAL_SCORE'
    | 'ACTIVE_MINUTES'
    | 'DISTANCE'
    | 'STEPS'
    | 'ACTIVE_CALORIES'
    | 'COMPLETED_QUESTS'
    | string;
  label: string;
  myValue: string;
  myPercent: number;
  opponentValue: string;
  opponentPercent: number;
  unit: string;
}

export interface BattleDetail {
  battleId: number;
  mode: BattleMode;
  status: BattleStatus;
  periodStartDate: string;
  periodEndDate: string;
  startsAt: string;
  endsAt: string;
  remainingSeconds: number;
  participants: BattleParticipant[];
  score: {
    myScore: number;
    opponentScore: number;
    leadingUserId: number | null;
  };
  metrics: BattleMetric[];
}

export interface BattleResultDetail {
  battleId: number;
  mode: BattleMode;
  status: BattleStatus;
  periodStartDate: string;
  periodEndDate: string;
  startsAt: string;
  endsAt: string;
  finalized: boolean;
  result: BattleResult;
  winnerUserId: number | null;
  rewardExp: number;
  rewardGold: number;
  myScore: number;
  opponentScore: number;
  participants: BattleParticipant[];
  metrics: BattleMetric[];
}

export interface BattleHistoryItem {
  battleId: number;
  mode: BattleMode;
  result: BattleResult;
  periodStartDate: string;
  periodEndDate: string;
  endedAt: string;
  opponent: BattleParticipant | null;
  myScore: number;
  opponentScore: number;
}

export interface BattleHistory {
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  nextPage: number | null;
  battles: BattleHistoryItem[];
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

type BattleApiMethod = 'GET' | 'POST';

function logBattleRequest(
  label: string,
  method: BattleApiMethod,
  url: string,
  payload?: unknown,
): void {
  console.log(`[BattleAPI] ${label} request`, { method, url, payload });
}

function logBattleResponse<T>(label: string, data: T): T {
  console.log(`[BattleAPI] ${label} response`, JSON.stringify(data, null, 2));
  return data;
}

function logBattleError(label: string, error: any): void {
  console.warn(`[BattleAPI] ${label} error`, {
    status: error?.response?.status,
    url: error?.config?.url,
    method: error?.config?.method,
    requestData: error?.config?.data,
    responseData: error?.response?.data,
    message: error?.message,
  });
}

export function durationToBattleMode(duration: '1d' | '7d'): BattleMode {
  return duration === '1d' ? 'DAILY' : 'WEEKLY';
}

export function battleModeToDuration(mode: BattleMode): '1d' | '7d' {
  return mode === 'DAILY' ? '1d' : '7d';
}

export async function getBattleSummary(): Promise<BattleSummary> {
  const url = `${BASE_URL}/battles/me/summary`;
  logBattleRequest('summary', 'GET', url);

  try {
    const res = await axios.get<{ data: BattleSummary }>(url, {
      headers: authHeader(),
    });
    return logBattleResponse('summary', res.data.data);
  } catch (error) {
    logBattleError('summary', error);
    throw error;
  }
}

export async function matchBattle(mode: BattleMode): Promise<BattleDetail> {
  const url = `${BASE_URL}/battles/match`;
  const payload = { mode };
  logBattleRequest('match', 'POST', url, payload);

  try {
    const res = await axios.post<{ data: BattleDetail }>(url, payload, {
      headers: authHeader(),
    });
    return logBattleResponse('match', res.data.data);
  } catch (error) {
    logBattleError('match', error);
    throw error;
  }
}

export async function getBattleDetail(battleId: number): Promise<BattleDetail> {
  const url = `${BASE_URL}/battles/${battleId}`;
  logBattleRequest('detail', 'GET', url, { battleId });

  try {
    const res = await axios.get<{ data: BattleDetail }>(url, {
      headers: authHeader(),
    });
    return logBattleResponse('detail', res.data.data);
  } catch (error) {
    logBattleError('detail', error);
    throw error;
  }
}

export async function getBattleResult(battleId: number): Promise<BattleResultDetail> {
  const url = `${BASE_URL}/battles/${battleId}/result`;
  logBattleRequest('result', 'GET', url, { battleId });

  try {
    const res = await axios.get<{ data: BattleResultDetail }>(url, {
      headers: authHeader(),
    });
    return logBattleResponse('result', res.data.data);
  } catch (error) {
    logBattleError('result', error);
    throw error;
  }
}

export async function getBattleHistory(
  page = 0,
  size = 20,
): Promise<BattleHistory> {
  const url = `${BASE_URL}/battles/history`;
  const params = { page, size };
  logBattleRequest('history', 'GET', url, params);

  try {
    const res = await axios.get<{ data: BattleHistory }>(url, {
      headers: authHeader(),
      params,
    });
    return logBattleResponse('history', res.data.data);
  } catch (error) {
    logBattleError('history', error);
    throw error;
  }
}
