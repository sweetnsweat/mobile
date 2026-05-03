import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Dumbbell, Clock, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { GradientText } from '../components/GradientText';
import { ScreenBackground } from '../components/ScreenBackground';
import { useBounceAnimation } from '../hooks/useBounceAnimation';
import {
  getRecommendations,
  activateRoutine,
  RoutineRecommendationResponse,
} from '../services/RoutineService';

type Props = NativeStackScreenProps<RootStackParamList, 'RoutineSetup'>;

type View = 'choice' | 'recommendations';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
};

const GOAL_LABEL: Record<string, string> = {
  stamina: '체력 향상',
  weight_loss: '다이어트',
  strength: '근력 증가',
  habit: '건강·습관',
  stress_relief: '스트레스 해소',
};

export function RoutineSetupScreen({ navigation, route }: Props) {
  const { todayConditionCompleted } = route.params;
  const [view, setView] = useState<View>('choice');
  const [recommendations, setRecommendations] = useState<RoutineRecommendationResponse[]>([]);
  const [loadingRec, setLoadingRec] = useState(false);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  const b1 = useBounceAnimation(3000);
  const b2 = useBounceAnimation(2500);

  function navigateAfterSetup() {
    if (!todayConditionCompleted) {
      navigation.navigate('Condition');
    } else {
      navigation.navigate('Home');
    }
  }

  async function handleRecommendations() {
    setLoadingRec(true);
    try {
      const data = await getRecommendations();
      setRecommendations(data);
      setView('recommendations');
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '추천 루틴을 불러오지 못했습니다.');
    } finally {
      setLoadingRec(false);
    }
  }

  async function handleActivate(routineId: number) {
    setActivatingId(routineId);
    try {
      await activateRoutine(routineId);
      navigateAfterSetup();
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '루틴 활성화에 실패했습니다.');
    } finally {
      setActivatingId(null);
    }
  }

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <Animated.View style={[s.fStar,     { transform: [{ translateY: b1 }] }]}>
        <Star size={28} color="#f9a8d4" strokeWidth={1.5} />
      </Animated.View>
      <Animated.View style={[s.fDumbbell, { transform: [{ translateY: b2 }] }]}>
        <Dumbbell size={28} color="#7dd3fc" strokeWidth={1.5} />
      </Animated.View>

      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* 헤더 */}
          <View style={s.header}>
            <GradientText colors={['#db2777', '#0284c7']} style={s.appTitle}>sweet & sweat</GradientText>
            <Text style={s.subtitle}>
              {view === 'choice' ? '루틴을 어떻게 시작할까요?' : '추천 루틴을 골라보세요'}
            </Text>
          </View>

          {view === 'choice' ? (
            <ChoiceView
              loadingRec={loadingRec}
              onRecommendations={handleRecommendations}
              onCustom={() => navigation.navigate('Exercise')}
              onSkip={navigateAfterSetup}
            />
          ) : (
            <RecommendationsView
              recommendations={recommendations}
              activatingId={activatingId}
              onBack={() => setView('choice')}
              onActivate={handleActivate}
            />
          )}

        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

// ─── 선택 화면 ────────────────────────────────────────────────────────────────

