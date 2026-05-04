import axios from 'axios';
import { getStoredAuth } from './AuthService';

const API_BASE_URL = 'http://100.89.171.113:8080';
const BASE_URL = `${API_BASE_URL}/api`;

export interface WorldBannerSlide {
  scenarioId: number;
  worldTitle: string;
  genre: string | null;
  summary: string | null;
  imageUrl: string | null;
  backgroundImageUrl: string | null;
  representativeCharacterName: string | null;
  representativeCharacterTitle: string | null;
  headline: string | null;
  quote: string | null;
}

export interface WorldRankingItem {
  rank: number;
  scenarioId: number;
  worldTitle: string;
  displayName: string | null;
  imageUrl: string | null;
  score: number;
}

export interface FullWorldRankingItem extends WorldRankingItem {
  genre?: string | null;
  summary?: string | null;
  worldSummary?: string | null;
  representativeCharacterName?: string | null;
  representativeCharacterTitle?: string | null;
  characterName?: string | null;
  characterTitle?: string | null;
  title?: string | null;
  tags?: string[] | null;
  streak?: number | null;
}

export interface WeeklyActivityRankingItem {
  rank: number;
  userId: number;
  nickname: string;
  weeklyExp: number;
  isMe: boolean;
}

export interface WorldBannersResponse {
  slides: WorldBannerSlide[];
}

export interface WorldRankingsResponse {
  metric: string;
  rankings: WorldRankingItem[];
}

export interface FullWorldRankingsResponse {
  metric: string;
  rankings: FullWorldRankingItem[];
}

export interface WeeklyActivityRankingsResponse {
  weekStartDate: string;
  weekEndDate: string;
  metric: string;
  rankings: WeeklyActivityRankingItem[];
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

export async function getWorldBanners(limit = 3): Promise<WorldBannerSlide[]> {
  const response = await axios.get<{ data: WorldBannersResponse }>(
    `${BASE_URL}/home/world-banners`,
    { headers: authHeader(), params: { limit } },
  );
  return response.data.data.slides;
}

export async function getWorldRankings(limit = 5): Promise<WorldRankingItem[]> {
  const response = await axios.get<{ data: WorldRankingsResponse }>(
    `${BASE_URL}/worlds/rankings`,
    { headers: authHeader(), params: { limit } },
  );
  return response.data.data.rankings;
}

export async function getFullWorldRankings(limit = 20): Promise<FullWorldRankingItem[]> {
  const response = await axios.get<{ data: FullWorldRankingsResponse }>(
    `${BASE_URL}/worlds/rankings/full`,
    { headers: authHeader(), params: { limit } },
  );
  return response.data.data.rankings;
}

export async function getWeeklyActivityRankings(size = 3): Promise<WeeklyActivityRankingItem[]> {
  const response = await axios.get<{ data: WeeklyActivityRankingsResponse }>(
    `${BASE_URL}/rankings/weekly-activity`,
    { headers: authHeader(), params: { size } },
  );
  return response.data.data.rankings;
}

export async function getWeeklyActivityRankingsFull(size = 100): Promise<WeeklyActivityRankingsResponse> {
  const response = await axios.get<{ data: WeeklyActivityRankingsResponse }>(
    `${BASE_URL}/rankings/weekly-activity`,
    { headers: authHeader(), params: { size } },
  );
  return response.data.data;
}
