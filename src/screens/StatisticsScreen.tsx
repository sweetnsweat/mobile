import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Dimensions, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dumbbell, MessageCircle, TrendingUp, Heart, Zap, BarChart3, Activity, Calendar, Sparkles } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { GradientText } from '../components/GradientText';
import { ScreenBackground } from '../components/ScreenBackground';
import { useBounceAnimation } from '../hooks/useBounceAnimation';

const { width: W } = Dimensions.get('window');
const CHART_W = W - 64;

type Props = NativeStackScreenProps<RootStackParamList, 'Statistics'>;
type Period = 'week' | 'month' | 'year';

const weeklyData  = [
  { date: '월', condition: 7, energy: 6, stress: 3, exercise: '수영' },
  { date: '화', condition: 6, energy: 5, stress: 4, exercise: '없음' },
  { date: '수', condition: 8, energy: 8, stress: 2, exercise: '수영' },
  { date: '목', condition: 7, energy: 7, stress: 3, exercise: '없음' },
  { date: '금', condition: 9, energy: 9, stress: 2, exercise: '수영' },
  { date: '토', condition: 8, energy: 8, stress: 2, exercise: '홈 트레이닝' },
  { date: '일', condition: 8, energy: 8, stress: 3, exercise: '없음' },
];
const monthlyData = [
  { date: '1주', condition: 6, energy: 6, stress: 4 },
  { date: '2주', condition: 7, energy: 7, stress: 3 },
  { date: '3주', condition: 8, energy: 8, stress: 2 },
  { date: '4주', condition: 8.5, energy: 8.5, stress: 2 },
];
const yearlyData = [
  { date: '1월', condition: 5, energy: 5, stress: 5 },
  { date: '2월', condition: 5.5, energy: 5.5, stress: 4.5 },
  { date: '3월', condition: 6, energy: 6, stress: 4 },
  { date: '4월', condition: 6.5, energy: 6.5, stress: 3.5 },
  { date: '5월', condition: 7, energy: 7, stress: 3 },
  { date: '6월', condition: 7.5, energy: 7.5, stress: 2.5 },
];
const exerciseData = [
  { exercise: '수영', avgCondition: 8.3 },
  { exercise: '홈트', avgCondition: 7.8 },
  { exercise: '요가', avgCondition: 7.5 },
  { exercise: '조깅', avgCondition: 7.2 },
  { exercise: '없음', avgCondition: 6.1 },
];

