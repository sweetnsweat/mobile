import axios from 'axios';
import { getStoredAuth } from './AuthService';

const BASE_URL = 'http://100.89.171.113:8080/api';

export interface RoutineExerciseResponse {
  id: number;
  name: string;
  category: string;
  intensity: string | null;
  level: string;
  equipment: string | null;
  primaryMuscles: string[];
  imageUrls: string[];
}

export interface RoutineItemResponse {
  id: number;
  seq: number;
  reps: number | null;
  sets: number | null;
  durationSec: number | null;
  restSec: number | null;
  exercise: RoutineExerciseResponse;
}

export interface RoutineSessionResponse {
  id: number;
  seq: number;
  dayOfWeek: string;
  dayOfWeekDisplayName: string;
  sessionName: string;
  sessionType: string;
  sessionTypeDisplayName: string;
  estimatedMinutes: number;
  active: boolean;
  items: RoutineItemResponse[];
}

export interface RoutineSummaryResponse {
  id: number;
  name: string;
  description: string | null;
  difficulty: string | null;
  estimatedMinutes: number | null;
  goalTypes: string[];
  weeklyFrequency: number | null;
  isDefault: boolean;
  active: boolean;
}

export interface RoutineDetailResponse {
  id: number;
  name: string;
  description: string | null;
  difficulty: string | null;
  estimatedMinutes: number | null;
  targetExperienceLevel: string | null;
  goalTypes: string[];
  weeklyFrequency: number | null;
  isDefault: boolean;
  sessions: RoutineSessionResponse[];
  items: RoutineItemResponse[];
}

export interface RoutineRecommendationResponse {
  routine: RoutineSummaryResponse;
  score: number;
  reasons: string[];
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

export async function getRecommendations(): Promise<RoutineRecommendationResponse[]> {
  const response = await axios.get<{ data: RoutineRecommendationResponse[] }>(
    `${BASE_URL}/routines/recommendations`,
    { headers: authHeader() },
  );
  return response.data.data;
}

export async function activateRoutine(routineId: number): Promise<RoutineDetailResponse> {
  const response = await axios.post<{ data: RoutineDetailResponse }>(
    `${BASE_URL}/routines/${routineId}/activate`,
    {},
    { headers: authHeader() },
  );
  return response.data.data;
}

export async function getMyRoutines(): Promise<RoutineSummaryResponse[]> {
  const response = await axios.get<{ data: RoutineSummaryResponse[] }>(
    `${BASE_URL}/users/me/routines`,
    { headers: authHeader() },
  );
  return response.data.data;
}

export async function getActiveRoutine(): Promise<RoutineDetailResponse> {
  const response = await axios.get<{ data: RoutineDetailResponse }>(
    `${BASE_URL}/users/me/routines/active`,
    { headers: authHeader() },
  );
  return response.data.data;
}

export async function getRoutine(routineId: number): Promise<RoutineDetailResponse> {
  const response = await axios.get<{ data: RoutineDetailResponse }>(
    `${BASE_URL}/routines/${routineId}`,
    { headers: authHeader() },
  );
  return response.data.data;
}

export interface CreateRoutineItemRequest {
  exerciseId: number;
  sets?: number;
  reps?: number;
  durationSec?: number;
  restSec?: number;
}

export interface CreateRoutineSessionRequest {
  dayOfWeek: string;
  sessionName: string;
  sessionType?: string;
  estimatedMinutes?: number;
  items: CreateRoutineItemRequest[];
}

export interface CreateCustomRoutineRequest {
  name: string;
  description?: string;
  activate?: boolean;
  sessions: CreateRoutineSessionRequest[];
}

export async function createCustomRoutine(req: CreateCustomRoutineRequest): Promise<RoutineDetailResponse> {
  const response = await axios.post<{ data: RoutineDetailResponse }>(
    `${BASE_URL}/routines/custom`,
    req,
    { headers: { 'Content-Type': 'application/json', ...authHeader() } },
  );
  return response.data.data;
}
