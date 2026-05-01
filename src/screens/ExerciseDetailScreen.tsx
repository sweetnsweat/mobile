import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Dumbbell, Zap, Target, Layers, BookOpen, Heart } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenBackground } from '../components/ScreenBackground';
import { getExerciseById, toggleFavorite, ExerciseDetail } from '../services/ExerciseService';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseDetail'>;

const LEVEL_COLOR: Record<string, string> = {
  입문: '#22c55e', 초급: '#22c55e', 중급: '#f59e0b', 고급: '#ef4444',
  beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444',
};

export function ExerciseDetailScreen({ navigation, route }: Props) {
  const { exercise } = route.params;
  const [detail,   setDetail]   = useState<ExerciseDetail | null>(null);
  const [liked,    setLiked]    = useState(exercise.liked);
  const [loading,  setLoading]  = useState(true);

  const levelColor = LEVEL_COLOR[exercise.levelDisplayName] ?? LEVEL_COLOR[exercise.level] ?? '#9ca3af';

  useEffect(() => {
    getExerciseById(exercise.id)
      .then(d => { setDetail(d); setLiked(d.liked); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [exercise.id]);

  async function handleToggleLike() {
    const next = !liked;
    setLiked(next);
    try {
      await toggleFavorite(exercise.id, next);
    } catch {
      setLiked(!next); // 롤백
    }
  }

  const primaryMuscles   = detail?.primaryMuscles   ?? exercise.primaryMuscles;
  const secondaryMuscles = detail?.secondaryMuscles ?? [];
  const instructions     = detail?.instructions     ?? [];

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>

        {/* 헤더 */}
        <LinearGradient
          colors={['#ec4899', '#38bdf8']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.header}
        >
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <ChevronLeft size={16} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={s.headerTitle} numberOfLines={1}>{exercise.name}</Text>
            <TouchableOpacity onPress={handleToggleLike} style={s.likeBtn}>
              <Heart
                size={20} strokeWidth={2}
                color={liked ? '#fce7f3' : 'rgba(255,255,255,0.7)'}
                fill={liked ? '#fce7f3' : 'none'}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* 히어로 */}
          <LinearGradient colors={['#fdf2f8', '#eff6ff']} style={s.hero}>
            <Text style={s.heroEmoji}>{exercise.emoji}</Text>
            <Text style={s.heroName}>{exercise.name}</Text>
            <View style={s.categoryBadge}>
              <Text style={s.categoryTxt}>{exercise.categoryDisplayName}</Text>
            </View>
          </LinearGradient>

          {/* 스탯 카드 3개 */}
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Zap size={20} color="#ec4899" strokeWidth={2} />
              <Text style={s.statVal}>
                {exercise.met != null ? Number(exercise.met).toFixed(1) : '-'}
              </Text>
              <Text style={s.statLabel}>MET</Text>
            </View>
            <View style={s.statCard}>
              <Target size={20} color={levelColor} strokeWidth={2} />
              <Text style={[s.statVal, { color: levelColor }]}>{exercise.levelDisplayName}</Text>
              <Text style={s.statLabel}>난이도</Text>
            </View>
            <View style={s.statCard}>
              <Dumbbell size={20} color="#0284c7" strokeWidth={2} />
              <Text style={s.statVal} numberOfLines={2} adjustsFontSizeToFit>
                {exercise.equipment || '-'}
              </Text>
              <Text style={s.statLabel}>장비</Text>
            </View>
          </View>

          {/* 칼로리 */}
          {exercise.estimatedKcalPerHour > 0 && (
            <View style={s.kcalCard}>
              <Text style={s.kcalLabel}>예상 칼로리 소모</Text>
              <Text style={s.kcalVal}>{exercise.estimatedKcalPerHour} kcal/h</Text>
            </View>
          )}

          {/* 주요 근육 */}
          {primaryMuscles.length > 0 && (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Layers size={16} color="#ec4899" strokeWidth={2} />
                <Text style={s.cardTitle}>주요 근육</Text>
              </View>
              <View style={s.chips}>
                {primaryMuscles.map(m => (
                  <View key={m} style={[s.chip, s.chipPink]}>
                    <Text style={[s.chipTxt, s.chipTxtPink]}>{m}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 보조 근육 */}
          {!loading && secondaryMuscles.length > 0 && (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Layers size={16} color="#0284c7" strokeWidth={2} />
                <Text style={[s.cardTitle, { color: '#0284c7' }]}>보조 근육</Text>
              </View>
              <View style={s.chips}>
                {secondaryMuscles.map(m => (
                  <View key={m} style={[s.chip, s.chipBlue]}>
                    <Text style={[s.chipTxt, s.chipTxtBlue]}>{m}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 운동 방법 */}
          {loading ? (
            <View style={[s.card, { alignItems: 'center', paddingVertical: 24 }]}>
              <ActivityIndicator color="#ec4899" />
              <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>상세 정보 불러오는 중...</Text>
            </View>
          ) : instructions.length > 0 ? (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <BookOpen size={16} color="#ec4899" strokeWidth={2} />
                <Text style={s.cardTitle}>운동 방법</Text>
              </View>
              {instructions.map((step, i) => (
                <View key={i} style={s.stepRow}>
                  <LinearGradient
                    colors={['#f472b6', '#38bdf8']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.stepBadge}
                  >
                    <Text style={s.stepBadgeTxt}>{i + 1}</Text>
                  </LinearGradient>
                  <Text style={s.stepTxt}>{step}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center', marginHorizontal: 8,
    color: '#fff', fontSize: 17, fontWeight: '700',
  },
  likeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { padding: 16, gap: 12 },

  hero: {
    borderRadius: 16, alignItems: 'center',
    paddingVertical: 28, paddingHorizontal: 20,
    borderWidth: 2, borderColor: '#fbcfe8',
    gap: 8,
  },
  heroEmoji: { fontSize: 56 },
  heroName: { fontSize: 20, fontWeight: '800', color: '#1f2937', textAlign: 'center' },
  categoryBadge: {
    backgroundColor: '#fce7f3', borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: '#fbcfe8',
  },
  categoryTxt: { color: '#ec4899', fontSize: 12, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#e5e7eb',
    paddingVertical: 14, alignItems: 'center', gap: 4,
  },
  statVal: {
    fontSize: 14, fontWeight: '700', color: '#1f2937',
    textAlign: 'center', paddingHorizontal: 4,
  },
  statLabel: { fontSize: 10, color: '#9ca3af', fontWeight: '500' },

  kcalCard: {
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#e5e7eb',
    paddingVertical: 12, paddingHorizontal: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  kcalLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  kcalVal:   { fontSize: 14, fontWeight: '700', color: '#ec4899' },

  card: {
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#e5e7eb',
    padding: 16, gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#ec4899' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  chipPink: { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8' },
  chipBlue: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  chipTxt: { fontSize: 12, fontWeight: '600' },
  chipTxtPink: { color: '#db2777' },
  chipTxtBlue: { color: '#0284c7' },

  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepBadge: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  stepBadgeTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepTxt: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },
});
