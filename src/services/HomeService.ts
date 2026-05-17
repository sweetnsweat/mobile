import axios from 'axios';
import { API_BASE_URL, API_ORIGIN } from '../config/api';
import { getStoredAuth } from './AuthService';

const BASE_URL = API_BASE_URL;

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

export interface RepresentativeCharacterItem {
  id: number | null;
  name: string | null;
  title: string | null;
  type: string | null;
  imageUrl: string | null;
  quote: string | null;
  tags: string[];
}

export interface WorldRankingDetailItem {
  rank: number;
  scenarioId: number | null;
  scenarioTitle: string | null;
  worldTitle: string;
  summary: string | null;
  genre: string | null;
  genres: string[];
  thumbnailUrl: string | null;
  worldImageUrl: string | null;
  playerImageUrl: string | null;
  playerDescription: string | null;
  representativeCharacter: RepresentativeCharacterItem | null;
  displayName: string | null;
  imageUrl: string | null;
  backgroundImageUrl: string | null;
  score: number;
}

export interface WorldPreviewCharacter {
  id: number | null;
  name: string;
  title: string | null;
  type: string | null;
  imageUrl: string | null;
  quote: string | null;
  tags: string[];
  representative: boolean;
}

export interface WorldPreviewData {
  scenario: {
    id: number;
    title: string;
    summary: string | null;
    genre: string | null;
    genres: string[];
    thumbnailUrl: string | null;
    worldImageUrl: string | null;
    playerImageUrl: string | null;
    playerDescription: string | null;
    active: boolean;
  };
  ranking: {
    metric: string;
    score: number;
  };
  representativeCharacter: WorldPreviewCharacter | null;
  characters: WorldPreviewCharacter[];
  entry: {
    canEnter: boolean;
    hasProgress: boolean;
    progressStatus: string | null;
  };
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

export interface WorldRankingPageResponse {
  metric: string;
  genre: string | null;
  keyword: string | null;
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  nextPage: number | null;
  rankings: WorldRankingDetailItem[];
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
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
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

export async function getFullWorldRankings(
  page = 0,
  size = 50,
  genre?: string,
  keyword?: string,
): Promise<WorldRankingDetailItem[]> {
  const params: Record<string, unknown> = { page, size };
  if (genre && genre !== '전체') params.genre = genre;
  if (keyword) params.keyword = keyword;
  const response = await axios.get<{ data: WorldRankingPageResponse }>(
    `${BASE_URL}/worlds/rankings/full`,
    { headers: authHeader(), params },
  );
  return response.data.data.rankings;
}

export async function getWorldPreview(scenarioId: number): Promise<WorldPreviewData> {
  const response = await axios.get<{ data: WorldPreviewData }>(
    `${BASE_URL}/worlds/${scenarioId}/preview`,
    { headers: authHeader() },
  );
  return response.data.data;
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
