import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { ScreenBackground } from '../../components/ScreenBackground';
import { battleModeToDuration, BattleMetric, BattleResultDetail, getBattleResult } from '../../services/BattleService';
import { getMyProfile, resolveProfileImageUrl } from '../../services/UserService';

type Props = NativeStackScreenProps<RootStackParamList, 'BattleResult'>;

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function StatRow({ metric }: { metric: BattleMetric }) {
  return (
    <View style={s.statItem}>
      <View style={s.statRow}>
        <Text style={s.myStatVal} numberOfLines={1}>{metric.myValue}</Text>
        <View style={s.barWrap}>
          <View style={s.barBg}>
            <LinearGradient
              colors={['#ec4899', '#f9a8d4']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[s.barFill, { width: `${clampPercent(metric.myPercent)}%` as any }]}
            />
          </View>
          <View style={[s.barBg, s.barRight]}>
            <LinearGradient
              colors={['#0ea5e9', '#7dd3fc']}
              start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}
              style={[s.barFill, { width: `${clampPercent(metric.opponentPercent)}%` as any }]}
            />
          </View>
        </View>
        <Text style={s.opStatVal} numberOfLines={1}>{metric.opponentValue}</Text>
      </View>
      <Text style={s.statLabel}>{metric.label}</Text>
    </View>
  );
}

function resultCopy(result: BattleResultDetail | null) {
  if (!result?.finalized || result.result === 'PENDING') {
    return {
      won: false,
      colors: ['#9ca3af', '#d1d5db'] as [string, string],
      emoji: '...',
      title: '결과 대기 중',
      message: '아직 최종 결과가 확정되지 않았어요.',
    };
  }

  if (result.result === 'WIN') {
    return {
      won: true,
      colors: ['#ec4899', '#f472b6'] as [string, string],
      emoji: 'WIN',
      title: '승리',
      message: '이번 배틀에서 승리했어요.',
    };
  }

  if (result.result === 'DRAW') {
    return {
      won: false,
      colors: ['#0ea5e9', '#38bdf8'] as [string, string],
      emoji: 'DRAW',
      title: '무승부',
      message: '아슬아슬한 승부였어요.',
    };
  }

  return {
    won: false,
    colors: ['#9ca3af', '#d1d5db'] as [string, string],
    emoji: 'LOSS',
    title: '패배',
    message: '다음 배틀에서 다시 도전해봐요.',
  };
}

