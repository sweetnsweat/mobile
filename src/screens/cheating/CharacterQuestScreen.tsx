import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, ActivityIndicator, Alert, Animated,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, RotateCcw, Sparkles, Trophy, Star, Flame } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { ScreenBackground } from '../../components/ScreenBackground';
import { usePulseAnimation } from '../../hooks/usePulseAnimation';
import {
  playStory,
  fetchStoryHistory,
  extractStoryTexts,
  extractChoices,
  StoryPlayResponse,
  StoryChoice,
} from '../../services/StoryService';
import { completeQuest } from '../../services/QuestService';
import { AI_MEDIA_ORIGIN } from '../../config/api';

type Props = NativeStackScreenProps<RootStackParamList, 'CharacterQuest'>;

const DEFAULT_SCENARIO_ID = 7;

function resolveCharacterImage(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${AI_MEDIA_ORIGIN}${url}`;
}

// ─── 타입 ─────────────────────────────────────────────────────────────────────

type Role = 'character' | 'narration' | 'user' | 'system' | 'quest';

interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  speaker?: string;
  sourceKey?: string;
  time?: string;
  questId?: number;
  questData?: any;
}

let _msgId = 0;
function msgId() { return String(++_msgId); }

function formatServerTime(iso?: string): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (isNaN(date.getTime())) return undefined;
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${m}`;
}

function phaseLabel(phase?: string): string {
  if (!phase) return '';
  const map: Record<string, string> = {
    INTRO: '인트로', MAIN: '진행 중', CHOICE: '선택', ENDING: '엔딩',
    RESULT: '결과', NARRATION: '나레이션',
  };
  return map[phase] ?? phase;
}

// ─── 메인 화면 ────────────────────────────────────────────────────────────────

