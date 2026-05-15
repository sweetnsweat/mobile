import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getStoredAuth } from './AuthService';

const BASE_URL   = `${API_BASE_URL}/exercises`;
const USERS_URL  = `${API_BASE_URL}/users`;

export interface ExerciseCategory {
  category: string;
  categoryDisplayName: string;
}

export interface ExerciseCategoryListResponse {
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  nextPage: number | null;
  categories: ExerciseCategory[];
}

export interface ExerciseListItem {
  id: number;
  name: string;
  category: string;
  categoryDisplayName: string;
  level: string;
  levelDisplayName: string;
  equipment: string;
  met: number;
  estimatedKcalPerHour: number;
  primaryMuscles: string[];
  emoji: string;
  imageUrl: string | null;
  liked: boolean;
}

export interface ExerciseCategoryGroup {
  category: string;
  categoryDisplayName: string;
  count: number;
  exercises: ExerciseListItem[];
}

export interface ExerciseListResponse {
  scope: string;
  category: string | null;
  level: string | null;
  keyword: string | null;
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  nextPage: number | null;
  groups: ExerciseCategoryGroup[];
}

export interface ExerciseDetail extends ExerciseListItem {
  secondaryMuscles: string[];
  instructions: string[];
  imageUrls: string[];
  sourceLicense: string | null;
  sourceUrl: string | null;
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

// GET /api/exercises/categories
export async function getExerciseCategories(params?: {
  page?: number;
  size?: number;
}): Promise<ExerciseCategoryListResponse> {
  const query: Record<string, number> = {};
  if (params?.page != null) query.page = params.page;
  if (params?.size != null) query.size = params.size;

  const response = await axios.get<{ data: ExerciseCategoryListResponse }>(
    `${BASE_URL}/categories`,
    { headers: authHeader(), params: query },
  );
  return response.data.data;
}

// GET /api/exercises
export async function getExercises(params?: {
  scope?: 'all' | 'favorite' | 'recent';
  category?: string;
  level?: string;
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<ExerciseListResponse> {
  const query: Record<string, string | number> = {};
  if (params?.scope)    query.scope    = params.scope;
  if (params?.category && params.category !== '전체') query.category = params.category;
  if (params?.level    && params.level    !== '전체') query.level    = params.level;
  if (params?.keyword  && params.keyword.trim())      query.keyword  = params.keyword.trim();
  if (params?.page  != null) query.page = params.page;
  if (params?.size  != null) query.size = params.size;

  const response = await axios.get<{ data: ExerciseListResponse }>(
    BASE_URL,
    { headers: authHeader(), params: query },
  );
  return response.data.data;
}

// GET /api/users/me/exercises/favorites
export async function getFavoriteExercises(params?: {
  category?: string;
  level?: string;
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<ExerciseListResponse> {
  const query: Record<string, string | number> = {};
  if (params?.category && params.category !== '?꾩껜' && params.category !== 'all') query.category = params.category;
  if (params?.level    && params.level    !== '?꾩껜' && params.level    !== 'all') query.level    = params.level;
  if (params?.keyword  && params.keyword.trim()) query.keyword = params.keyword.trim();
  if (params?.page != null) query.page = params.page;
  if (params?.size != null) query.size = params.size;

  const response = await axios.get<{ data: ExerciseListResponse }>(
    `${USERS_URL}/me/exercises/favorites`,
    { headers: authHeader(), params: query },
  );
  return response.data.data;
}

// GET /api/exercises/{id}
export async function getExerciseById(id: number): Promise<ExerciseDetail> {
  const response = await axios.get<{ data: ExerciseDetail }>(
    `${BASE_URL}/${id}`,
    { headers: authHeader() },
  );
  return response.data.data;
}

// PUT /api/users/me/exercises/{exerciseId}/favorite
export async function toggleFavorite(exerciseId: number, liked: boolean): Promise<void> {
  await axios.put(
    `${USERS_URL}/me/exercises/${exerciseId}/favorite`,
    { liked },
    { headers: { 'Content-Type': 'application/json', ...authHeader() } },
  );
}
