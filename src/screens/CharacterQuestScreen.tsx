import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, RotateCcw } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { ScreenBackground } from '../components/ScreenBackground';
import {
  playStory,
  chooseStory,
  nextChapter,
  extractStoryText,
  extractChoices,
  StoryPlayResponse,
  StoryChoice,
} from '../services/StoryService';

type Props = NativeStackScreenProps<RootStackParamList, 'CharacterQuest'>;

// scenario_id → 캐릭터 정보 매핑 (DB scenarios 3개 기준)
const SCENARIO_META: Record<number, { name: string; sub: string; img: string }> = {
  1: { name: '민수 선배', sub: '체대생 · 온라인', img: 'https://i.imgur.com/ub32dOr.png' },
  2: { name: '칼라일',    sub: '황제 · 강림',    img: 'https://i.imgur.com/83q0Fz8.jpeg' },
  3: { name: '라이벌 하준', sub: '도전자 · 대기',  img: 'https://i.imgur.com/Zl9DFkK.jpeg' },
};
const DEFAULT_META = SCENARIO_META[1];

// ─── 타입 ─────────────────────────────────────────────────────────────────────

type Role = 'character' | 'narration' | 'user' | 'system';

interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  speaker?: string;
}

let _msgId = 0;
function msgId() { return String(++_msgId); }

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
  const scenario_id = route.params?.scenario_id ?? 1;
  const meta = SCENARIO_META[scenario_id] ?? DEFAULT_META;

  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [choices,   setChoices]   = useState<StoryChoice[]>([]);
  const [storyData, setStoryData] = useState<StoryPlayResponse | null>(null);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  // ── 초기 로드 ──────────────────────────────────────────────────────────────

  useEffect(() => {
    loadStory(false);
  }, [scenario_id]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // ── API 호출 공통 처리 ────────────────────────────────────────────────────

  function applyResponse(data: StoryPlayResponse) {
    console.log('[StoryAPI] response:', JSON.stringify(data, null, 2));
    setStoryData(data);
    const storyText = extractStoryText(data);
    const newChoices = extractChoices(data);

    const speaker = typeof data.speaker === 'string' ? data.speaker : undefined;

    if (storyText) {
      pushMessage(storyText.type === 'dialogue' ? 'character' : 'narration', storyText.text, speaker);
    } else if (data.phase) {
      pushMessage('system', `[${phaseLabel(data.phase)}${data.chapter_num ? ` · 챕터 ${data.chapter_num}` : ''}${data.unit_index != null ? ` · ${data.unit_index + 1}/${data.total_units}` : ''}]`);
    }

    setChoices(newChoices);

    // 챕터 완료 안내
    if (data.is_chapter_completed && !data.is_story_completed) {
      pushMessage('system', '이 챕터가 완료되었습니다. 다음 챕터로 이동할 수 있습니다.');
    }
    if (data.is_story_completed) {
      pushMessage('system', '스토리가 완료되었습니다.');
    }
  }

  function pushMessage(role: Role, text: string, speaker?: string) {
    setMessages(prev => [...prev, { id: msgId(), role, text, speaker }]);
  }

  // ── 스토리 시작/이어가기 ──────────────────────────────────────────────────

  async function loadStory(restart: boolean) {
    setLoading(true);
    if (restart) {
      setMessages([]);
      setChoices([]);
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

  async function handleChoice(choice: StoryChoice) {
    pushMessage('user', choice.text);
    setChoices([]);
    setSending(true);
    try {
      const data = await chooseStory({ scenario_id, choice_id: choice.id });
      applyResponse(data);
    } catch (e: any) {
      pushMessage('system', `오류: ${e?.message ?? '선택을 처리할 수 없습니다.'}`);
    } finally {
      setSending(false);
    }
  }

  // ── 다음 챕터 ────────────────────────────────────────────────────────────

  async function handleNextChapter() {
    setSending(true);
    try {
      const data = await nextChapter({ scenario_id });
      applyResponse(data);
    } catch (e: any) {
      pushMessage('system', `오류: ${e?.message ?? '다음 챕터로 이동할 수 없습니다.'}`);
    } finally {
      setSending(false);
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
  const showTextInput      = !hasChoices && !isChapterCompleted && !isStoryCompleted;

  // ── 렌더 ─────────────────────────────────────────────────────────────────

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>

        {/* 헤더 */}
        <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ChevronLeft size={16} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <View style={s.avatarWrap}>
              <ImageWithFallback uri={meta.img} style={s.avatarImg} />
              <View style={s.onlineDot} />
            </View>
            <View>
              <Text style={s.headerName}>{meta.name}</Text>
              <Text style={s.headerSub}>{meta.sub}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={confirmRestart} style={s.restartBtn}>
            <RotateCcw size={16} color="rgba(255,255,255,0.85)" strokeWidth={2} />
          </TouchableOpacity>
        </LinearGradient>

        {/* 챕터 진행 바 */}
        {storyData?.unit_index != null && storyData.total_units != null && (
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${((storyData.unit_index + 1) / storyData.total_units) * 100}%` as any }]} />
            <Text style={s.progressTxt}>
              {phaseLabel(storyData.phase)}{storyData.chapter_num ? ` · 챕터 ${storyData.chapter_num}` : ''} · {storyData.unit_index + 1}/{storyData.total_units}
            </Text>
          </View>
        )}

        {/* 채팅 */}
        <ScrollView
          ref={scrollRef}
          style={s.chatScroll}
          contentContainerStyle={s.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={s.centerWrap}>
              <ActivityIndicator color="#ec4899" size="large" />
              <Text style={s.loadingTxt}>스토리를 불러오는 중...</Text>
            </View>
          ) : (
            messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} characterImg={meta.img} />
            ))
          )}
          {sending && (
            <View style={s.typingRow}>
              <View style={s.msgAvatar}>
                <ImageWithFallback uri={meta.img} style={s.msgAvatarImg} />
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
                {choices.map(choice => (
                  <TouchableOpacity
                    key={choice.id}
                    onPress={() => handleChoice(choice)}
                    disabled={sending}
                    activeOpacity={0.85}
                    style={s.choiceBtn}
                  >
                    <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.choiceGrad}>
                      <Text style={s.choiceTxt}>{choice.text}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
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
                  value={input}
                  onChangeText={setInput}
                  placeholder="메시지를 입력하세요..."
                  placeholderTextColor="#9ca3af"
                  style={s.textInput}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  editable={!sending}
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

      </SafeAreaView>
    </ScreenBackground>
  );
}

// ─── 메시지 버블 ──────────────────────────────────────────────────────────────

function MessageBubble({ message, characterImg }: { message: ChatMessage; characterImg: string }) {
  if (message.role === 'narration') {
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

  // 'character' — 말풍선
  return (
    <View style={s.msgRow}>
      <View style={s.msgAvatar}>
        <ImageWithFallback uri={characterImg} style={s.msgAvatarImg} />
      </View>
      <View style={s.msgBubble}>
        <Text style={s.msgTxt}>{message.text}</Text>
      </View>
    </View>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  backBtn: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#fff' },
  onlineDot: { position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, backgroundColor: '#4ade80', borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  headerName: { fontWeight: '700', color: '#fff', fontSize: 15 },
  headerSub: { fontSize: 11, color: '#fce7f3' },
  restartBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  progressBar: { height: 28, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', justifyContent: 'center', overflow: 'hidden' },
  progressFill: { position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: '#fce7f3' },
  progressTxt: { fontSize: 10, color: '#6b7280', fontWeight: '600', textAlign: 'center', zIndex: 1 },

  chatScroll: { flex: 1 },
  chatContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 12 },

  centerWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  loadingTxt: { fontSize: 13, color: '#9ca3af' },

  msgRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  msgAvatar: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', borderWidth: 1.5, borderColor: '#f9a8d4', flexShrink: 0 },
  msgAvatarImg: { width: '100%', height: '100%' },
  msgBubble: { flex: 1, backgroundColor: '#fff', borderRadius: 16, borderTopLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  msgTxt: { fontSize: 14, color: '#1f2937', lineHeight: 21 },

  userMsgRow: { alignItems: 'flex-end' },
  userBubble: { maxWidth: '75%', backgroundColor: '#ec4899', borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10 },
  userMsgTxt: { fontSize: 14, color: '#fff', lineHeight: 21 },

  systemMsgWrap: { alignItems: 'center' },
  systemMsg: { backgroundColor: 'rgba(107,114,128,0.12)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, maxWidth: '85%' },
  systemMsgTxt: { fontSize: 11, color: '#6b7280', fontStyle: 'italic', textAlign: 'center' },

  typingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  typingBubble: { backgroundColor: '#fff', borderRadius: 16, borderTopLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#e5e7eb' },

  // 선택지
  choiceArea: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, gap: 8 },
  choiceBtn: { borderRadius: 12, overflow: 'hidden' },
  choiceGrad: { paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  choiceTxt: { color: '#fff', fontWeight: '600', fontSize: 14, textAlign: 'center' },

  // 다음 챕터
  nextChapterArea: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, alignItems: 'center', gap: 8 },
  nextChapterBtn: { width: '100%', borderRadius: 12, overflow: 'hidden' },
  nextChapterGrad: { paddingVertical: 14, alignItems: 'center' },
  nextChapterTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  completedTxt: { fontSize: 16, fontWeight: '700', color: '#1f2937' },

  // 나레이션
  narrationWrap: { alignItems: 'center', gap: 4 },
  narrationSpeaker: { fontSize: 11, fontWeight: '700', color: '#6b7280', letterSpacing: 0.5 },
  narrationBox: { backgroundColor: 'rgba(107,114,128,0.15)', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14, maxWidth: '92%', borderWidth: 1, borderColor: 'rgba(156,163,175,0.3)' },
  narrationTxt: { fontSize: 14, color: '#4b5563', fontStyle: 'italic', textAlign: 'center', lineHeight: 22 },

  // 텍스트 입력
  inputArea: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  textInput: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, borderWidth: 1, borderColor: '#d1d5db', color: '#111827', maxHeight: 80 },
  sendBtnWrap: { borderRadius: 20, overflow: 'hidden' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