const INSIGHTS: Record<Period, { avg: string; count: string; improve: string }> = {
  week:  { avg: '8.1/10', count: '4회', improve: '+36%' },
  month: { avg: '7.8/10', count: '16회', improve: '+28%' },
  year:  { avg: '6.8/10', count: '72회', improve: '+52%' },
};
const INSIGHT_LABELS: Record<Period, string> = { week: '이번 주', month: '이번 달', year: '올해' };
const COMPARE_LABELS: Record<Period, string> = { week: '지난주 대비', month: '지난달 대비', year: '작년 대비' };

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
  const b1 = useBounceAnimation(3000);
  const b2 = useBounceAnimation(2500);
  const b3 = useBounceAnimation(3200);
  const b4 = useBounceAnimation(2800);

  const currentData = period === 'week' ? weeklyData : period === 'month' ? monthlyData : yearlyData;
  const ins = INSIGHTS[period];

  const lineData = {
    labels: currentData.map(d => d.date),
    datasets: [
      { data: currentData.map(d => d.condition), color: () => '#ec4899', strokeWidth: 2.5 },
      { data: currentData.map(d => d.energy),    color: () => '#0ea5e9', strokeWidth: 2.5 },
      { data: currentData.map(d => d.stress),    color: () => '#a855f7', strokeWidth: 2.5 },
    ],
    legend: ['컨디션', '에너지', '스트레스'],
  };

  const barData = {
    labels: exerciseData.map(d => d.exercise),
    datasets: [{ data: exerciseData.map(d => d.avgCondition) }],
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <Animated.View style={[s.fChart,  { transform: [{ translateY: b1 }] }]}><BarChart3  size={40} color="#7dd3fc" strokeWidth={1.5} /></Animated.View>
      <Animated.View style={[s.fHeart,  { transform: [{ translateY: b2 }] }]}><Heart      size={36} color="#f9a8d4" strokeWidth={1.5} /></Animated.View>
      <Animated.View style={[s.fZap,    { transform: [{ translateY: b3 }] }]}><Zap        size={32} color="#93c5fd" strokeWidth={1.5} /></Animated.View>
      <Animated.View style={[s.fTrend,  { transform: [{ translateY: b4 }] }]}><TrendingUp size={36} color="#7dd3fc" strokeWidth={1.5} /></Animated.View>

      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
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

            {/* Insights */}
            <View style={s.insightRow}>
              <LinearGradient colors={['#fdf2f8', '#fce7f3']} style={s.insightCard}>
                <View style={s.insightHeader}>
                  <LinearGradient colors={['#f472b6', '#fb7185']} style={s.insightIcon}><TrendingUp size={10} color="#fff" strokeWidth={2.5} /></LinearGradient>
                  <Text style={s.insightLabel}>평균 컨디션</Text>
                </View>
                <Text style={s.insightVal}>{ins.avg}</Text>
                <Text style={s.insightSub}>{INSIGHT_LABELS[period]} 평균</Text>
              </LinearGradient>
              <LinearGradient colors={['#f0f9ff', '#ecfeff']} style={s.insightCard}>
                <View style={s.insightHeader}>
                  <LinearGradient colors={['#38bdf8', '#06b6d4']} style={s.insightIcon}><Activity size={10} color="#fff" strokeWidth={2.5} /></LinearGradient>
                  <Text style={s.insightLabel}>운동 횟수</Text>
                </View>
                <Text style={[s.insightVal, { color: '#0ea5e9' }]}>{ins.count}</Text>
                <Text style={s.insightSub}>{INSIGHT_LABELS[period]}</Text>
              </LinearGradient>
              <LinearGradient colors={['#faf5ff', '#fdf4ff']} style={s.insightCard}>
                <View style={s.insightHeader}>
                  <LinearGradient colors={['#c084fc', '#e879f9']} style={s.insightIcon}><Sparkles size={10} color="#fff" strokeWidth={2.5} /></LinearGradient>
                  <Text style={s.insightLabel}>개선율</Text>
                </View>
                <Text style={[s.insightVal, { color: '#a855f7' }]}>{ins.improve}</Text>
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
                <Text style={s.aiTitle}>AI 분석 인사이트</Text>
              </View>
              <Text style={s.aiBody}>
                최근 <Text style={s.aiHighBlue}>수영</Text>을 했을 때 평균 컨디션이{' '}
                <Text style={s.aiHighPink}>8.3점</Text>으로 가장 높았어요!{'\n'}
                운동을 하지 않은 날(6.1점)보다{' '}
                <Text style={s.aiHighPurple}>36% 더 높은</Text> 수치입니다.{'\n\n'}
                특히 수영 후에는{' '}
                <Text style={[s.aiHighBlue, { fontWeight: '600' }]}>스트레스 레벨이 평균 2.3점</Text>으로 크게 감소했어요.
              </Text>
              <View style={s.aiRec}>
                <Text style={s.aiRecTitle}>💡 추천 사항</Text>
                <Text style={s.aiRecBody}>
                  앞으로도 <Text style={{ fontWeight: '700' }}>수영과 같은 유산소 운동</Text>을 중심으로 추천해드릴게요.
                  일주일에 3-4회 정도 규칙적으로 하시면 더 좋은 효과를 볼 수 있을 거예요!
                </Text>
              </View>
            </LinearGradient>

            {/* Weekly table */}
            <View style={s.tableSection}>
              <Text style={s.tableTitle}>주간 운동 기록</Text>
              <View style={s.tableWrap}>
                <LinearGradient colors={['#fce7f3', '#f0f9ff']} style={s.tableHeader}>
                  {['날짜', '운동', '컨디션', '에너지', '스트레스'].map(h => (
                    <Text key={h} style={s.tableHeaderCell}>{h}</Text>
                  ))}
                </LinearGradient>
                {weeklyData.map((day, i) => (
                  <View key={i} style={[s.tableRow, i % 2 === 1 && { backgroundColor: '#f9fafb' }]}>
                    <Text style={s.tableCell}>{day.date}</Text>
                    <View style={s.tableCellCenter}>
                      <View style={[s.exerciseBadge,
                        day.exercise === '수영' ? { backgroundColor: '#e0f2fe' } :
                        day.exercise.includes('트레이닝') ? { backgroundColor: '#fce7f3' } :
                        { backgroundColor: '#f3f4f6' }
                      ]}>
                        <Text style={[s.exerciseBadgeTxt,
                          day.exercise === '수영' ? { color: '#0369a1' } :
                          day.exercise.includes('트레이닝') ? { color: '#db2777' } :
                          { color: '#4b5563' }
                        ]}>
                          {day.exercise === '홈 트레이닝' ? '홈트' : day.exercise}
                        </Text>
                      </View>
                    </View>
                    <Text style={[s.tableCell, { color: '#ec4899', fontWeight: '700' }]}>{day.condition}</Text>
                    <Text style={[s.tableCell, { color: '#0ea5e9', fontWeight: '700' }]}>{day.energy}</Text>
                    <Text style={[s.tableCell, { color: '#a855f7', fontWeight: '700' }]}>{day.stress}</Text>
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

  chartWrap: { borderRadius: 16, padding: 16, borderWidth: 2, borderColor: '#fbcfe8' },
  chart: { borderRadius: 12 },

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
  tableCell: { flex: 1, fontSize: 14, color: '#1f2937', textAlign: 'center', fontWeight: '500' },
  tableCellCenter: { flex: 1, alignItems: 'center' },
  exerciseBadge: { borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  exerciseBadgeTxt: { fontSize: 10, fontWeight: '500' },
});
