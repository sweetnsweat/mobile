import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2, CheckCircle } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenBackground } from '../components/ScreenBackground';
import { getFavoriteExercises, ExerciseListItem } from '../services/ExerciseService';
import { createCustomRoutine } from '../services/RoutineService';
import { getMyProfile } from '../services/UserService';

type Props = NativeStackScreenProps<RootStackParamList, 'RoutineCreate'>;

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const DAY_OPTIONS = [
  { value: 'MONDAY',    label: '월' },
  { value: 'TUESDAY',   label: '화' },
  { value: 'WEDNESDAY', label: '수' },
  { value: 'THURSDAY',  label: '목' },
  { value: 'FRIDAY',    label: '금' },
  { value: 'SATURDAY',  label: '토' },
  { value: 'SUNDAY',    label: '일' },
];

const DAY_NAME: Record<string, string> = {
  MONDAY: '월요일', TUESDAY: '화요일', WEDNESDAY: '수요일',
  THURSDAY: '목요일', FRIDAY: '금요일', SATURDAY: '토요일', SUNDAY: '일요일',
};

const SESSION_TYPES = [
  { value: 'full_body',        label: '전신' },
  { value: 'upper_body',       label: '상체' },
  { value: 'lower_body',       label: '하체' },
  { value: 'cardio',           label: '유산소' },
  { value: 'core_recovery',    label: '코어/회복' },
  { value: 'cardio_core',      label: '유산소/코어' },
  { value: 'cardio_recovery',  label: '유산소/회복' },
  { value: 'recovery',         label: '회복' },
  { value: 'mobility',         label: '가동성' },
];

// ─── 타입 ─────────────────────────────────────────────────────────────────────

type ExerciseDraft = {
  key: string;
  exerciseId: number;
  name: string;
  emoji: string;
  sets: string;
  reps: string;
  restSec: string;
};

type SessionDraft = {
  key: string;
  dayOfWeek: string;
  sessionName: string;
  sessionType: string;
  estimatedMinutes: string;
  exercises: ExerciseDraft[];
};

let _key = 0;
function nextKey() { return String(++_key); }

function defaultSession(): SessionDraft {
  return {
    key: nextKey(),
    dayOfWeek: 'MONDAY',
    sessionName: '월요일 세션',
    sessionType: 'full_body',
    estimatedMinutes: '40',
    exercises: [],
  };
}

// ─── 메인 화면 ────────────────────────────────────────────────────────────────

