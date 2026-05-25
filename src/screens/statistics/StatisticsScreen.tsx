import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Dimensions, StatusBar, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { ChevronLeft, Dumbbell, MessageCircle, TrendingUp, Heart, Zap, BarChart3, Activity as ActivityIcon, Calendar, Sparkles } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { GradientText } from '../../components/GradientText';
import { ScreenBackground } from '../../components/ScreenBackground';
import { useBounceAnimation } from '../../hooks/useBounceAnimation';
import { getRecordStats, RecordStatsPeriod, RecordStatsResponse } from '../../services/StatsService';
import { syncHealthDataWithServerIfStale } from '../../services/HealthConnectService';

const { width: W } = Dimensions.get('window');
const CHART_W = Math.max(220, Math.min(W - 128, 504));

type Props = NativeStackScreenProps<RootStackParamList, 'Statistics'>;
type Period = 'week' | 'month' | 'year';

const INSIGHT_LABELS: Record<Period, string> = { week: '이번 주', month: '이번 달', year: '올해' };
const COMPARE_LABELS: Record<Period, string> = { week: '지난주 대비', month: '지난달 대비', year: '작년 대비' };
const API_PERIODS: Record<Period, RecordStatsPeriod> = { week: 'WEEKLY', month: 'MONTHLY', year: 'YEARLY' };

