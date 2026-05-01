import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, StatusBar, Alert, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Heart, Zap, Brain, UserCheck, TrendingUp } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { GradientText } from '../components/GradientText';
import { ScreenBackground } from '../components/ScreenBackground';
import { useBounceAnimation } from '../hooks/useBounceAnimation';
import { saveOnboardingProfile, getMyProfile } from '../services/UserService';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

// ─── Wheel Picker ────────────────────────────────────────────────────────────
const ITEM_H = 44;
const VISIBLE = 5;
const PAD = ITEM_H * Math.floor(VISIBLE / 2);

interface WheelPickerProps {
  items: string[];
  initialIndex?: number;
  onChange: (index: number) => void;
}

function WheelPicker({ items, initialIndex = 0, onChange }: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIdx, setActiveIdx] = useState(initialIndex);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: initialIndex * ITEM_H, animated: false });
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const onScrollEnd = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.max(0, Math.min(Math.round(y / ITEM_H), items.length - 1));
    setActiveIdx(idx);
    onChange(idx);
  };

  return (
    <View style={wp.wrap}>
      <View style={wp.highlight} />
      <ScrollView
        ref={scrollRef}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: PAD }}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
      >
        {items.map((item, i) => (
          <View key={i} style={wp.item}>
            <Text style={[wp.txt, activeIdx === i && wp.txtActive]}>{item}</Text>
          </View>
        ))}
      </ScrollView>
      <View pointerEvents="none" style={wp.fadeTop} />
      <View pointerEvents="none" style={wp.fadeBottom} />
    </View>
  );
}

const wp = StyleSheet.create({
  wrap: { height: ITEM_H * VISIBLE, flex: 1, overflow: 'hidden' },
  highlight: {
    position: 'absolute', top: PAD, left: 4, right: 4, height: ITEM_H,
    backgroundColor: '#fdf2f8', borderRadius: 8, borderWidth: 1.5, borderColor: '#fbcfe8',
  },
  item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  txt: { fontSize: 15, color: '#9ca3af', fontWeight: '400' },
  txtActive: { fontSize: 17, color: '#ec4899', fontWeight: '700' },
  fadeTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: PAD,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  fadeBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: PAD,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
});

// ─── 데이터 ─────────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const YEARS  = Array.from({ length: 71 }, (_, i) => String(1940 + i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const DAYS   = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

const DEFAULT_YEAR_IDX  = 50; // 1990
const DEFAULT_MONTH_IDX = 0;
const DEFAULT_DAY_IDX   = 0;

const WEEKLY_FREQ_ITEMS  = Array.from({ length: 7 }, (_, i) => `${i + 1}회`);
const MINUTES_VALUES     = [10, 15, 20, 30, 45, 60, 90, 120];
const MINUTES_ITEMS      = MINUTES_VALUES.map(m => `${m}분`);
const DEFAULT_FREQ_IDX   = 2; // 3회
const DEFAULT_MINUTES_IDX = 4; // 45분

const GENDERS = [
  { value: 'male',              label: '남성',     emoji: '👨' },
  { value: 'female',            label: '여성',     emoji: '👩' },
  { value: 'prefer_not_to_say', label: '선택 안 함', emoji: '🤐' },
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner',     label: '초급', desc: '처음 시작해요',     emoji: '🌱' },
  { value: 'intermediate', label: '중급', desc: '어느 정도 해봤어요', emoji: '💪' },
  { value: 'advanced',     label: '고급', desc: '경험 많아요',       emoji: '🏆' },
];

const EXERCISE_STATUSES = [
  { value: 'none',       label: '없어요',         emoji: '😴' },
  { value: 'occasional', label: '가끔 해요',       emoji: '🚶' },
  { value: 'regular',    label: '정기적으로 해요',  emoji: '💪' },
];

