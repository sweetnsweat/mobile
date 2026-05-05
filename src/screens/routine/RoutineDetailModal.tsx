import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { X, CalendarDays, Dumbbell, Clock, CheckCircle, Coffee } from 'lucide-react-native';
import { RoutineItemResponse, TodayRoutineResponse } from '../../services/RoutineService';

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

interface Props {
  visible: boolean;
  routine: TodayRoutineResponse | null;
  onClose: () => void;
}

export function RoutineDetailModal({ visible, routine, onClose }: Props) {
  const hasRoutine = !!routine?.activeRoutineExists;
  const hasTodaySession = !!routine?.routineScheduledToday && !!routine?.session;
  const title = hasTodaySession
    ? routine.session?.sessionName ?? '오늘의 루틴'
    : hasRoutine
      ? '오늘은 쉬는 날'
      : '루틴 설정 필요';

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
          <View style={s.handle} />

          <View style={s.header}>
            <Text style={s.headerTitle}>오늘의 루틴</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <X size={18} color="#4b5563" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {!routine ? (
            <EmptyState
              icon={<Dumbbell size={24} color="#9ca3af" strokeWidth={2.3} />}
              title="루틴 정보를 불러오지 못했습니다"
              desc="잠시 후 다시 확인해주세요."
            />
          ) : (
            <>
              <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={s.titleCard}>
                  <View style={s.titleRow}>
                    <LinearGradient colors={hasTodaySession ? ['#f472b6', '#38bdf8'] : ['#d1d5db', '#9ca3af']} style={s.emojiWrap}>
                      <Text style={s.emojiTxt}>{hasTodaySession ? routineEmoji(routine.session?.sessionType) : hasRoutine ? '☕' : '✨'}</Text>
                    </LinearGradient>
                    <View style={s.titleInfo}>
                      <Text style={s.routineTitle}>{title}</Text>
                      <Text style={s.routineDesc}>{routineDescription(routine)}</Text>
                    </View>
                  </View>
                </View>

                <View style={s.card}>
                  <View style={s.cardHeader}>
                    <CalendarDays size={14} color="#ec4899" strokeWidth={2.5} />
                    <Text style={s.cardTitle}>루틴 정보</Text>
                  </View>
                  <View style={s.infoGrid}>
                    <InfoRow label="날짜" value={`${routine.date} ${routine.dayOfWeekDisplayName}`} />
                    <InfoRow label="활성 루틴" value={hasRoutine ? '있음' : '없음'} accent={hasRoutine} />
                    {routine.routine?.name && <InfoRow label="루틴명" value={routine.routine.name} />}
                    <InfoRow label="오늘 일정" value={hasTodaySession ? '운동 예정' : hasRoutine ? '휴식' : '미설정'} accent={hasTodaySession} />
                    {routine.session?.sessionType && (
                      <InfoRow label="세션 유형" value={SESSION_TYPE_LABEL[routine.session.sessionType] ?? routine.session.sessionType} />
                    )}
                    {routine.session?.estimatedMinutes ? (
                      <InfoRow label="예상 시간" value={`${routine.session.estimatedMinutes}분`} />
                    ) : routine.routine?.estimatedMinutes ? (
                      <InfoRow label="예상 시간" value={`${routine.routine.estimatedMinutes}분`} />
                    ) : null}
                  </View>
                </View>

                {hasTodaySession ? (
                  <View style={s.card}>
                    <View style={s.cardHeader}>
                      <Dumbbell size={14} color="#ec4899" strokeWidth={2.5} />
                      <Text style={s.cardTitle}>운동 목록</Text>
                    </View>
                    {routine.session!.items.map((item, i) => (
                      <View key={item.id} style={[s.exRow, i < routine.session!.items.length - 1 && s.exBorder]}>
                        <View style={s.exSeq}>
                          <Text style={s.exSeqTxt}>{item.seq ?? i + 1}</Text>
                        </View>
                        <View style={s.exInfo}>
                          <Text style={s.exName}>{item.exercise.name}</Text>
                          <Text style={s.exCat}>{item.exercise.category}</Text>
                        </View>
                        <View style={s.exTarget}>
                          <Text style={s.exSetRep}>{formatRoutineItem(item)}</Text>
                          {item.restSec ? <Text style={s.restTxt}>휴식 {item.restSec}초</Text> : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <EmptyState
                    icon={hasRoutine
                      ? <Coffee size={24} color="#9ca3af" strokeWidth={2.3} />
                      : <Dumbbell size={24} color="#9ca3af" strokeWidth={2.3} />}
                    title={hasRoutine ? '오늘 예정된 운동이 없습니다' : '활성 루틴이 없습니다'}
                    desc={hasRoutine ? '회복도 루틴의 일부예요. 내일 다시 이어가면 됩니다.' : '루틴을 설정하면 오늘 해야 할 운동을 보여드려요.'}
                  />
                )}

                {hasTodaySession && (
                  <View style={s.summaryRow}>
                    <SummaryBadge icon={<Dumbbell size={14} color="#0284c7" />} label="운동" value={`${routine.session!.items.length}개`} />
                    <SummaryBadge icon={<Clock size={14} color="#ca8a04" />} label="예상" value={`${routine.session!.estimatedMinutes}분`} />
                    <SummaryBadge icon={<CheckCircle size={14} color="#16a34a" />} label="상태" value="준비됨" />
                  </View>
                )}

                <View style={{ height: 8 }} />
              </ScrollView>

              <View style={s.bottomArea}>
                <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={s.closeAction}>
                  <Text style={s.closeActionTxt}>확인</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function routineEmoji(sessionType?: string | null): string {
  if (sessionType === 'cardio') return '🏃';
  if (sessionType === 'upper_body') return '💪';
  if (sessionType === 'lower_body') return '🦵';
  if (sessionType === 'core_recovery' || sessionType === 'recovery') return '🧘';
  if (sessionType === 'full_body') return '🏋️';
  return '✨';
}

function routineDescription(routine: TodayRoutineResponse): string {
  if (!routine.activeRoutineExists) return '먼저 루틴을 설정하면 오늘 일정이 자동으로 표시됩니다.';
  if (!routine.routineScheduledToday) return `${routine.dayOfWeekDisplayName}은 루틴이 비어 있는 날입니다.`;

  const routineName = routine.routine?.name;
  const count = routine.session?.items.length ?? 0;
  const minutes = routine.session?.estimatedMinutes ?? routine.routine?.estimatedMinutes;
  if (routineName && minutes) return `${routineName} · ${count}개 운동 · ${minutes}분`;
  if (routineName) return `${routineName} · ${count}개 운동`;
  return `${count}개 운동`;
}

function formatRoutineItem(item: RoutineItemResponse): string {
  const parts: string[] = [];
  if (item.sets) parts.push(`${item.sets}세트`);
  if (item.reps) parts.push(`${item.reps}회`);
  if (item.durationSec) {
    const m = Math.floor(item.durationSec / 60);
    const sec = item.durationSec % 60;
    parts.push(sec > 0 ? `${m}분 ${sec}초` : `${m}분`);
  }
  return parts.join(' × ') || '-';
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, accent && s.infoValueAccent]}>{value}</Text>
    </View>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <View style={s.emptyWrap}>
      <View style={s.emptyIcon}>{icon}</View>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.emptyDesc}>{desc}</Text>
    </View>
  );
}

function SummaryBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={s.summaryBadge}>
      {icon}
      <Text style={s.summaryLabel}>{label}</Text>
      <Text style={s.summaryVal}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.45)' },

  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', overflow: 'hidden' },
  handle: { width: 40, height: 4, backgroundColor: '#d1d5db', borderRadius: 99, alignSelf: 'center', marginTop: 10, marginBottom: 4 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', backgroundColor: '#fff' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#111827' },
  closeBtn: { width: 32, height: 32, backgroundColor: '#f9fafb', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f3f4f6' },

  scroll: {},
  scrollContent: { padding: 16, gap: 14, backgroundColor: '#fff' },

  titleCard: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#f3f4f6', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emojiWrap: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emojiTxt: { fontSize: 26 },
  titleInfo: { flex: 1, gap: 4 },
  routineTitle: { fontSize: 18, fontWeight: '900', color: '#111827', lineHeight: 24 },
  routineDesc: { fontSize: 13, color: '#6b7280', lineHeight: 19 },

  card: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#f3f4f6', padding: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#374151', textTransform: 'uppercase' },

  infoGrid: { gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  infoLabel: { fontSize: 13, color: '#9ca3af', fontWeight: '600' },
  infoValue: { flex: 1, textAlign: 'right', fontSize: 13, fontWeight: '700', color: '#1f2937' },
  infoValueAccent: { color: '#ec4899' },

  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  exBorder: { borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  exSeq: { width: 24, height: 24, backgroundColor: '#fce7f3', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  exSeqTxt: { fontSize: 11, fontWeight: '800', color: '#ec4899' },
  exInfo: { flex: 1 },
  exName: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  exCat: { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginTop: 1 },
  exTarget: { alignItems: 'flex-end', gap: 2 },
  exSetRep: { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  restTxt: { fontSize: 10, fontWeight: '600', color: '#9ca3af' },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36, paddingHorizontal: 18, gap: 8, backgroundColor: '#fff' },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: '#374151', textAlign: 'center' },
  emptyDesc: { fontSize: 13, color: '#9ca3af', textAlign: 'center', lineHeight: 18 },

  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryBadge: { flex: 1, alignItems: 'center', gap: 3, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#f3f4f6', paddingVertical: 12 },
  summaryLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af' },
  summaryVal: { fontSize: 13, fontWeight: '900', color: '#374151' },

  bottomArea: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 12 },
  closeAction: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', backgroundColor: '#111827' },
  closeActionTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