const chartConfig = {
  backgroundColor: '#fdf2f8',
  backgroundGradientFrom: '#fdf2f8',
  backgroundGradientTo: '#f0f9ff',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(236,72,153,${opacity})`,
  labelColor: (opacity = 1) => `rgba(102,102,102,${opacity})`,
  strokeWidth: 2,
  propsForDots: { r: '4', strokeWidth: '0', fill: '#ec4899' },
};

export function StatisticsScreen({ navigation }: Props) {
  const [period, setPeriod] = useState<Period>('week');
  const [stats, setStats] = useState<RecordStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const b1 = useBounceAnimation(3000);
  const b2 = useBounceAnimation(2500);
  const b3 = useBounceAnimation(3200);
  const b4 = useBounceAnimation(2800);

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setErrorMessage(null);
    async function loadStats() {
      try {
        await syncHealthDataWithServerIfStale();
      } catch (e) {
        console.log('[HealthDataSync] statistics skipped:', e instanceof Error ? e.message : e);
      }

      try {
        const data = await getRecordStats(API_PERIODS[period]);
        if (alive) setStats(data);
      } catch (error: any) {
        if (!alive) return;
        const message = error?.response?.data?.detail ?? error?.message ?? '통계 데이터를 불러오지 못했습니다.';
        setErrorMessage(message);
        setStats(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadStats();

    return () => {
      alive = false;
    };
  }, [period]);

  const dailyRecords = stats?.dailyRecords ?? [];
  const summary = stats?.summary;

  const lineData = useMemo(() => {
    const trend = stats?.conditionTrend ?? [];
    const points = trend.length > 0 ? trend : [{ label: '-', conditionScore: 0, energyLevel: 0, stressScore: 0 }];
    return {
      labels: points.map(d => d.label),
      datasets: [
        { data: points.map(d => d.conditionScore ?? 0), color: () => '#ec4899', strokeWidth: 2.5 },
        { data: points.map(d => d.energyLevel ?? 0),    color: () => '#0ea5e9', strokeWidth: 2.5 },
        { data: points.map(d => d.stressScore ?? 0),    color: () => '#a855f7', strokeWidth: 2.5 },
      ],
      legend: ['컨디션', '에너지', '스트레스'],
    };
  }, [stats]);

  const barData = useMemo(() => {
    const exerciseEffects = stats?.exerciseEffects ?? [];
    const points = exerciseEffects.length > 0 ? exerciseEffects : [{ label: '-', averageConditionScore: 0 }];
    return {
      labels: points.map(d => d.label),
      datasets: [{ data: points.map(d => d.averageConditionScore ?? 0) }],
    };
  }, [stats]);

  const averageCondition = summary?.averageConditionScore == null ? '-' : `${summary.averageConditionScore.toFixed(1)}/10`;
  const exerciseCount = summary == null ? '-' : `${summary.exerciseCount}회`;
  const improvementRate = summary == null ? '-' : `${summary.improvementRatePercent > 0 ? '+' : ''}${summary.improvementRatePercent}%`;

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <Animated.View style={[s.fChart,  { transform: [{ translateY: b1 }] }]}><BarChart3  size={40} color="#7dd3fc" strokeWidth={1.5} /></Animated.View>
      <Animated.View style={[s.fHeart,  { transform: [{ translateY: b2 }] }]}><Heart      size={36} color="#f9a8d4" strokeWidth={1.5} /></Animated.View>
      <Animated.View style={[s.fZap,    { transform: [{ translateY: b3 }] }]}><Zap        size={32} color="#93c5fd" strokeWidth={1.5} /></Animated.View>
      <Animated.View style={[s.fTrend,  { transform: [{ translateY: b4 }] }]}><TrendingUp size={36} color="#7dd3fc" strokeWidth={1.5} /></Animated.View>

      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.topBar}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <ChevronLeft size={20} color="#111827" strokeWidth={3} />
            </TouchableOpacity>
            <Text style={s.topBarTitle}>통계</Text>
          </View>

          {/* Header */}
          <View style={s.header}>
            <View style={s.logoRow}>
              <Dumbbell size={32} color="#db2777" strokeWidth={2.5} />
              <MessageCircle size={28} color="#0284c7" strokeWidth={2.5} />
            </View>
            <GradientText colors={['#db2777', '#0284c7']} style={s.appTitle}>sweet & sweat</GradientText>
            <Text style={s.subtitle}>나의 컨디션 통계</Text>
          </View>

          {/* Main card */}
          <View style={s.card}>
            {/* Period toggle */}
            <View style={s.periodSection}>
              <View style={s.periodHeader}>
                <Calendar size={24} color="#db2777" strokeWidth={2.5} />
                <Text style={s.periodTitle}>기간별 컨디션 변화</Text>
              </View>
              <View style={s.periodBtns}>
                {(['week', 'month', 'year'] as Period[]).map(p => (
                  <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={s.periodBtnWrap}>
                    {period === p ? (
                      <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.periodBtnActive}>
                        <Text style={s.periodBtnActiveTxt}>{p === 'week' ? '주간' : p === 'month' ? '월간' : '연간'}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={s.periodBtn}>
                        <Text style={s.periodBtnTxt}>{p === 'week' ? '주간' : p === 'month' ? '월간' : '연간'}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Line chart */}
            <LinearGradient colors={['#fdf2f8', '#f0f9ff']} style={s.chartWrap}>
              {loading && (
                <View style={s.loadingOverlay}>
                  <ActivityIndicator color="#db2777" />
                </View>
              )}
              <LineChart
                data={lineData}
                width={CHART_W}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={s.chart}
                fromZero={false}
                yAxisSuffix=""
                yAxisLabel=""
                withInnerLines
                segments={5}
              />
            </LinearGradient>
            {errorMessage && <Text style={s.errorText}>{errorMessage}</Text>}

            {/* Insights */}
            <View style={s.insightRow}>
              <LinearGradient colors={['#fdf2f8', '#fce7f3']} style={s.insightCard}>
                <View style={s.insightHeader}>
                  <LinearGradient colors={['#f472b6', '#fb7185']} style={s.insightIcon}><TrendingUp size={10} color="#fff" strokeWidth={2.5} /></LinearGradient>
                  <Text style={s.insightLabel}>평균 컨디션</Text>
                </View>
                <Text style={s.insightVal}>{averageCondition}</Text>
                <Text style={s.insightSub}>{INSIGHT_LABELS[period]} 평균</Text>
              </LinearGradient>
              <LinearGradient colors={['#f0f9ff', '#ecfeff']} style={s.insightCard}>
                <View style={s.insightHeader}>
                  <LinearGradient colors={['#38bdf8', '#06b6d4']} style={s.insightIcon}><ActivityIcon size={10} color="#fff" strokeWidth={2.5} /></LinearGradient>
                  <Text style={s.insightLabel}>운동 횟수</Text>
                </View>
                <Text style={[s.insightVal, { color: '#0ea5e9' }]}>{exerciseCount}</Text>
                <Text style={s.insightSub}>{INSIGHT_LABELS[period]}</Text>
              </LinearGradient>
              <LinearGradient colors={['#faf5ff', '#fdf4ff']} style={s.insightCard}>
                <View style={s.insightHeader}>
                  <LinearGradient colors={['#c084fc', '#e879f9']} style={s.insightIcon}><Sparkles size={10} color="#fff" strokeWidth={2.5} /></LinearGradient>
                  <Text style={s.insightLabel}>개선율</Text>
                </View>
                <Text style={[s.insightVal, { color: '#a855f7' }]}>{improvementRate}</Text>
                <Text style={s.insightSub}>{COMPARE_LABELS[period]}</Text>
              </LinearGradient>
            </View>

            {/* Bar chart */}
            <View style={s.barSection}>
              <View style={s.barHeader}>
                <Dumbbell size={24} color="#db2777" strokeWidth={2.5} />
                <Text style={s.barTitle}>운동별 효과 분석</Text>
              </View>
              <LinearGradient colors={['#fdf2f8', '#faf5ff']} style={s.chartWrap}>
                <BarChart
                  data={barData}
                  width={CHART_W}
                  height={200}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    ...chartConfig,
                    backgroundGradientFrom: '#fdf2f8',
                    backgroundGradientTo: '#faf5ff',
                    barPercentage: 0.65,
                  }}
                  style={s.chart}
                  fromZero
                  showBarTops
                />
              </LinearGradient>
            </View>

            {/* AI insight */}
            <LinearGradient colors={['#faf5ff', '#fdf2f8']} style={s.aiCard}>
              <View style={s.aiHeader}>
                <LinearGradient colors={['#c084fc', '#f472b6']} style={s.aiIcon}><Sparkles size={20} color="#fff" strokeWidth={2.5} /></LinearGradient>
                <Text style={s.aiTitle}>{stats?.insight.title || '분석 인사이트'}</Text>
              </View>
              <Text style={s.aiBody}>{stats?.insight.summary || '아직 분석할 기록이 충분하지 않습니다.'}</Text>
              <View style={s.aiRec}>
                <Text style={s.aiRecTitle}>추천 사항</Text>
                <Text style={s.aiRecBody}>{stats?.insight.recommendation || '기록이 쌓이면 더 구체적인 추천을 보여드릴게요.'}</Text>
              </View>
            </LinearGradient>

            {/* Weekly table */}
            <View style={s.tableSection}>
              <Text style={s.tableTitle}>운동 기록</Text>
              <View style={s.tableWrap}>
                <LinearGradient colors={['#fce7f3', '#f0f9ff']} style={s.tableHeader}>
                  {['날짜', '운동', '컨디션', '에너지', '스트레스'].map(h => (
                    <Text key={h} style={s.tableHeaderCell}>{h}</Text>
                  ))}
                </LinearGradient>
                {dailyRecords.length === 0 && (
                  <View style={s.emptyRow}>
                    <Text style={s.emptyText}>표시할 운동 기록이 없습니다.</Text>
                  </View>
                )}
                {dailyRecords.map((day, i) => (
                  <View key={i} style={[s.tableRow, i % 2 === 1 && { backgroundColor: '#f9fafb' }]}>
                    <Text style={s.tableCell}>{day.dayOfWeek || day.date}</Text>
                    <View style={s.tableCellCenter}>
                      <View style={[s.exerciseBadge,
                        day.exerciseLabel === '수영' ? { backgroundColor: '#e0f2fe' } :
                        day.exerciseLabel.includes('트레이닝') ? { backgroundColor: '#fce7f3' } :
                        { backgroundColor: '#f3f4f6' }
                      ]}>
                        <Text style={[s.exerciseBadgeTxt,
                          day.exerciseLabel === '수영' ? { color: '#0369a1' } :
                          day.exerciseLabel.includes('트레이닝') ? { color: '#db2777' } :
                          { color: '#4b5563' }
                        ]}>
                          {day.exerciseLabel === '홈 트레이닝' ? '홈트' : day.exerciseLabel || '없음'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[s.tableCell, { color: '#ec4899', fontWeight: '700' }]}>{day.conditionScore ?? '-'}</Text>
                    <Text style={[s.tableCell, { color: '#0ea5e9', fontWeight: '700' }]}>{day.energyLevel ?? '-'}</Text>
                    <Text style={[s.tableCell, { color: '#a855f7', fontWeight: '700' }]}>{day.stressScore ?? '-'}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <View style={{ height: 48 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingTop: 16, paddingHorizontal: 16, alignItems: 'center' },

  fChart: { position: 'absolute', top: 80, left: 16 },
  fHeart: { position: 'absolute', top: 128, right: 24 },
  fZap:   { position: 'absolute', bottom: 160, left: 24 },
  fTrend: { position: 'absolute', bottom: 192, right: 32 },

  topBar: { width: '100%', maxWidth: 600, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  topBarTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  header: { alignItems: 'center', marginBottom: 24, gap: 8 },
  logoRow: { flexDirection: 'row', gap: 12 },
  appTitle: { fontSize: 30, fontWeight: '700' },
  subtitle: { fontSize: 16, color: '#4b5563' },

  card: {
    width: '100%', maxWidth: 600,
    backgroundColor: '#fff', borderRadius: 24, borderWidth: 4, borderColor: '#fbcfe8',
    padding: 16, gap: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 12,
  },

  periodSection: { gap: 16 },
  periodHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  periodTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  periodBtns: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 4 },
  periodBtnWrap: { flex: 1 },
  periodBtnActive: { borderRadius: 6, paddingVertical: 6, paddingHorizontal: 8, alignItems: 'center' },
  periodBtnActiveTxt: { fontSize: 12, fontWeight: '700', color: '#fff' },
  periodBtn: { paddingVertical: 6, paddingHorizontal: 8, alignItems: 'center' },
  periodBtnTxt: { fontSize: 12, fontWeight: '500', color: '#374151' },

  chartWrap: { borderRadius: 16, padding: 16, borderWidth: 2, borderColor: '#fbcfe8', alignItems: 'center' },
  chart: { borderRadius: 12 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { marginTop: -24, fontSize: 12, color: '#b91c1c', textAlign: 'center' },

  insightRow: { flexDirection: 'row', gap: 8 },
  insightCard: { flex: 1, borderRadius: 16, padding: 8, borderWidth: 2, borderColor: '#f9a8d4', gap: 2 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  insightIcon: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  insightLabel: { fontSize: 9, fontWeight: '700', color: '#1f2937' },
  insightVal: { fontSize: 14, fontWeight: '700', color: '#ec4899' },
  insightSub: { fontSize: 10, color: '#4b5563' },

  barSection: { gap: 16 },
  barHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  barTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },

  aiCard: { borderRadius: 16, padding: 16, borderWidth: 2, borderColor: '#d8b4fe', gap: 12 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  aiBody: { fontSize: 14, color: '#374151', lineHeight: 22 },
  aiHighPink: { fontWeight: '700', color: '#ec4899' },
  aiHighBlue: { fontWeight: '700', color: '#0ea5e9' },
  aiHighPurple: { fontWeight: '700', color: '#a855f7' },
  aiRec: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 2, borderColor: '#e9d5ff', padding: 12 },
  aiRecTitle: { fontWeight: '700', color: '#7e22ce', marginBottom: 4, fontSize: 14 },
  aiRecBody: { fontSize: 14, color: '#374151' },

  tableSection: { gap: 16, borderTopWidth: 2, borderTopColor: '#f3f4f6', paddingTop: 24 },
  tableTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  tableWrap: { borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb', overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', paddingVertical: 8 },
  tableHeaderCell: { flex: 1, fontSize: 10, fontWeight: '700', color: '#1f2937', textAlign: 'center' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 2, borderTopColor: '#f3f4f6' },
  emptyRow: { paddingVertical: 18, backgroundColor: '#fff', borderTopWidth: 2, borderTopColor: '#f3f4f6' },
  emptyText: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
  tableCell: { flex: 1, fontSize: 14, color: '#1f2937', textAlign: 'center', fontWeight: '500' },
  tableCellCenter: { flex: 1, alignItems: 'center' },
  exerciseBadge: { borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  exerciseBadgeTxt: { fontSize: 10, fontWeight: '500' },
});