function ChoiceView({
  loadingRec,
  onRecommendations,
  onCustom,
  onSkip,
}: {
  loadingRec: boolean;
  onRecommendations: () => void;
  onCustom: () => void;
  onSkip: () => void;
}) {
  return (
    <View style={s.card}>
      {/* 추천 루틴 */}
      <TouchableOpacity activeOpacity={0.85} onPress={onRecommendations} disabled={loadingRec} style={s.optionBtn}>
        <LinearGradient colors={['#ec4899', '#f472b6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.optionGrad}>
          <View style={s.optionIcon}>
            {loadingRec
              ? <ActivityIndicator color="#fff" size="small" />
              : <Star size={24} color="#fff" strokeWidth={2} />}
          </View>
          <View style={s.optionText}>
            <Text style={s.optionTitle}>추천 루틴으로 시작하기</Text>
            <Text style={s.optionDesc}>내 온보딩 정보 기반으로 딱 맞는 루틴을 추천해 드려요</Text>
          </View>
          <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>

      {/* 직접 만들기 */}
      <TouchableOpacity activeOpacity={0.85} onPress={onCustom} style={s.optionBtn}>
        <LinearGradient colors={['#0284c7', '#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.optionGrad}>
          <View style={s.optionIcon}>
            <Dumbbell size={24} color="#fff" strokeWidth={2} />
          </View>
          <View style={s.optionText}>
            <Text style={s.optionTitle}>제가 알아서 만들래요</Text>
            <Text style={s.optionDesc}>운동 목록에서 직접 고르고 나만의 루틴을 만들어요</Text>
          </View>
          <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>

      {/* 나중에 */}
      <TouchableOpacity activeOpacity={0.85} onPress={onSkip} style={s.optionBtn}>
        <View style={s.optionGradGray}>
          <View style={[s.optionIcon, { backgroundColor: '#e5e7eb' }]}>
            <Clock size={24} color="#6b7280" strokeWidth={2} />
          </View>
          <View style={s.optionText}>
            <Text style={[s.optionTitle, { color: '#374151' }]}>나중에 할게요</Text>
            <Text style={[s.optionDesc, { color: '#9ca3af' }]}>루틴 없이도 홈에 들어갈 수 있어요</Text>
          </View>
          <ChevronRight size={20} color="#9ca3af" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>

      <Text style={s.hint}>루틴이 없으면 퀘스트 생성 시 안내가 표시될 수 있어요</Text>
    </View>
  );
}

// ─── 추천 루틴 목록 화면 ──────────────────────────────────────────────────────

function RecommendationsView({
  recommendations,
  activatingId,
  onBack,
  onActivate,
}: {
  recommendations: RoutineRecommendationResponse[];
  activatingId: number | null;
  onBack: () => void;
  onActivate: (routineId: number) => void;
}) {
  return (
    <View style={s.card}>
      <TouchableOpacity onPress={onBack} style={s.backRow}>
        <ChevronLeft size={18} color="#ec4899" strokeWidth={2.5} />
        <Text style={s.backTxt}>다시 선택</Text>
      </TouchableOpacity>

      {recommendations.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyTxt}>추천 루틴이 없습니다.</Text>
          <Text style={s.emptyDesc}>온보딩 정보를 확인해주세요.</Text>
        </View>
      ) : (
        recommendations.map((rec) => {
          const { routine } = rec;
          const isActivating = activatingId === routine.id;
          const goals = (routine.goalTypes ?? [])
            .map(g => GOAL_LABEL[g] ?? g)
            .slice(0, 2)
            .join(' · ');

          return (
            <TouchableOpacity
              key={routine.id}
              activeOpacity={0.85}
              onPress={() => onActivate(routine.id)}
              disabled={activatingId !== null}
              style={s.recCard}
            >
              <View style={s.recTop}>
                <View style={s.recMeta}>
                  {routine.difficulty ? (
                    <View style={s.diffBadge}>
                      <Text style={s.diffTxt}>{DIFFICULTY_LABEL[routine.difficulty] ?? routine.difficulty}</Text>
                    </View>
                  ) : null}
                  {routine.weeklyFrequency ? (
                    <Text style={s.recFreq}>주 {routine.weeklyFrequency}회</Text>
                  ) : null}
                  {routine.estimatedMinutes ? (
                    <Text style={s.recFreq}>{routine.estimatedMinutes}분</Text>
                  ) : null}
                </View>
                {isActivating
                  ? <ActivityIndicator color="#ec4899" size="small" />
                  : <CheckCircle size={20} color="#d1d5db" strokeWidth={1.5} />}
              </View>

              <Text style={s.recName}>{routine.name}</Text>
              {routine.description ? <Text style={s.recDesc}>{routine.description}</Text> : null}
              {goals ? <Text style={s.recGoal}>{goals}</Text> : null}

              {rec.reasons.length > 0 && (
                <View style={s.reasonsWrap}>
                  {rec.reasons.slice(0, 2).map((r, i) => (
                    <View key={i} style={s.reasonBadge}>
                      <Text style={s.reasonTxt}>✓ {r}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 32, alignItems: 'center' },

  fStar:     { position: 'absolute', top: 80,    left: 16 },
  fDumbbell: { position: 'absolute', bottom: 160, right: 24 },

  header: { alignItems: 'center', marginBottom: 20, gap: 8 },
  appTitle: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#4b5563', textAlign: 'center' },

  card: {
    width: '100%', maxWidth: 448,
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#fbcfe8',
    padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 10,
  },

  /* 선택지 버튼 */
  optionBtn: { borderRadius: 14, overflow: 'hidden' },
  optionGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, paddingHorizontal: 16, borderRadius: 14,
  },
  optionGradGray: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, paddingHorizontal: 16, borderRadius: 14,
    backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb',
  },
  optionIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  optionText: { flex: 1, gap: 2 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  optionDesc: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },

  hint: { fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: -4 },

  /* 뒤로가기 */
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backTxt: { fontSize: 13, color: '#ec4899', fontWeight: '600' },

  /* 추천 카드 */
  recCard: {
    borderWidth: 2, borderColor: '#f3f4f6', borderRadius: 12,
    padding: 14, gap: 8,
  },
  recTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diffBadge: {
    backgroundColor: '#fdf2f8', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: '#fbcfe8',
  },
  diffTxt: { fontSize: 11, color: '#ec4899', fontWeight: '600' },
  recFreq: { fontSize: 11, color: '#6b7280' },
  recName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  recDesc: { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  recGoal: { fontSize: 11, color: '#0284c7', fontWeight: '500' },
  reasonsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  reasonBadge: {
    backgroundColor: '#f0f9ff', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: '#bae6fd',
  },
  reasonTxt: { fontSize: 10, color: '#0284c7' },

  /* 빈 상태 */
  emptyWrap: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  emptyTxt: { fontSize: 15, fontWeight: '600', color: '#374151' },
  emptyDesc: { fontSize: 13, color: '#9ca3af' },
});
