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

export interface DialogueItem {
  character_image_url?: string;
  character_name?: string;
  name?: string;
  dialogue?: string;
  representativeCharacterTitle?: string;
}

export interface StoryPlayResponse {
  scenario_id?: number;
  chapter_num?: number;
  phase?: string;
  unit_index?: number;
  total_units?: number;
  is_chapter_completed?: boolean;
  is_story_completed?: boolean;
  dialogue?: DialogueItem[];
  opening_characters?: DialogueItem[];
  [key: string]: any;
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

export async function playStory(req: StoryPlayRequest): Promise<StoryPlayResponse> {
  const response = await axios.post<{ data: StoryPlayResponse }>(
    `${BASE_URL}/stories/play`,
    req,
    { headers: { 'Content-Type': 'application/json', ...authHeader() } },
  );
  console.log('[StoryAPI] /play response data:', response.data.data);
  return response.data.data;
}

export interface HistoryItem {
  role: string;
  character_name: string | null;
  content: string;
}

export async function fetchStoryHistory(scenario_id: number): Promise<HistoryItem[]> {
  const response = await axios.get<{ data: { items: HistoryItem[] } }>(
    `${BASE_URL}/stories/play/history`,
    { params: { scenario_id }, headers: authHeader() },
  );
  return response.data.data.items ?? [];
}

export type StoryTextType = 'narration' | 'dialogue';

export interface StoryText {
  text: string;
  type: StoryTextType;
  sourceKey?: string;
}

// dialogue 전용 필드 — 캐릭터 말풍선으로 표시
const DIALOGUE_FIELDS = ['dialogue', 'speech', 'character_speech', 'character_dialogue'];
// narration 전용 필드 — 회색 배경 나레이션으로 표시
const NARRATION_FIELDS = ['opening_summary', 'narration', 'question_text', 'narrative', 'scene_text', 'description', 'narration_text', 'story_text', 'chapter_text'];
// 판단 불가 필드 — phase 기준으로 분류, 기본은 narration
const AMBIGUOUS_FIELDS = ['content', 'text', 'message', 'response_text'];

const DIALOGUE_PHASES = new Set(['DIALOGUE', 'SPEECH']);

export function extractStoryText(data: StoryPlayResponse): StoryText | null {
  return extractStoryTexts(data)[0] ?? null;
}

export function extractStoryTexts(data: StoryPlayResponse): StoryText[] {
  const texts: StoryText[] = [];
  const seen = new Set<string>();

  function addText(type: StoryTextType, value: unknown, sourceKey: string) {
    if (typeof value !== 'string') return;
    const text = value.trim();
    if (!text || seen.has(`${sourceKey}:${text}`)) return;
    seen.add(`${sourceKey}:${text}`);
    texts.push({ text, type, sourceKey });
  }

  for (const key of NARRATION_FIELDS) {
    addText('narration', data[key], key);
  }
  for (const key of DIALOGUE_FIELDS) {
    addText('dialogue', data[key], key);
  }
  for (const key of AMBIGUOUS_FIELDS) {
    if (typeof data[key] === 'string' && data[key].trim()) {
      const type = data.phase && DIALOGUE_PHASES.has(data.phase) ? 'dialogue' : 'narration';
      addText(type, data[key], key);
    }
  }
  return texts;
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
        text: extractChoiceText(c, i),
        ...c,
      }));
    }
  }
  return [];
}

function extractChoiceText(choice: any, index: number): string {
  const candidates = [
    choice?.text,
    choice?.choice_text,
    choice?.option_text,
    choice?.label,
    choice?.content,
    choice?.message,
    choice?.title,
    choice?.description,
  ];

  for (const candidate of candidates) {
    const text = stringifyChoiceValue(candidate);
    if (text) return text;
  }

  const wholeChoiceText = stringifyChoiceValue(choice);
  return wholeChoiceText || `선택지 ${index + 1}`;
}

function stringifyChoiceValue(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (!value || typeof value !== 'object') return '';

  const obj = value as Record<string, unknown>;
  const nestedKeys = ['text', 'choice_text', 'option_text', 'label', 'content', 'message', 'title', 'description'];
  for (const key of nestedKeys) {
    const nestedText = stringifyChoiceValue(obj[key]);
    if (nestedText) return nestedText;
  }
  return '';
}