export function CharacterQuestScreen({ navigation, route }: Props) {
  const scenario_id = route.params?.scenario_id ?? DEFAULT_SCENARIO_ID;
  const introStarted = route.params?.introStarted ?? false;

  const [messages,      setMessages]      = useState<ChatMessage[]>([]);
  const [choices,       setChoices]       = useState<StoryChoice[]>([]);
  const [selectedChoiceKey, setSelectedChoiceKey] = useState<string | null>(null);
  const [storyData,     setStoryData]     = useState<StoryPlayResponse | null>(null);
  const [characterMeta, setCharacterMeta] = useState<{ name: string; sub: string; img: string }>({ name: '', sub: '', img: '' });
  const [input,         setInput]         = useState('');
  const [loading,       setLoading]       = useState(true);
  const [isRestarting,  setIsRestarting]  = useState(true);
  const [sending,       setSending]       = useState(false);
  const [activeQuest,   setActiveQuest]   = useState<{ id: number; data: any } | null>(null);
  const [completingQuest, setCompletingQuest] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // ── 초기 로드 ──────────────────────────────────────────────────────────────

  useEffect(() => {
    initStory();
  }, [scenario_id]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // ── API 호출 공통 처리 ────────────────────────────────────────────────────

  function applyResponse(data: StoryPlayResponse) {
    console.log('[StoryAPI] response:', JSON.stringify(data, null, 2));
    setStoryData(data);

    // dialogue 또는 opening_characters에서 캐릭터 정보 추출 → 헤더 프로필 갱신
    const firstChar = data.dialogue?.[0] ?? data.opening_characters?.[0];
    if (firstChar) {
      const name = firstChar.character_name ?? firstChar.name ?? '';
      const sub  = firstChar.representativeCharacterTitle ?? '';
      const img  = resolveCharacterImage(firstChar.character_image_url);
      setCharacterMeta({ name, sub, img });
    }

    // 나레이션/question_text 등 텍스트 필드 추출
    const storyTexts = extractStoryTexts(data);
    const newChoices = extractChoices(data);

    const speaker = typeof data.speaker === 'string' ? data.speaker : undefined;

    if (storyTexts.length > 0) {
      storyTexts.forEach(storyText => {
        const role = storyText.type === 'narration' ? 'narration' : 'character';
        pushMessage(role, storyText.text, role === 'character' ? speaker : undefined, storyText.sourceKey);
      });
    } else if (data.phase) {
      pushMessage('system', `[${phaseLabel(data.phase)}${data.chapter_num ? ` · 챕터 ${data.chapter_num}` : ''}${data.unit_index != null ? ` · ${data.unit_index + 1}/${data.total_units}` : ''}]`);
    }

    // dialogue 배열에서 캐릭터 대사 직접 추출 (extractStoryTexts는 배열 미지원)
    const formattedTime = formatServerTime(data.server_time);
    if (Array.isArray(data.dialogue) && data.dialogue.length > 0) {
      data.dialogue.forEach((item: any) => {
        const text = item.dialogue ?? item.text;
        const itemSpeaker = item.character_name ?? item.name;
        if (text) pushMessage('character', text, itemSpeaker, undefined, formattedTime);
      });
    }

    const questId = data.workout_quest_id;
    const questData = data.workout_quest;
    if (questId) {
      setChoices([]);
      setSelectedChoiceKey(null);
      setActiveQuest({ id: questId, data: questData ?? null });
      setMessages(prev => [...prev, { id: msgId(), role: 'quest', text: '', questId, questData }]);
    } else {
      setChoices(newChoices);
      setSelectedChoiceKey(null);
    }

    if (data.is_chapter_completed && !data.is_story_completed) {
      pushMessage('system', '이 챕터가 완료되었습니다. 다음 챕터로 이동할 수 있습니다.');
    }
    if (data.is_story_completed) {
      pushMessage('system', '스토리가 완료되었습니다.');
    }
  }

  function pushMessage(role: Role, text: string, speaker?: string, sourceKey?: string, time?: string) {
    setMessages(prev => [...prev, { id: msgId(), role, text, speaker, sourceKey, time }]);
  }

  // ── 상태만 갱신 (메시지 추가 없이) ──────────────────────────────────────

  function applyStateOnly(data: StoryPlayResponse) {
    setStoryData(data);
    // restart:false 응답엔 dialogue/opening_characters가 없을 수 있어서 더 넓게 탐색
    const firstChar =
      data.dialogue?.[0] ??
      data.opening_characters?.[0] ??
      data.characters?.[0] ??
      data.character;
    if (firstChar) {
      setCharacterMeta({
        name: firstChar.character_name ?? firstChar.name ?? '',
        sub:  firstChar.representativeCharacterTitle ?? firstChar.title ?? '',
        img:  resolveCharacterImage(firstChar.character_image_url ?? firstChar.image_url),
      });
    }
    setChoices(extractChoices(data));
    setSelectedChoiceKey(null);
  }

  // ── 최초 진입: 히스토리 확인 후 복원 or 새 시작 ────────────────────────

  async function initStory() {
    setLoading(true);
    setMessages([]);
    setChoices([]);
    setSelectedChoiceKey(null);
    setStoryData(null);
    try {
      const history = await fetchStoryHistory(scenario_id);
      if (history.length > 0) {
        // 이전 대화 복원
        setIsRestarting(false);
        const restored = history.map((item) => ({
          id: msgId(),
          role: item.role === 'assistant'                                                       ? 'character' as Role
              : item.role === 'choice' || item.role === 'user' || item.role === 'user_message' ? 'user'      as Role
              : item.role === 'narration'                                                      ? 'narration' as Role
              : 'system' as Role,
          text: item.content,
          speaker: item.character_name ?? undefined,
        }));
        setMessages(restored);
        // 히스토리에서 캐릭터 이름 선 추출 (API 응답 전 헤더 채우기)
        const firstCharItem = history.find(item => item.role === 'assistant' && item.character_name);
        if (firstCharItem?.character_name) {
          setCharacterMeta(prev => ({ ...prev, name: firstCharItem.character_name! }));
        }
        // 현재 선택지·상태만 가져오기 (메시지 추가 없음)
        const data = await playStory({ scenario_id, restart: false });
        applyStateOnly(data);
      } else {
        // 히스토리 없음 → 새 스토리 시작
        setIsRestarting(!introStarted);
        const data = await playStory({ scenario_id, restart: !introStarted });
        applyResponse(data);
      }
    } catch (e: any) {
      setSelectedChoiceKey(null);
      console.log('[StoryAPI] initStory error:', e?.response?.data ?? e?.message ?? e);
      pushMessage('system', `연결 오류: ${e?.message ?? 'AI 서버에 접속할 수 없습니다.'}`);
    } finally {
      setLoading(false);
    }
  }

  // ── 스토리 시작/이어가기 ──────────────────────────────────────────────────

  async function loadStory(restart: boolean) {
    setLoading(true);
    setIsRestarting(restart);
    if (restart) {
      setMessages([]);
      setChoices([]);
      setSelectedChoiceKey(null);
      setStoryData(null);
    }
    try {
      const data = await playStory({ scenario_id, restart });
      applyResponse(data);
    } catch (e: any) {
      console.log('[StoryAPI] loadStory error:', e?.response?.data ?? e?.message ?? e);
      pushMessage('system', `연결 오류: ${e?.message ?? 'AI 서버에 접속할 수 없습니다.'}`);
    } finally {
      setLoading(false);
    }
  }

  // ── 사용자 메시지 전송 ────────────────────────────────────────────────────

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    pushMessage('user', text);
    setInput('');
    setSending(true);
    try {
      const data = await playStory({ scenario_id, user_message: text });
      applyResponse(data);
    } catch (e: any) {
      pushMessage('system', `오류: ${e?.message ?? '응답을 가져올 수 없습니다.'}`);
    } finally {
      setSending(false);
    }
  }

  // ── 선택지 선택 ──────────────────────────────────────────────────────────

  async function handleChoice(choice: StoryChoice, choiceKey: string) {
    pushMessage('user', choice.text);
    setSelectedChoiceKey(choiceKey);
    setSending(true);
    try {
      const data = await playStory({ scenario_id, choice_id: choice.id, restart: false });
      applyResponse(data);
    } catch (e: any) {
      pushMessage('system', `오류: ${e?.message ?? '선택을 처리할 수 없습니다.'}`);
    } finally {
      setSelectedChoiceKey(null);
      setSending(false);
    }
  }

  // ── 다음 챕터 ────────────────────────────────────────────────────────────

  async function handleNextChapter() {
    setSending(true);
    try {
      const data = await playStory({ scenario_id, restart: false });
      applyResponse(data);
    } catch (e: any) {
      pushMessage('system', `오류: ${e?.message ?? '다음 챕터로 이동할 수 없습니다.'}`);
    } finally {
      setSending(false);
    }
  }

  // ── 퀘스트 완료 ──────────────────────────────────────────────────────────

  async function handleQuestComplete() {
    if (!activeQuest || completingQuest) return;
    setCompletingQuest(true);
    try {
      const result = await completeQuest(activeQuest.id);
      setActiveQuest(null);
      const parts = [
        result.rewardExp  ? `+${result.rewardExp} EXP`  : '',
        result.rewardGold ? `+${result.rewardGold} 골드` : '',
      ].filter(Boolean).join('  ');
      pushMessage('system', `퀘스트 완료! 🎉${parts ? `  ${parts}` : ''}`);
    } catch (e: any) {
      pushMessage('system', `오류: ${e?.message ?? '퀘스트 완료 실패'}`);
    } finally {
      setCompletingQuest(false);
    }
  }

  // ── 처음부터 시작 확인 ────────────────────────────────────────────────────

  function confirmRestart() {
    Alert.alert('처음부터 시작', '스토리 진행이 초기화됩니다. 계속할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '확인', onPress: () => loadStory(true) },
    ]);
  }

  // ── 챕터 완료 여부 ────────────────────────────────────────────────────────

  const isChapterCompleted = storyData?.is_chapter_completed && !storyData?.is_story_completed;
  const isStoryCompleted   = storyData?.is_story_completed;
  const hasChoices         = choices.length > 0;
  const showTextInput      = !hasChoices && !isChapterCompleted && !isStoryCompleted && !activeQuest;

  function focusMessageInput() {
    if (!showTextInput || sending) return;
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  // ── 렌더 ─────────────────────────────────────────────────────────────────

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.kav}
        >

        {/* 헤더 */}
        <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ChevronLeft size={16} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <View style={s.avatarWrap}>
              <ImageWithFallback uri={characterMeta.img} style={s.avatarImg} />
              <View style={s.onlineDot} />
            </View>
            <View>
              <Text style={s.headerName}>{characterMeta.name}</Text>
              <Text style={s.headerSub}>{characterMeta.sub}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={confirmRestart} style={s.restartBtn}>
            <RotateCcw size={16} color="rgba(255,255,255,0.85)" strokeWidth={2} />
          </TouchableOpacity>
        </LinearGradient>


        {/* 채팅 */}
        <ScrollView
          ref={scrollRef}
          style={s.chatScroll}
          contentContainerStyle={s.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onTouchEnd={focusMessageInput}
        >
          {loading ? (
            <View style={s.centerWrap}>
              <ActivityIndicator color="#ec4899" size="large" />
              <Text style={s.loadingTxt}>{isRestarting ? '스토리를 시작하는 중...' : '스토리를 불러오는 중...'}</Text>
            </View>
          ) : (
            messages.map((msg, index) => (
              <MessageBubble key={`${msg.id}-${index}`} message={msg} characterImg={characterMeta.img} />
            ))
          )}
          {sending && (
            <View style={s.typingRow}>
              <View style={s.msgAvatar}>
                <ImageWithFallback uri={characterMeta.img} style={s.msgAvatarImg} />
              </View>
              <View style={s.typingBubble}>
                <ActivityIndicator color="#9ca3af" size="small" />
              </View>
            </View>
          )}
          <View style={{ height: 8 }} />
        </ScrollView>

        {/* 하단 입력 / 선택지 / 다음 챕터 */}
        {!loading && (
          <>
            {hasChoices && (
              <View style={s.choiceArea}>
                {choices.map((choice, index) => {
                  const choiceKey = `${choice.id}-${index}`;
                  const selected = selectedChoiceKey === choiceKey;
                  return (
                    <TouchableOpacity
                      key={choiceKey}
                      onPress={() => handleChoice(choice, choiceKey)}
                      disabled={sending}
                      activeOpacity={0.85}
                      style={s.choiceWrap}
                    >
                      {selected ? (
                        <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.choiceSelected}>
                          <Text style={s.choiceSelectedTxt}>{choice.text}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={s.choiceDefault}>
                          <Text style={s.choiceDefaultTxt}>{choice.text}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {isChapterCompleted && (
              <View style={s.nextChapterArea}>
                <TouchableOpacity onPress={handleNextChapter} disabled={sending} activeOpacity={0.85} style={s.nextChapterBtn}>
                  <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.nextChapterGrad}>
                    <Text style={s.nextChapterTxt}>다음 챕터로 ▶</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {showTextInput && (
              <View style={s.inputArea}>
                <TextInput
                  ref={inputRef}
                  value={input}
                  onChangeText={setInput}
                  placeholder="메시지를 입력하세요..."
                  placeholderTextColor="#9ca3af"
                  style={s.textInput}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  editable={!sending}
                  showSoftInputOnFocus
                  autoCapitalize="sentences"
                  autoCorrect={false}
                  keyboardType="default"
                  textContentType="none"
                  importantForAutofill="no"
                />
                <TouchableOpacity onPress={handleSend} disabled={!input.trim() || sending} style={s.sendBtnWrap}>
                  <LinearGradient
                    colors={input.trim() ? ['#ec4899', '#0ea5e9'] : ['#d1d5db', '#d1d5db']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={s.sendBtn}
                  >
                    <Send size={18} color="#fff" strokeWidth={2} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {activeQuest && (
              <View style={s.questCompleteArea}>
                <TouchableOpacity onPress={handleQuestComplete} disabled={completingQuest} activeOpacity={0.85} style={s.questCompleteWrap}>
                  <LinearGradient colors={['#facc15', '#ec4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.questCompleteBtn}>
                    {completingQuest
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={s.questCompleteTxt}>💪 퀘스트 완료하기</Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {isStoryCompleted && (
              <View style={s.nextChapterArea}>
                <Text style={s.completedTxt}>스토리 완료 🎉</Text>
                <TouchableOpacity onPress={confirmRestart} activeOpacity={0.85} style={s.nextChapterBtn}>
                  <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.nextChapterGrad}>
                    <Text style={s.nextChapterTxt}>처음부터 다시하기</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

// ─── 메시지 버블 ──────────────────────────────────────────────────────────────

function MessageBubble({ message, characterImg }: { message: ChatMessage; characterImg: string }) {
  const sparkPulse = usePulseAnimation();
  const starPulse  = usePulseAnimation();
  const newPulse   = usePulseAnimation();

  if (message.role === 'quest') {
    const q = message.questData;
    return (
      <View style={s.questCardWrap}>
        {/* 퀘스트 발생 알림 */}
        <View style={s.announcementWrap}>
          <View style={s.announcement}>
            <View style={s.sparkRow}>
              <Animated.View style={{ opacity: sparkPulse }}>
                <Sparkles size={20} color="#eab308" strokeWidth={2.5} />
              </Animated.View>
              <Text style={s.announcementTitle}>퀘스트 발생!</Text>
              <Animated.View style={{ opacity: sparkPulse }}>
                <Sparkles size={20} color="#eab308" strokeWidth={2.5} />
              </Animated.View>
            </View>
            {q?.mission_text && <Text style={s.announcementSub}>{q.mission_text}</Text>}
          </View>
        </View>

        <View style={s.questCard}>
          <Animated.View style={[s.starRight, { opacity: starPulse }]}>
            <Star size={24} color="#eab308" fill="#eab308" strokeWidth={2} />
          </Animated.View>
          <Animated.View style={[s.starLeft, { opacity: sparkPulse }]}>
            <Star size={20} color="#ec4899" fill="#ec4899" strokeWidth={2} />
          </Animated.View>

          {/* 헤더 — 퀘스트 이름 */}
          <LinearGradient colors={['#facc15', '#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.questCardHeader}>
            <View style={s.questCardHeaderInner}>
              <Trophy size={22} color="#fff" strokeWidth={2.5} />
              <Text style={s.questCardHeaderTitle} numberOfLines={2}>{q?.quest_name ?? '운동 퀘스트'}</Text>
            </View>
            <Text style={s.questCardHeaderSub}>특별 퀘스트</Text>
          </LinearGradient>

          <View style={s.questDetails}>
            {/* 운동 종목 + 목표 배지 */}
            <View style={s.infoBadgeRow}>
              {q?.exercise_name && (
                <View style={s.infoBadgeBlue}>
                  <Flame size={18} color="#075985" strokeWidth={2.5} />
                  <View style={s.infoBadgeText}>
                    <Text style={s.infoBadgeTitleBlue}>운동</Text>
                    <Text style={s.infoBadgeSubBlue}>{q.exercise_name}</Text>
                  </View>
                </View>
              )}
              {q?.target && (
                <View style={s.infoBadgePink}>
                  <Text style={s.infoBadgeTitlePink}>목표</Text>
                  <Text style={s.infoBadgeSubPink}>{q.target}</Text>
                </View>
              )}
            </View>

            {/* 스토리 이유 */}
            {q?.story_reason && (
              <View style={s.storyReasonBox}>
                <Text style={s.storyReasonTxt}>📖 {q.story_reason}</Text>
              </View>
            )}

            {/* 보상 */}
            <View style={s.rewardRow}>
              <View style={s.rewardChip}>
                <Text style={s.rewardChipTxt}>⭐ EXP +200</Text>
              </View>
              <View style={s.rewardChip}>
                <Text style={s.rewardChipTxt}>🪙 Coin +300</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (message.role === 'narration') {
    if (message.sourceKey === 'question_text') {
      return (
        <View style={s.announcementWrap}>
          <View style={s.announcement}>
            <View style={s.sparkRow}>
              <Animated.View style={{ opacity: sparkPulse }}>
                <Sparkles size={20} color="#eab308" strokeWidth={2.5} />
              </Animated.View>
              <Text style={s.announcementTitle}>이벤트 발생!</Text>
              <Animated.View style={{ opacity: sparkPulse }}>
                <Sparkles size={20} color="#eab308" strokeWidth={2.5} />
              </Animated.View>
            </View>
            <Text style={s.announcementSub}>{message.text}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={s.narrationWrap}>
        {message.speaker && <Text style={s.narrationSpeaker}>{message.speaker}</Text>}
        <View style={s.narrationBox}>
          <Text style={s.narrationTxt}>{message.text}</Text>
        </View>
      </View>
    );
  }

  if (message.role === 'system') {
    return (
      <View style={s.systemMsgWrap}>
        <View style={s.systemMsg}>
          <Text style={s.systemMsgTxt}>{message.text}</Text>
        </View>
      </View>
    );
  }

  if (message.role === 'user') {
    return (
      <View style={s.userMsgRow}>
        <View style={s.userBubble}>
          <Text style={s.userMsgTxt}>{message.text}</Text>
        </View>
      </View>
    );
  }

  // 'character' — 캐릭터 말풍선 (Screen2 coachMsgBubble 스타일)
  return (
    <View style={s.msgRow}>
      <View style={s.msgAvatar}>
        <ImageWithFallback uri={characterImg} style={s.msgAvatarImg} />
      </View>
      <View style={s.msgBubbleWrap}>
        {message.speaker && <Text style={s.msgSpeaker}>{message.speaker}</Text>}
        <View style={s.msgBubble}>
          <Text style={s.msgTxt}>{message.text}</Text>
        </View>
        {message.time && <Text style={s.msgTime}>{message.time}</Text>}
      </View>
    </View>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  backBtn: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#fff' },
  onlineDot: { position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, backgroundColor: '#4ade80', borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  headerName: { fontWeight: '700', color: '#fff', fontSize: 15 },
  headerSub: { fontSize: 11, color: '#fce7f3' },
  restartBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

chatScroll: { flex: 1 },
  chatContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 12 },

  centerWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  loadingTxt: { fontSize: 13, color: '#9ca3af' },

  // 캐릭터 말풍선 (Screen2 coachMsgBubble 스타일)
  msgRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  msgAvatar: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: '#f9a8d4', flexShrink: 0 },
  msgAvatarImg: { width: '100%', height: '100%' },
  msgBubbleWrap: { flex: 1, gap: 2 },
  msgSpeaker: { fontSize: 11, fontWeight: '700', color: '#be185d', letterSpacing: 0.3 },
  msgBubble: { backgroundColor: '#fff', borderRadius: 16, borderTopLeftRadius: 4, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 2, borderColor: '#fbcfe8', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  msgTxt: { fontSize: 14, color: '#1f2937', lineHeight: 20, fontWeight: '500' },
  msgTime: { fontSize: 10, color: '#9ca3af', marginTop: 2 },

  userMsgRow: { alignItems: 'flex-end' },
  userBubble: { maxWidth: '75%', backgroundColor: '#ec4899', borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10 },
  userMsgTxt: { fontSize: 14, color: '#fff', lineHeight: 21 },

  systemMsgWrap: { alignItems: 'center' },
  systemMsg: { backgroundColor: 'rgba(107,114,128,0.12)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, maxWidth: '85%' },
  systemMsgTxt: { fontSize: 11, color: '#6b7280', fontStyle: 'italic', textAlign: 'center' },

  typingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  typingBubble: { backgroundColor: '#fff', borderRadius: 16, borderTopLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 2, borderColor: '#fbcfe8' },

  // 퀘스트 발표 (Screen2 스타일)
  announcementWrap: { alignItems: 'center' },
  announcement: { backgroundColor: 'rgba(107,114,128,0.2)', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 16, maxWidth: '90%', borderWidth: 2, borderColor: 'rgba(156,163,175,0.3)', gap: 8 },
  sparkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  announcementTitle: { fontSize: 18, fontWeight: '800', color: '#1f2937', fontStyle: 'italic' },
  announcementSub: { fontSize: 14, color: '#4b5563', fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },

  // 나레이션
  narrationWrap: { alignItems: 'center', gap: 4 },
  narrationSpeaker: { fontSize: 11, fontWeight: '700', color: '#6b7280', letterSpacing: 0.5 },
  narrationBox: { backgroundColor: 'rgba(107,114,128,0.15)', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14, maxWidth: '92%', borderWidth: 1, borderColor: 'rgba(156,163,175,0.3)' },
  narrationTxt: { fontSize: 14, color: '#4b5563', fontStyle: 'italic', textAlign: 'center', lineHeight: 22 },

  // 선택지 (Screen2 primary / secondary / tertiary 계층)
  choiceArea: { backgroundColor: '#fff', borderTopWidth: 2, borderTopColor: '#e5e7eb', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 8 },
  choiceWrap: { borderRadius: 12, overflow: 'hidden' },
  choiceDefault: { paddingVertical: 13, backgroundColor: '#fff', borderRadius: 12, borderWidth: 2, borderColor: '#9ca3af', alignItems: 'center', paddingHorizontal: 16 },
  choiceDefaultTxt: { fontSize: 14, fontWeight: '600', color: '#1f2937', textAlign: 'center' },
  choiceSelected: { paddingVertical: 16, paddingHorizontal: 16, alignItems: 'center', borderRadius: 12 },
  choiceSelectedTxt: { color: '#fff', fontWeight: '800', fontSize: 15, textAlign: 'center' },

  // 다음 챕터
  nextChapterArea: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, alignItems: 'center', gap: 8 },
  nextChapterBtn: { width: '100%', borderRadius: 12, overflow: 'hidden' },
  nextChapterGrad: { paddingVertical: 14, alignItems: 'center' },
  nextChapterTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  completedTxt: { fontSize: 16, fontWeight: '700', color: '#1f2937' },

  // 텍스트 입력
  inputArea: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  textInput: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, borderWidth: 1, borderColor: '#d1d5db', color: '#111827', maxHeight: 80 },
  sendBtnWrap: { borderRadius: 20, overflow: 'hidden' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  // 퀘스트 카드
  questCardWrap: { gap: 12 },
  questCard: { backgroundColor: '#fefce8', borderRadius: 20, borderWidth: 3, borderColor: '#facc15', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10, position: 'relative' },
  starRight: { position: 'absolute', top: 50, right: 10, zIndex: 10 },
  starLeft:  { position: 'absolute', top: 54, left: 10, zIndex: 10 },
  questCardHeader: { paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center', gap: 4 },
  questCardHeaderInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  questCardHeaderTitle: { color: '#fff', fontWeight: '800', fontSize: 17 },
  questCardHeaderSub: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600' },
  questDetails: { padding: 16, gap: 12 },
  infoBadgeRow: { flexDirection: 'row', gap: 10 },
  infoBadgeBlue: { flex: 1, backgroundColor: '#e0f2fe', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 2, borderColor: '#38bdf8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  infoBadgePink: { flex: 1, backgroundColor: '#fce7f3', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 2, borderColor: '#f9a8d4', alignItems: 'center', justifyContent: 'center' },
  infoBadgeText: { alignItems: 'center' },
  infoBadgeTitleBlue: { fontSize: 12, fontWeight: '700', color: '#075985' },
  infoBadgeSubBlue: { fontSize: 11, color: '#0284c7', fontWeight: '600' },
  infoBadgeTitlePink: { fontSize: 12, fontWeight: '700', color: '#9d174d' },
  infoBadgeSubPink: { fontSize: 11, color: '#ec4899', fontWeight: '600' },
  storyReasonBox: { backgroundColor: 'rgba(107,114,128,0.1)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderLeftWidth: 3, borderLeftColor: '#facc15' },
  storyReasonTxt: { fontSize: 13, color: '#4b5563', lineHeight: 20, fontStyle: 'italic' },
  rewardRow: { flexDirection: 'row', gap: 8 },
  rewardChip: { flex: 1, backgroundColor: '#fef9c3', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 2, borderColor: '#facc15' },
  rewardChipTxt: { fontSize: 13, fontWeight: '700', color: '#a16207' },

  // 퀘스트 완료 버튼
  questCompleteArea: { backgroundColor: '#fff', borderTopWidth: 2, borderTopColor: '#facc15', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  questCompleteWrap: { borderRadius: 12, overflow: 'hidden' },
  questCompleteBtn: { paddingVertical: 15, alignItems: 'center', borderRadius: 12 },
  questCompleteTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
