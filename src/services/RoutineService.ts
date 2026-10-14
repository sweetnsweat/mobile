import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getStoredAuth } from './AuthService';

const BASE_URL = API_BASE_URL;

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

export interface TodayRoutineSummary {
  id: number;
  name: string;
  estimatedMinutes: number | null;
  active: boolean;
}

export interface TodayRoutineResponse {
  date: string;
  dayOfWeek: string;
  dayOfWeekDisplayName: string;
  activeRoutineExists: boolean;
  routineScheduledToday: boolean;
  routine: TodayRoutineSummary | null;
  session: RoutineSessionResponse | null;
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

export async function getTodayRoutine(): Promise<TodayRoutineResponse> {
  const response = await axios.get<{ data: TodayRoutineResponse }>(
    `${BASE_URL}/routines/today`,
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

export async function updateRoutine(routineId: number, req: CreateCustomRoutineRequest): Promise<RoutineDetailResponse> {
  const response = await axios.put<{ data: RoutineDetailResponse }>(
    `${BASE_URL}/routines/${routineId}`,
    req,
    { headers: { 'Content-Type': 'application/json', ...authHeader() } },
  );
  return response.data.data;
}

export async function deleteRoutine(routineId: number): Promise<void> {
  await axios.delete(
    `${BASE_URL}/routines/${routineId}`,
    { headers: authHeader() },
  );
}
