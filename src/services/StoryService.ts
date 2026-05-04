import axios from 'axios';
import { getStoredAuth } from './AuthService';

const BASE_URL = 'http://100.89.171.113:8080/api';

export interface StoryPlayRequest {
  scenario_id?: number;
  user_message?: string | null;
  choice_id?: number | null;
  restart?: boolean;
}

export interface StoryChoice {
  id: number;
  text: string;
  [key: string]: any;
}

export interface StoryPlayResponse {
  scenario_id?: number;
  chapter_num?: number;
  phase?: string;
  unit_index?: number;
  total_units?: number;
  is_chapter_completed?: boolean;
  is_story_completed?: boolean;
  [key: string]: any;
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

async function post(path: string, req: StoryPlayRequest): Promise<StoryPlayResponse> {
  const response = await axios.post<{ data: StoryPlayResponse }>(
    `${BASE_URL}${path}`,
    req,
    { headers: { 'Content-Type': 'application/json', ...authHeader() } },
  );
  return response.data.data;
}

// 통합 진행 (기본 엔드포인트)
export async function playStory(req: StoryPlayRequest): Promise<StoryPlayResponse> {
  return post('/stories/play', req);
}

// 처음부터 시작
export async function startStory(req: StoryPlayRequest): Promise<StoryPlayResponse> {
  return post('/stories/play/start', req);
}

// 현재 흐름 이어가기
export async function continueStory(req: StoryPlayRequest): Promise<StoryPlayResponse> {
  return post('/stories/play/continue', req);
}

// 선택지 선택
export async function chooseStory(req: StoryPlayRequest): Promise<StoryPlayResponse> {
  return post('/stories/play/choose', req);
}

// 다음 챕터 이동
export async function nextChapter(req: StoryPlayRequest): Promise<StoryPlayResponse> {
  return post('/stories/play/next-chapter', req);
}

export type StoryTextType = 'narration' | 'dialogue';

export interface StoryText {
  text: string;
  type: StoryTextType;
}

// dialogue 전용 필드 — 캐릭터 말풍선으로 표시
const DIALOGUE_FIELDS = ['dialogue', 'speech', 'character_speech', 'character_dialogue'];
// narration 전용 필드 — 회색 배경 나레이션으로 표시
const NARRATION_FIELDS = ['narration', 'narrative', 'scene_text', 'description', 'narration_text', 'story_text', 'chapter_text'];
// 판단 불가 필드 — phase 기준으로 분류, 기본은 narration
const AMBIGUOUS_FIELDS = ['content', 'text', 'message', 'response_text'];

const DIALOGUE_PHASES = new Set(['DIALOGUE', 'SPEECH']);

export function extractStoryText(data: StoryPlayResponse): StoryText | null {
  for (const key of DIALOGUE_FIELDS) {
    if (typeof data[key] === 'string' && data[key].trim()) {
      return { text: data[key], type: 'dialogue' };
    }
  }
  for (const key of NARRATION_FIELDS) {
    if (typeof data[key] === 'string' && data[key].trim()) {
      return { text: data[key], type: 'narration' };
    }
  }
  for (const key of AMBIGUOUS_FIELDS) {
    if (typeof data[key] === 'string' && data[key].trim()) {
      const type = data.phase && DIALOGUE_PHASES.has(data.phase) ? 'dialogue' : 'narration';
      return { text: data[key], type };
    }
  }
  return null;
}

// 하위 호환용 — 텍스트만 필요할 때
export function extractNarrative(data: StoryPlayResponse): string | null {
  return extractStoryText(data)?.text ?? null;
}

// AI 응답에서 선택지 추출
export function extractChoices(data: StoryPlayResponse): StoryChoice[] {
  const candidates = ['choices', 'options', 'chapter_choices', 'next_choices'];
  for (const key of candidates) {
    const val = data[key];
    if (Array.isArray(val) && val.length > 0) {
      return val.map((c: any, i: number) => ({
        id: c.id ?? c.choice_id ?? i + 1,
        text: c.text ?? c.content ?? c.label ?? String(c),
        ...c,
      }));
    }
  }
  return [];
}