export function RoutineCreateScreen({ navigation }: Props) {
  const [routineName, setRoutineName] = useState('');
  const [sessions, setSessions]       = useState<SessionDraft[]>([defaultSession()]);
  const [saving, setSaving]           = useState(false);

  const [favorites, setFavorites]         = useState<ExerciseListItem[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getFavoriteExercises({ size: 100 })
      .then(data => {
        if (!mounted) return;
        setFavorites((data?.groups ?? []).flatMap(g => g.exercises ?? []));
      })
      .catch(() => { if (mounted) setFavorites([]); })
      .finally(() => { if (mounted) setFavoritesLoading(false); });
    return () => { mounted = false; };
  }, []);

  // ── 세션 조작 ──────────────────────────────────────────────────────────────

  function addSession() {
    setSessions(prev => [...prev, defaultSession()]);
  }

  function removeSession(key: string) {
    setSessions(prev => prev.filter(s => s.key !== key));
  }

  function updateSession(key: string, patch: Partial<SessionDraft>) {
    setSessions(prev => prev.map(s => s.key === key ? { ...s, ...patch } : s));
  }

  function updateExercise(sessionKey: string, exKey: string, patch: Partial<ExerciseDraft>) {
    setSessions(prev => prev.map(s => {
      if (s.key !== sessionKey) return s;
      return { ...s, exercises: s.exercises.map(e => e.key === exKey ? { ...e, ...patch } : e) };
    }));
  }

  function removeExercise(sessionKey: string, exKey: string) {
    setSessions(prev => prev.map(s => {
      if (s.key !== sessionKey) return s;
      return { ...s, exercises: s.exercises.filter(e => e.key !== exKey) };
    }));
  }

  function toggleExercise(sessionKey: string, ex: ExerciseListItem) {
    setSessions(prev => prev.map(s => {
      if (s.key !== sessionKey) return s;
      const already = s.exercises.some(e => e.exerciseId === ex.id);
      if (already) return s;
      return {
        ...s,
        exercises: [...s.exercises, {
          key: nextKey(),
          exerciseId: ex.id,
          name: ex.name,
          emoji: ex.emoji,
          sets: '3',
          reps: '12',
          restSec: '60',
        }],
      };
    }));
  }

  // ── 제출 ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!routineName.trim()) {
      Alert.alert('알림', '루틴 이름을 입력해주세요.');
      return;
    }
    if (sessions.length === 0) {
      Alert.alert('알림', '세션을 하나 이상 추가해주세요.');
      return;
    }
    for (const s of sessions) {
      if (s.exercises.length === 0) {
        Alert.alert('알림', `${DAY_NAME[s.dayOfWeek]} 세션에 운동을 하나 이상 추가해주세요.`);
        return;
      }
    }

    setSaving(true);
    try {
      await createCustomRoutine({
        name: routineName.trim(),
        activate: true,
        sessions: sessions.map(s => ({
          dayOfWeek: s.dayOfWeek,
          sessionName: s.sessionName.trim() || `${DAY_NAME[s.dayOfWeek]} 세션`,
          sessionType: s.sessionType || undefined,
          estimatedMinutes: parseInt(s.estimatedMinutes, 10) || undefined,
          items: s.exercises.map(e => ({
            exerciseId: e.exerciseId,
            sets:    parseInt(e.sets, 10)    || undefined,
            reps:    parseInt(e.reps, 10)    || undefined,
            restSec: parseInt(e.restSec, 10) || undefined,
          })),
        })),
      });

      const profile = await getMyProfile();
      if (!profile.todayConditionCompleted) {
        navigation.navigate('Condition');
      } else {
        navigation.navigate('Home');
      }
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '루틴 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  // ── 렌더 ──────────────────────────────────────────────────────────────────

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>

        {/* 헤더 */}
        <LinearGradient colors={['#ec4899', '#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ChevronLeft size={16} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>루틴 만들기</Text>
          <View style={{ width: 32 }} />
        </LinearGradient>

        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* 루틴 이름 */}
          <View style={s.card}>
            <Text style={s.cardLabel}>루틴 이름 *</Text>
            <TextInput
              value={routineName}
              onChangeText={setRoutineName}
              placeholder="예: 나만의 주 3회 루틴"
              placeholderTextColor="#9ca3af"
              style={s.nameInput}
              maxLength={50}
            />
          </View>

          {/* 세션 목록 */}
          {sessions.map((session, idx) => (
            <SessionCard
              key={session.key}
              session={session}
              index={idx}
              canRemove={sessions.length > 1}
              favorites={favorites}
              favoritesLoading={favoritesLoading}
              onUpdate={patch => updateSession(session.key, patch)}
              onRemove={() => removeSession(session.key)}
              onUpdateExercise={(ek, patch) => updateExercise(session.key, ek, patch)}
              onRemoveExercise={ek => removeExercise(session.key, ek)}
              onToggleFavorite={ex => toggleExercise(session.key, ex)}
            />
          ))}

          {/* 세션 추가 */}
          <TouchableOpacity onPress={addSession} style={s.addSessionBtn} activeOpacity={0.85}>
            <Text style={s.addSessionTxt}>+ 세션 추가</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* 저장 버튼 */}
        <View style={s.footer}>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={s.saveBtn} activeOpacity={0.85}>
            <LinearGradient colors={['#ec4899', '#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveGrad}>
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.saveTxt}>루틴 저장하기</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </ScreenBackground>
  );
}

// ─── 세션 카드 ────────────────────────────────────────────────────────────────

type SessionCardProps = {
  session: SessionDraft;
  index: number;
  canRemove: boolean;
  favorites: ExerciseListItem[];
  favoritesLoading: boolean;
  onUpdate: (patch: Partial<SessionDraft>) => void;
  onRemove: () => void;
  onUpdateExercise: (key: string, patch: Partial<ExerciseDraft>) => void;
  onRemoveExercise: (key: string) => void;
  onToggleFavorite: (ex: ExerciseListItem) => void;
};