export function BattleResultScreen({ route, navigation }: Props) {
  const { battleId } = route.params;
  const [result, setResult] = useState<BattleResultDetail | null>(null);
  const [myProfileImageUrl, setMyProfileImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadResult() {
    setLoading(true);
    try {
      setResult(await getBattleResult(battleId));
    } catch (e: any) {
      Alert.alert('배틀', e?.response?.data?.detail ?? e?.message ?? '배틀 결과를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResult();
  }, [battleId]);

  useEffect(() => {
    let isActive = true;

    getMyProfile()
      .then(profile => {
        if (!isActive) return;
        setMyProfileImageUrl(resolveProfileImageUrl(profile.profileImageUrl));
      })
      .catch(() => {});

    return () => {
      isActive = false;
    };
  }, []);

  const copy = resultCopy(result);
  const duration = result ? battleModeToDuration(result.mode) : route.params.duration ?? '1d';
  const me = result?.participants.find(p => p.me);
  const opponent = result?.participants.find(p => !p.me);
  const meProfileImageUrl = myProfileImageUrl || resolveProfileImageUrl(me?.profileImageUrl);
  const opponentProfileImageUrl = resolveProfileImageUrl(opponent?.profileImageUrl);
  const durationLabel = duration === '1d' ? '하루 배틀' : '주간 배틀';
  const rewardText =
    result && (result.rewardExp > 0 || result.rewardGold > 0)
      ? `보상 EXP +${result.rewardExp} / 골드 +${result.rewardGold}`
      : result?.finalized
        ? '이번 결과 보상은 없습니다.'
        : '결과 확정 후 보상이 표시됩니다.';

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        <LinearGradient
          colors={copy.colors}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.resultHeader}
        >
          <Text style={s.resultSub}>{durationLabel} 결과</Text>
          <Text style={s.resultEmoji}>{copy.emoji}</Text>
          <Text style={s.resultTitle}>{copy.title}</Text>
          <Text style={s.resultMsg}>{copy.message}</Text>
        </LinearGradient>

        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color="#ec4899" size="large" />
          </View>
        ) : (
          <View style={s.content}>
            <View style={s.battleCard}>
              <View style={s.fighters}>
                <View style={s.fighter}>
                  <View style={[s.fighterImg, { borderColor: copy.won ? '#fbcfe8' : '#e5e7eb' }]}>
                    <ImageWithFallback uri={meProfileImageUrl} style={s.fighterImgInner} />
                  </View>
                  <Text style={s.fighterName} numberOfLines={1}>{me?.nickname ?? '나'}</Text>
                  <View style={[s.resultChip, copy.won ? s.chipWin : s.chipLose]}>
                    <Text style={[s.resultChipTxt, { color: copy.won ? '#ec4899' : '#9ca3af' }]}>{result?.myScore ?? 0} pts</Text>
                  </View>
                </View>

                <View style={s.vsCol}>
                  <View style={[s.divider, { backgroundColor: '#fbcfe8' }]} />
                  <Text style={s.vsText}>VS</Text>
                  <View style={[s.divider, { backgroundColor: '#bae6fd' }]} />
                </View>

                <View style={s.fighter}>
                  <View style={[s.fighterImg, { borderColor: copy.won ? '#e5e7eb' : '#bae6fd' }]}>
                    <ImageWithFallback uri={opponentProfileImageUrl} style={s.fighterImgInner} />
                  </View>
                  <Text style={s.fighterName} numberOfLines={1}>{opponent?.nickname ?? '상대'}</Text>
                  <View style={[s.resultChip, copy.won ? s.chipLose : s.chipWinBlue]}>
                    <Text style={[s.resultChipTxt, { color: copy.won ? '#9ca3af' : '#0ea5e9' }]}>{result?.opponentScore ?? 0} pts</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={s.statsCard}>
              <Text style={s.statsTitle}>요약</Text>
              <View style={s.rewardBox}>
                <Text style={s.rewardTxt}>{rewardText}</Text>
              </View>
              {(result?.metrics?.length ?? 0) > 0 ? (
                result?.metrics.map(metric => (
                  <StatRow key={metric.metricKey} metric={metric} />
                ))
              ) : (
                <Text style={s.emptyMetricsTxt}>상세 지표는 배틀 진행 화면에서 확인할 수 있어요.</Text>
              )}
            </View>

            <View style={s.btnRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={s.ctaWrap}
                onPress={() => navigation.navigate('BattleLobby')}
              >
                <LinearGradient
                  colors={['#ec4899', '#f472b6']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.cta}
                >
                  <Text style={s.ctaTxt}>배틀 로비</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  resultHeader: { paddingHorizontal: 24, paddingVertical: 22, alignItems: 'center', gap: 4 },
  resultSub: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  resultEmoji: { fontSize: 22, marginTop: 4, color: '#fff', fontWeight: '900' },
  resultTitle: { fontSize: 28, fontWeight: '900', color: '#fff' },
  resultMsg: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 12, justifyContent: 'center' },
  battleCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: '#f3f4f6', padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 4 },
  fighters: { flexDirection: 'row', alignItems: 'center' },
  fighter: { flex: 1, alignItems: 'center', gap: 8 },
  fighterImg: { width: 88, height: 104, borderRadius: 16, overflow: 'hidden', borderWidth: 2.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 3 },
  fighterImgInner: { width: '100%', height: '100%' },
  fighterName: { fontSize: 14, fontWeight: '900', color: '#111827' },
  resultChip: { borderRadius: 99, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 3 },
  chipWin: { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8' },
  chipLose: { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' },
  chipWinBlue: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' },
  resultChipTxt: { fontSize: 11, fontWeight: '900' },
  vsCol: { alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  divider: { width: 2, height: 36, borderRadius: 99 },
  vsText: { fontSize: 26, fontWeight: '900', color: '#ec4899', lineHeight: 30 },
  statsCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: '#f3f4f6', padding: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
  statsTitle: { fontSize: 10, fontWeight: '700', color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase' },
  rewardBox: { backgroundColor: '#fdf2f8', borderRadius: 12, borderWidth: 1, borderColor: '#fbcfe8', paddingHorizontal: 12, paddingVertical: 10 },
  rewardTxt: { fontSize: 12, fontWeight: '800', color: '#be185d', textAlign: 'center' },
  emptyMetricsTxt: { fontSize: 12, fontWeight: '600', color: '#9ca3af', textAlign: 'center', lineHeight: 18 },
  statItem: { gap: 3 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  myStatVal: { fontSize: 11, fontWeight: '700', color: '#ec4899', width: 46, textAlign: 'right' },
  barWrap: { flex: 1, flexDirection: 'row' },
  barBg: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 99, overflow: 'hidden' },
  barRight: { transform: [{ scaleX: -1 }] },
  barFill: { height: '100%', borderRadius: 99 },
  opStatVal: { fontSize: 11, fontWeight: '700', color: '#0ea5e9', width: 46 },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af', textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase' },
  btnRow: { flexDirection: 'row', justifyContent: 'center' },
  ctaWrap: { width: '72%', maxWidth: 280, borderRadius: 14, overflow: 'hidden', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  cta: { paddingVertical: 15, alignItems: 'center' },
  ctaTxt: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