const FITNESS_GOALS = [
  { value: 'stamina',       label: '체력 향상',    emoji: '⚡' },
  { value: 'weight_loss',   label: '다이어트',     emoji: '🔥' },
  { value: 'strength',      label: '근력 증가',    emoji: '🏋️' },
  { value: 'habit',         label: '건강·습관',    emoji: '🌱' },
  { value: 'stress_relief', label: '스트레스 해소', emoji: '🧘' },
];

const WORKOUT_PLACES = [
  { value: 'home',     label: '집',          emoji: '🏠' },
  { value: 'gym',      label: '헬스장',      emoji: '🏋️' },
  { value: 'outdoor',  label: '야외',        emoji: '🌳' },
  { value: 'facility', label: '수영장·시설', emoji: '🏊' },
  { value: 'other',    label: '기타',        emoji: '📍' },
];

const EXERCISE_TYPES = [
  { value: 'strength',    label: '근력 운동',     emoji: '🏋️' },
  { value: 'cardio',      label: '유산소',        emoji: '🏃' },
  { value: 'stretching',  label: '스트레칭',      emoji: '🤸' },
  { value: 'bodyweight',  label: '맨몸 운동',     emoji: '💪' },
  { value: 'walking',     label: '걷기',          emoji: '🚶' },
  { value: 'running',     label: '러닝',          emoji: '🏅' },
  { value: 'swimming',    label: '수영',          emoji: '🏊' },
  { value: 'yoga_pilates',label: '요가·필라테스', emoji: '🧘' },
];