function SessionCard({
  session, index, canRemove,
  favorites, favoritesLoading,
  onUpdate, onRemove,
  onUpdateExercise, onRemoveExercise, onToggleFavorite,
}: SessionCardProps) {
  return (
    <View style={s.card}>
      {/* 세션 헤더 */}
      <View style={s.sessionHeader}>
        <LinearGradient colors={['#f472b6', '#38bdf8']} style={s.sessionNum}>
          <Text style={s.sessionNumTxt}>{index + 1}</Text>
        </LinearGradient>
        <Text style={s.cardLabel}>세션 {index + 1}</Text>
        {canRemove && (
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={15} color="#ef4444" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {/* 요일 선택 */}
      <Text style={s.fieldLabel}>요일</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayRow}>
        {DAY_OPTIONS.map(day => {
          const active = session.dayOfWeek === day.value;
          return (
            <TouchableOpacity
              key={day.value}
              onPress={() => onUpdate({
                dayOfWeek: day.value,
                sessionName: `${DAY_NAME[day.value]} 세션`,
              })}
              style={[s.dayBtn, active && s.dayBtnActive]}
            >
              <Text style={[s.dayTxt, active && s.dayTxtActive]}>{day.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 세션명 입력 */}
      <Text style={s.fieldLabel}>세션 이름</Text>
      <TextInput
        value={session.sessionName}
        onChangeText={v => onUpdate({ sessionName: v })}
        placeholder="예: 월요일 전신"
        placeholderTextColor="#9ca3af"
        style={s.fieldInput}
      />

      {/* 세션 유형 */}
      <Text style={s.fieldLabel}>유형</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayRow}>
        {SESSION_TYPES.map(t => {
          const active = session.sessionType === t.value;
          return (
            <TouchableOpacity
              key={t.value}
              onPress={() => onUpdate({ sessionType: t.value })}
              style={[s.typeBtn, active && s.typeBtnActive]}
            >
              <Text style={[s.typeTxt, active && s.typeTxtActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 예상 시간 */}
      <Text style={s.fieldLabel}>예상 시간 (분)</Text>
      <TextInput
        value={session.estimatedMinutes}
        onChangeText={v => onUpdate({ estimatedMinutes: v.replace(/[^0-9]/g, '') })}
        placeholder="40"
        placeholderTextColor="#9ca3af"
        keyboardType="number-pad"
        style={[s.fieldInput, { width: 100 }]}
      />

      {/* 즐겨찾기 운동 목록 */}
      <Text style={s.fieldLabel}>즐겨찾기 운동</Text>
      {favoritesLoading ? (
        <ActivityIndicator color="#ec4899" style={{ marginVertical: 8 }} />
      ) : favorites.length === 0 ? (
        <Text style={s.favEmpty}>즐겨찾기한 운동이 없어요</Text>
      ) : (
        <View style={s.favList}>
          {favorites.map(ex => {
            const added = session.exercises.some(e => e.exerciseId === ex.id);
            return (
              <TouchableOpacity
                key={String(ex.id)}
                onPress={() => { if (!added) onToggleFavorite(ex); }}
                style={[s.favRow, added && s.favRowAdded]}
                activeOpacity={added ? 1 : 0.7}
              >
                <Text style={s.favEmoji}>{ex.emoji}</Text>
                <View style={s.favInfo}>
                  <Text style={s.favName}>{ex.name}</Text>
                  <Text style={s.favMeta}>{ex.levelDisplayName} · {ex.categoryDisplayName}</Text>
                </View>
                {added && <CheckCircle size={16} color="#ec4899" strokeWidth={2} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* 추가된 운동 목록 */}
      {session.exercises.length > 0 && (
        <View style={s.exerciseList}>
          <Text style={s.fieldLabel}>추가된 운동</Text>
          {session.exercises.map(ex => (
            <ExerciseRow
              key={ex.key}
              exercise={ex}
              onUpdate={patch => onUpdateExercise(ex.key, patch)}
              onRemove={() => onRemoveExercise(ex.key)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── 운동 행 ──────────────────────────────────────────────────────────────────

type ExerciseRowProps = {
  exercise: ExerciseDraft;
  onUpdate: (patch: Partial<ExerciseDraft>) => void;
  onRemove: () => void;
};

function ExerciseRow({ exercise, onUpdate, onRemove }: ExerciseRowProps) {
  return (
    <View style={s.exRow}>
      <View style={s.exTop}>
        <Text style={s.exEmoji}>{exercise.emoji}</Text>
        <Text style={s.exName} numberOfLines={1}>{exercise.name}</Text>
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Trash2 size={13} color="#ef4444" strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <View style={s.exInputRow}>
        <View style={s.exInputWrap}>
          <Text style={s.exInputLabel}>세트</Text>
          <TextInput
            value={exercise.sets}
            onChangeText={v => onUpdate({ sets: v.replace(/[^0-9]/g, '') })}
            keyboardType="number-pad"
            style={s.exInput}
            maxLength={3}
          />
        </View>
        <View style={s.exInputWrap}>
          <Text style={s.exInputLabel}>횟수</Text>
          <TextInput
            value={exercise.reps}
            onChangeText={v => onUpdate({ reps: v.replace(/[^0-9]/g, '') })}
            keyboardType="number-pad"
            style={s.exInput}
            maxLength={4}
          />
        </View>
        <View style={s.exInputWrap}>
          <Text style={s.exInputLabel}>휴식(초)</Text>
          <TextInput
            value={exercise.restSec}
            onChangeText={v => onUpdate({ restSec: v.replace(/[^0-9]/g, '') })}
            keyboardType="number-pad"
            style={s.exInput}
            maxLength={4}
          />
        </View>
      </View>
    </View>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 },
  backBtn: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },

  card: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#fbcfe8',
    padding: 16, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },

  nameInput: {
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: '#1f2937', backgroundColor: '#f9fafb',
  },

  // 세션
  sessionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sessionNumTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },

  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginBottom: -4 },
  fieldInput: {
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 13, color: '#1f2937', backgroundColor: '#f9fafb',
  },

  dayRow: { flexDirection: 'row', gap: 6 },
  dayBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#f9fafb',
  },
  dayBtnActive: { borderColor: '#ec4899', backgroundColor: '#fdf2f8' },
  dayTxt: { fontSize: 12, fontWeight: '600', color: '#9ca3af' },
  dayTxtActive: { color: '#ec4899' },

  typeBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#f9fafb',
  },
  typeBtnActive: { borderColor: '#0284c7', backgroundColor: '#f0f9ff' },
  typeTxt: { fontSize: 11, fontWeight: '600', color: '#9ca3af' },
  typeTxtActive: { color: '#0284c7' },

  // 즐겨찾기 목록
  favList: { gap: 4 },
  favEmpty: { fontSize: 12, color: '#9ca3af', textAlign: 'center', paddingVertical: 8 },
  favRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#f9fafb',
  },
  favRowAdded: { borderColor: '#fbcfe8', backgroundColor: '#fdf2f8' },
  favEmoji: { fontSize: 20 },
  favInfo: { flex: 1 },
  favName: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
  favMeta: { fontSize: 10, color: '#9ca3af', marginTop: 1 },

  // 운동
  exerciseList: { gap: 8 },
  exRow: {
    borderWidth: 1.5, borderColor: '#f3f4f6', borderRadius: 10,
    padding: 10, gap: 8,
  },
  exTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exEmoji: { fontSize: 18 },
  exName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1f2937' },
  exInputRow: { flexDirection: 'row', gap: 8 },
  exInputWrap: { flex: 1, alignItems: 'center', gap: 3 },
  exInputLabel: { fontSize: 9, color: '#9ca3af', fontWeight: '500' },
  exInput: {
    width: '100%', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 8,
    paddingVertical: 5, paddingHorizontal: 8,
    fontSize: 13, color: '#1f2937', textAlign: 'center', backgroundColor: '#f9fafb',
  },

  addSessionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#fbcfe8',
    backgroundColor: '#fff',
  },
  addSessionTxt: { fontSize: 14, color: '#ec4899', fontWeight: '600' },

  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  saveBtn: { borderRadius: 12, overflow: 'hidden' },
  saveGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  saveTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
