import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { X, Zap, Trophy, Dumbbell, CheckCircle } from 'lucide-react-native';
import { getTodayQuest, completeQuest, QuestResponse, QuestExercise } from '../services/QuestService';

const SESSION_TYPE_LABEL: Record<string, string> = {
  full_body: '전신',
  upper_body: '상체',
  lower_body: '하체',
  cardio: '유산소',
  core_recovery: '코어&회복',
  cardio_core: '유산소+코어',
  cardio_recovery: '유산소+회복',
  recovery: '회복',
  mobility: '유연성',
};

const QUEST_TYPE_LABEL: Record<string, string> = {
  EXERCISE: '운동',
  CARDIO: '유산소',
  REST: '휴식',
  RECOVERY: '회복',
};

const TARGET_METRIC_LABEL: Record<string, string> = {
  REPS: '회',
  SETS: '세트',
  DURATION_SEC: '초',
};

function formatTarget(metric: string, value: number): string {
  if (metric === 'DURATION_SEC') {
    const m = Math.floor(value / 60);
    const s = value % 60;
    return s > 0 ? `${m}분 ${s}초` : `${m}분`;
  }
  return `${value}${TARGET_METRIC_LABEL[metric] ?? ''}`;
}

function exerciseSetRep(ex: QuestExercise): string {
  const parts: string[] = [];
  if (ex.targetSets) parts.push(`${ex.targetSets}세트`);
  if (ex.targetReps) parts.push(`${ex.targetReps}회`);
  if (ex.targetDurationSec) {
    const m = Math.floor(ex.targetDurationSec / 60);
    const s = ex.targetDurationSec % 60;
    parts.push(s > 0 ? `${m}분 ${s}초` : `${m}분`);
  }
  return parts.join(' × ') || '-';
}

function questEmoji(sessionType: string | null, questType: string): string {
  if (sessionType === 'cardio' || questType === 'CARDIO') return '🏃';
  if (sessionType === 'upper_body') return '💪';
  if (sessionType === 'lower_body') return '🦵';
  if (sessionType === 'core_recovery' || sessionType === 'recovery') return '🧘';
  if (sessionType === 'full_body') return '🔥';
  if (questType === 'REST') return '😴';
  return '⚡';
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onCompleted?: (quest: QuestResponse) => void;
}