// ─── 화면 ────────────────────────────────────────────────────────────────────
export function OnboardingScreen({ navigation }: Props) {
  const [gender,              setGender]              = useState('');
  const [yearIdx,             setYearIdx]             = useState(DEFAULT_YEAR_IDX);
  const [monthIdx,            setMonthIdx]            = useState(DEFAULT_MONTH_IDX);
  const [dayIdx,              setDayIdx]              = useState(DEFAULT_DAY_IDX);
  const [height,              setHeight]              = useState('');
  const [weight,              setWeight]              = useState('');
  const [experienceLevel,     setExperienceLevel]     = useState('');
  const [exerciseStatus,      setExerciseStatus]      = useState('');
  const [fitnessGoal,         setFitnessGoal]         = useState('');
  const [workoutPlace,        setWorkoutPlace]        = useState('');
  const [weeklyFreqIdx,       setWeeklyFreqIdx]       = useState(DEFAULT_FREQ_IDX);
  const [minutesIdx,          setMinutesIdx]          = useState(DEFAULT_MINUTES_IDX);
  const [exerciseTypes,       setExerciseTypes]       = useState<string[]>([]);
  const [loading,             setLoading]             = useState(false);

  const b1 = useBounceAnimation(3000);
  const b2 = useBounceAnimation(2500);
  const b3 = useBounceAnimation(3200);
  const b4 = useBounceAnimation(2800);

  const toggleExerciseType = (value: string) => {
    setExerciseTypes(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value],
    );
  };

  const handleSubmit = async () => {
    if (!gender) { Alert.alert('알림', '성별을 선택해주세요.'); return; }
    const heightNum = parseFloat(height);
    if (!height || isNaN(heightNum) || heightNum < 50 || heightNum > 250) {
      Alert.alert('알림', '키를 50~250cm 사이로 입력해주세요.'); return;
    }
    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
      Alert.alert('알림', '몸무게를 20~300kg 사이로 입력해주세요.'); return;
    }
    if (!experienceLevel) { Alert.alert('알림', '운동 경험 수준을 선택해주세요.'); return; }
    if (!exerciseStatus)  { Alert.alert('알림', '현재 운동 상태를 선택해주세요.');   return; }
    if (!fitnessGoal)     { Alert.alert('알림', '운동 목표를 선택해주세요.');        return; }
    if (!workoutPlace)    { Alert.alert('알림', '주 운동 장소를 선택해주세요.');      return; }

    const birthDate = `${YEARS[yearIdx]}-${MONTHS[monthIdx]}-${DAYS[dayIdx]}`;

    try {
      setLoading(true);
      await saveOnboardingProfile({
        gender,
        birthDate,
        heightCm: heightNum,
        weightKg: weightNum,
        experienceLevel,
        currentExerciseStatus: exerciseStatus,
        fitnessGoal,
        preferredWorkoutPlace: workoutPlace,
        weeklyWorkoutFrequency: weeklyFreqIdx + 1,
        availableWorkoutMinutes: MINUTES_VALUES[minutesIdx],
        preferredExerciseTypes: exerciseTypes,
      });
      const profile = await getMyProfile();
      if (!profile.todayConditionCompleted) navigation.navigate('Condition');
      else navigation.navigate('Home');
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '프로필 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <Animated.View style={[s.fDumbbell, { transform: [{ translateY: b1 }] }]}><Dumbbell size={32} color="#f9a8d4" strokeWidth={1.5} /></Animated.View>
      <Animated.View style={[s.fHeart,    { transform: [{ translateY: b2 }] }]}><Heart    size={28} color="#7dd3fc" strokeWidth={1.5} /></Animated.View>
      <Animated.View style={[s.fZap,      { transform: [{ translateY: b3 }] }]}><Zap      size={28} color="#f9a8d4" strokeWidth={1.5} /></Animated.View>
      <Animated.View style={[s.fBrain,    { transform: [{ translateY: b4 }] }]}><Brain    size={28} color="#7dd3fc" strokeWidth={1.5} /></Animated.View>

      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView behavior="padding" enabled={Platform.OS === 'ios'} style={s.kav}>
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 헤더 */}
            <View style={s.header}>
              <View style={s.logoRow}>
                <UserCheck size={28} color="#db2777" strokeWidth={2.5} />
                <Dumbbell  size={24} color="#0284c7" strokeWidth={2.5} />
              </View>
              <GradientText colors={['#db2777', '#0284c7']} style={s.appTitle}>sweet & sweat</GradientText>
              <Text style={s.subtitle}>나에 대해 알려주세요</Text>
            </View>

            <View style={s.card}>

              {/* Q1 성별 */}
              <Question num={1} title="성별을 선택해주세요">
                <View style={s.genderRow}>
                  {GENDERS.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setGender(opt.value)}
                      style={[s.genderBtn, gender === opt.value && s.selectedPink]}
                    >
                      <Text style={s.genderEmoji}>{opt.emoji}</Text>
                      <Text style={[s.genderLabel, gender === opt.value && { color: '#ec4899' }]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Question>

              {/* Q2 생년월일 */}
              <Question num={2} title="생년월일을 선택해주세요" divider>
                <View style={s.pickerRow}>
                  <WheelPicker items={YEARS}  initialIndex={DEFAULT_YEAR_IDX}  onChange={setYearIdx} />
                  <Text style={s.pickerUnit}>년</Text>
                  <WheelPicker items={MONTHS} initialIndex={DEFAULT_MONTH_IDX} onChange={setMonthIdx} />
                  <Text style={s.pickerUnit}>월</Text>
                  <WheelPicker items={DAYS}   initialIndex={DEFAULT_DAY_IDX}   onChange={setDayIdx} />
                  <Text style={s.pickerUnit}>일</Text>
                </View>
              </Question>

              {/* Q3 키/몸무게 */}
              <Question num={3} title="키와 몸무게를 알려주세요" divider>
                <View style={s.bodyRow}>
                  <View style={s.bodyField}>
                    <TextInput style={s.bodyInput} placeholder="키" placeholderTextColor="#9ca3af" keyboardType="decimal-pad" value={height} onChangeText={setHeight} />
                    <Text style={s.bodyUnit}>cm</Text>
                  </View>
                  <View style={s.bodyField}>
                    <TextInput style={s.bodyInput} placeholder="몸무게" placeholderTextColor="#9ca3af" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} />
                    <Text style={s.bodyUnit}>kg</Text>
                  </View>
                </View>
              </Question>

              {/* Q4 운동 경험 */}
              <Question num={4} title="운동 경험 수준은요?" divider>
                <View style={s.levelRow}>
                  {EXPERIENCE_LEVELS.map(opt => (
                    <TouchableOpacity key={opt.value} onPress={() => setExperienceLevel(opt.value)} style={[s.levelBtn, experienceLevel === opt.value && s.selectedBlue]}>
                      <Text style={s.levelEmoji}>{opt.emoji}</Text>
                      <Text style={[s.levelLabel, experienceLevel === opt.value && { color: '#0284c7' }]}>{opt.label}</Text>
                      <Text style={s.levelDesc}>{opt.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Question>

              {/* Q5 현재 운동 상태 */}
              <Question num={5} title="지금 얼마나 운동하고 있나요?" divider>
                <View style={s.levelRow}>
                  {EXERCISE_STATUSES.map(opt => (
                    <TouchableOpacity key={opt.value} onPress={() => setExerciseStatus(opt.value)} style={[s.levelBtn, exerciseStatus === opt.value && s.selectedPink]}>
                      <Text style={s.levelEmoji}>{opt.emoji}</Text>
                      <Text style={[s.levelLabel, exerciseStatus === opt.value && { color: '#ec4899' }]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Question>

              {/* Q6 운동 목표 */}
              <Question num={6} title="운동 목표가 뭔가요?" divider>
                <View style={s.typeGrid}>
                  {FITNESS_GOALS.map(opt => {
                    const on = fitnessGoal === opt.value;
                    return (
                      <TouchableOpacity key={opt.value} onPress={() => setFitnessGoal(opt.value)} style={[s.typeBtn, on && s.selectedPink]}>
                        <Text style={s.typeEmoji}>{opt.emoji}</Text>
                        <Text style={[s.typeLabel, on && { color: '#ec4899' }]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Question>

              {/* Q7 운동 장소 */}
              <Question num={7} title="주로 어디서 운동하나요?" divider>
                <View style={s.typeGrid}>
                  {WORKOUT_PLACES.map(opt => {
                    const on = workoutPlace === opt.value;
                    return (
                      <TouchableOpacity key={opt.value} onPress={() => setWorkoutPlace(opt.value)} style={[s.typeBtn, on && s.selectedBlue]}>
                        <Text style={s.typeEmoji}>{opt.emoji}</Text>
                        <Text style={[s.typeLabel, on && { color: '#0284c7' }]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Question>

              {/* Q8 주당 운동 횟수 */}
              <Question num={8} title="일주일에 몇 번 운동할 수 있나요?" divider>
                <View style={s.pickerRow}>
                  <WheelPicker items={WEEKLY_FREQ_ITEMS} initialIndex={DEFAULT_FREQ_IDX} onChange={setWeeklyFreqIdx} />
                </View>
              </Question>

              {/* Q9 1회 운동 시간 */}
              <Question num={9} title="한 번 운동할 때 얼마나 시간이 있나요?" divider>
                <View style={s.pickerRow}>
                  <WheelPicker items={MINUTES_ITEMS} initialIndex={DEFAULT_MINUTES_IDX} onChange={setMinutesIdx} />
                </View>
              </Question>

              {/* Q10 선호 운동 유형 */}
              <Question num={10} title="선호하는 운동을 선택해주세요" divider hint="복수 선택 가능 · 선택 안 해도 됩니다">
                <View style={s.typeGrid}>
                  {EXERCISE_TYPES.map(opt => {
                    const on = exerciseTypes.includes(opt.value);
                    return (
                      <TouchableOpacity key={opt.value} onPress={() => toggleExerciseType(opt.value)} style={[s.typeBtn, on && s.selectedPink]}>
                        <Text style={s.typeEmoji}>{opt.emoji}</Text>
                        <Text style={[s.typeLabel, on && { color: '#ec4899' }]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Question>

              {/* 제출 */}
              <View style={s.submitWrap}>
                <TouchableOpacity activeOpacity={0.85} style={s.submitBtn} onPress={handleSubmit} disabled={loading}>
                  <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.submitGrad}>
                    <TrendingUp size={20} color="#fff" strokeWidth={2.5} />
                    <Text style={s.submitTxt}>{loading ? '저장 중...' : '시작하기'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

            </View>
            <View style={{ height: 32 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

// ─── 공통 질문 컴포넌트 ──────────────────────────────────────────────────────
function Question({
  num, title, divider, hint, children,
}: {
  num: number; title: string; divider?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <View style={[s.question, divider && s.divider]}>
      <View style={s.qHeader}>
        <LinearGradient colors={['#f472b6', '#38bdf8']} style={s.qNum}>
          <Text style={s.qNumTxt}>{num}</Text>
        </LinearGradient>
        <Text style={s.qTitle}>{title}</Text>
      </View>
      {hint ? <Text style={s.multiHint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  kav:  { flex: 1 },
  scroll: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 32, alignItems: 'center' },

  fDumbbell: { position: 'absolute', top: 80,    left: 16 },
  fHeart:    { position: 'absolute', top: 128,   right: 24 },
  fZap:      { position: 'absolute', bottom: 160, left: 24 },
  fBrain:    { position: 'absolute', bottom: 192, right: 32 },

  header:   { alignItems: 'center', marginBottom: 20, gap: 8 },
  logoRow:  { flexDirection: 'row', gap: 10 },
  appTitle: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#4b5563', textAlign: 'center' },

  card: {
    width: '100%', maxWidth: 448,
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#fbcfe8',
    padding: 20, gap: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 10,
  },

  question: { gap: 12 },
  divider:  { paddingTop: 16, borderTopWidth: 2, borderTopColor: '#f3f4f6' },
  qHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qNum:     { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  qNumTxt:  { color: '#fff', fontSize: 14, fontWeight: '700' },
  qTitle:   { fontSize: 14, fontWeight: '600', color: '#1f2937', flex: 1 },
  multiHint: { fontSize: 11, color: '#9ca3af', marginTop: -4 },

  /* 성별 */
  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#f9fafb', alignItems: 'center', gap: 6 },
  genderEmoji: { fontSize: 28 },
  genderLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },

  /* 생년월일 피커 */
  pickerRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pickerUnit: { fontSize: 13, color: '#6b7280', fontWeight: '500' },

  /* 신체 정보 */
  bodyRow:   { flexDirection: 'row', gap: 12 },
  bodyField: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 12 },
  bodyInput: { flex: 1, fontSize: 15, color: '#374151' },
  bodyUnit:  { fontSize: 13, color: '#6b7280', fontWeight: '500' },

  /* 경험 수준 */
  levelRow:   { flexDirection: 'row', gap: 8 },
  levelBtn:   { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#f9fafb', alignItems: 'center', gap: 4 },
  levelEmoji: { fontSize: 22 },
  levelLabel: { fontSize: 12, fontWeight: '700', color: '#374151' },
  levelDesc:  { fontSize: 9, color: '#6b7280', textAlign: 'center' },

  /* 그리드 선택 (목표/장소/운동유형) */
  typeGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn:   { width: '30%', paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#f9fafb', alignItems: 'center', gap: 4 },
  typeEmoji: { fontSize: 22 },
  typeLabel: { fontSize: 10, fontWeight: '600', color: '#374151', textAlign: 'center' },

  /* 선택 상태 */
  selectedPink: { borderColor: '#ec4899', backgroundColor: '#fdf2f8' },
  selectedBlue: { borderColor: '#0ea5e9', backgroundColor: '#f0f9ff' },

  /* 제출 */
  submitWrap: { paddingTop: 4 },
  submitBtn:  { borderRadius: 12, overflow: 'hidden' },
  submitGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  submitTxt:  { color: '#fff', fontSize: 16, fontWeight: '600' },
});