export function QuestDetailModal({ visible, onClose, onCompleted }: Props) {
  const [quest, setQuest] = useState<QuestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (visible) loadQuest();
  }, [visible]);

  async function loadQuest() {
    setLoading(true);
    try {
      const q = await getTodayQuest();
      setQuest(q);
    } catch {
      setQuest(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (!quest || quest.completed || completing) return;
    setCompleting(true);
    try {
      const updated = await completeQuest(quest.id);
      setQuest(updated);
      onCompleted?.(updated);
    } catch {
      // ignore
    } finally {
      setCompleting(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={s.sheet}>
          {/* 핸들 */}
          <View style={s.handle} />

          {/* 헤더 */}
          <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
            <Text style={s.headerTitle}>오늘의 퀘스트</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <X size={18} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </LinearGradient>

          {loading ? (
            <View style={s.centerWrap}>
              <ActivityIndicator color="#ec4899" size="large" />
            </View>
          ) : !quest ? (
            <View style={s.centerWrap}>
              <Text style={s.emptyTitle}>퀘스트 없음</Text>
              <Text style={s.emptyDesc}>루틴을 설정하면 오늘의 퀘스트가 생성됩니다.</Text>
            </View>
          ) : (
            <>
              <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 제목 카드 */}
                <View style={s.titleCard}>
                  <LinearGradient colors={['#fce7f3', '#e0f2fe']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.titleCardGrad}>
                    <View style={s.titleRow}>
                      <View style={s.emojiWrap}>
                        <Text style={s.emojiTxt}>{questEmoji(quest.sessionType, quest.questType)}</Text>
                      </View>
                      <View style={s.titleInfo}>
                        <Text style={s.questTitle}>{quest.title}</Text>
                        {quest.description ? <Text style={s.questDesc}>{quest.description}</Text> : null}
                      </View>
                      {quest.completed && <CheckCircle size={28} color="#16a34a" strokeWidth={2} />}
                    </View>
                    {quest.completed && (
                      <View style={s.completedBanner}>
                        <Text style={s.completedBannerTxt}>✓ 오늘 퀘스트를 완료했습니다!</Text>
                      </View>
                    )}
                  </LinearGradient>
                </View>

                {/* 퀘스트 정보 */}
                <View style={s.card}>
                  <View style={s.cardHeader}>
                    <Zap size={14} color="#ec4899" strokeWidth={2.5} />
                    <Text style={s.cardTitle}>퀘스트 정보</Text>
                  </View>
                  <View style={s.infoGrid}>
                    <InfoRow label="유형" value={QUEST_TYPE_LABEL[quest.questType] ?? quest.questType} />
                    {quest.sessionType && <InfoRow label="세션" value={SESSION_TYPE_LABEL[quest.sessionType] ?? quest.sessionType} />}
                    {quest.sessionName && <InfoRow label="세션명" value={quest.sessionName} />}
                    <InfoRow label="목표" value={formatTarget(quest.targetMetric, quest.targetValue)} />
                    <InfoRow label="진행" value={`${quest.progressValue} / ${quest.targetValue}${TARGET_METRIC_LABEL[quest.targetMetric] ?? ''}`} />
                    {quest.conditionScore != null && <InfoRow label="컨디션 점수" value={String(quest.conditionScore)} />}
                    {quest.conditionAdjusted && <InfoRow label="컨디션 보정" value="적용됨" accent />}
                    {quest.routineName && <InfoRow label="루틴" value={quest.routineName} />}
                  </View>
                </View>

                {/* 운동 목록 */}
                {quest.exercises.length > 0 && (
                  <View style={s.card}>
                    <View style={s.cardHeader}>
                      <Dumbbell size={14} color="#ec4899" strokeWidth={2.5} />
                      <Text style={s.cardTitle}>운동 목록</Text>
                    </View>
                    {quest.exercises.map((ex, i) => (
                      <View key={ex.exerciseId} style={[s.exRow, i < quest.exercises.length - 1 && s.exBorder]}>
                        <View style={s.exSeq}>
                          <Text style={s.exSeqTxt}>{ex.seq ?? i + 1}</Text>
                        </View>
                        <View style={s.exInfo}>
                          <Text style={s.exName}>{ex.exerciseName}</Text>
                          <Text style={s.exCat}>{ex.category}</Text>
                        </View>
                        <Text style={s.exSetRep}>{exerciseSetRep(ex)}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 보상 */}
                <View style={s.card}>
                  <View style={s.cardHeader}>
                    <Trophy size={14} color="#ec4899" strokeWidth={2.5} />
                    <Text style={s.cardTitle}>보상</Text>
                  </View>
                  <View style={s.rewardRow}>
                    <LinearGradient colors={['#fef9c3', '#fde68a']} style={s.rewardBadge}>
                      <Text style={s.rewardVal}>+{quest.rewardExp}</Text>
                      <Text style={s.rewardLbl}>EXP ⭐</Text>
                    </LinearGradient>
                    <LinearGradient colors={['#ffedd5', '#fed7aa']} style={s.rewardBadge}>
                      <Text style={[s.rewardVal, { color: '#c2410c' }]}>+{quest.rewardCurrency}</Text>
                      <Text style={[s.rewardLbl, { color: '#ea580c' }]}>골드 🪙</Text>
                    </LinearGradient>
                  </View>
                </View>

                <View style={{ height: 8 }} />
              </ScrollView>

              {/* 완료 버튼 */}
              <View style={s.bottomArea}>
                {quest.completed ? (
                  <View style={s.doneBanner}>
                    <CheckCircle size={18} color="#16a34a" strokeWidth={2.5} />
                    <Text style={s.doneBannerTxt}>완료됨</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={handleComplete} disabled={completing} activeOpacity={0.85} style={s.completeWrap}>
                    <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.completeBtn}>
                      {completing
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={s.completeBtnTxt}>퀘스트 완료</Text>}
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, accent && s.infoValueAccent]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },

  sheet: { backgroundColor: '#f9fafb', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', overflow: 'hidden' },
  handle: { width: 40, height: 4, backgroundColor: '#d1d5db', borderRadius: 99, alignSelf: 'center', marginTop: 10, marginBottom: 4 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#fff' },
  closeBtn: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  centerWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyDesc: { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 32 },

  scroll: {},
  scrollContent: { padding: 16, gap: 14 },

  titleCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#fbcfe8' },
  titleCardGrad: { padding: 18, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  emojiWrap: { width: 52, height: 52, backgroundColor: '#fff', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fbcfe8' },
  emojiTxt: { fontSize: 26 },
  titleInfo: { flex: 1, gap: 4 },
  questTitle: { fontSize: 18, fontWeight: '900', color: '#111827', lineHeight: 24 },
  questDesc: { fontSize: 13, color: '#6b7280', lineHeight: 19 },
  completedBanner: { backgroundColor: 'rgba(22,163,74,0.12)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(22,163,74,0.2)' },
  completedBannerTxt: { fontSize: 13, fontWeight: '700', color: '#16a34a', textAlign: 'center' },

  card: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#f3f4f6', padding: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 },

  infoGrid: { gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 13, color: '#9ca3af', fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '700', color: '#1f2937' },
  infoValueAccent: { color: '#ec4899' },

  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  exBorder: { borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  exSeq: { width: 24, height: 24, backgroundColor: '#fce7f3', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  exSeqTxt: { fontSize: 11, fontWeight: '800', color: '#ec4899' },
  exInfo: { flex: 1 },
  exName: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  exCat: { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginTop: 1 },
  exSetRep: { fontSize: 13, fontWeight: '700', color: '#6b7280' },

  rewardRow: { flexDirection: 'row', gap: 12 },
  rewardBadge: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 2 },
  rewardVal: { fontSize: 22, fontWeight: '900', color: '#92400e' },
  rewardLbl: { fontSize: 11, fontWeight: '700', color: '#ca8a04' },

  bottomArea: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 12 },
  completeWrap: { borderRadius: 16, overflow: 'hidden' },
  completeBtn: { paddingVertical: 16, alignItems: 'center' },
  completeBtnTxt: { fontSize: 16, fontWeight: '800', color: '#fff' },
  doneBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#dcfce7', borderRadius: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#86efac' },
  doneBannerTxt: { fontSize: 15, fontWeight: '800', color: '#16a34a' },
});
