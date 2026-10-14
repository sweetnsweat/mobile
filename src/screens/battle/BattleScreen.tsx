import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { ScreenBackground } from '../../components/ScreenBackground';
import { battleModeToDuration, BattleDetail, BattleMetric, getBattleDetail } from '../../services/BattleService';
import { getMyProfile, resolveProfileImageUrl } from '../../services/UserService';
import { syncHealthDataWithServer, syncHealthDataWithServerIfStale } from '../../services/HealthConnectService';

type Props = NativeStackScreenProps<RootStackParamList, 'Battle'>;

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

function formatSyncTime(value?: string | null): string {
  if (!value) return '기록 반영 대기 중';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '기록 반영 대기 중';
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} 반영`;
}

export function BattleScreen({ route, navigation }: Props) {
  const { battleId } = route.params;
  const [battle, setBattle] = useState<BattleDetail | null>(null);
  const [myProfileImageUrl, setMyProfileImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBattle = useCallback(async () => {
    setLoading(true);
    try {
      try {
        await syncHealthDataWithServerIfStale();
      } catch (e) {
        console.log('[HealthDataSync] battle detail skipped:', e instanceof Error ? e.message : e);
      }
      const detail = await getBattleDetail(battleId);
      if (detail.healthSync?.recommended) {
        try {
          await syncHealthDataWithServer({ force: true });
          setBattle(await getBattleDetail(battleId));
          return;
        } catch (e) {
          console.log('[HealthDataSync] battle detail force sync skipped:', e instanceof Error ? e.message : e);
        }
      }
      setBattle(detail);
    } catch (e: any) {
      Alert.alert('배틀', e?.response?.data?.detail ?? e?.message ?? '배틀 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [battleId]);

  useEffect(() => {
    loadBattle();
  }, [loadBattle]);

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

  const me = battle?.participants.find(p => p.me);
  const opponent = battle?.participants.find(p => !p.me);
  const meProfileImageUrl = myProfileImageUrl || resolveProfileImageUrl(me?.profileImageUrl);
  const opponentProfileImageUrl = resolveProfileImageUrl(opponent?.profileImageUrl);
  const duration = battle ? battleModeToDuration(battle.mode) : route.params.duration ?? '1d';
  const remainingSeconds = battle?.remainingSeconds ?? 0;
  const remainingHours = Math.max(0, Math.floor(remainingSeconds / 3600));
  const remainingMinutes = Math.max(0, Math.floor((remainingSeconds % 3600) / 60));
  const remainingTimeText = `${remainingHours}시간 ${remainingMinutes}분`;

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ChevronLeft size={20} color="#6b7280" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerSub}>{duration === '1d' ? '하루 배틀' : '주간 배틀'}</Text>
            <Text style={s.headerTitle}>배틀 진행 중</Text>
          </View>
          <View style={s.headerSpacer} />
        </View>

        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color="#ec4899" size="large" />
          </View>
        ) : (
          <View style={s.content}>
            <View style={s.battleCard}>
              <View style={s.vsBadgeWrap}>
                <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.vsBadge}>
                  <Text style={s.vsBadgeTxt}>VS</Text>
                </LinearGradient>
              </View>

              <View style={s.fighters}>
                <View style={s.fighter}>
                  <View style={[s.fighterImg, { borderColor: '#fbcfe8' }]}>
                    <ImageWithFallback uri={meProfileImageUrl} style={s.fighterImgInner} />
                  </View>
                  <Text style={s.fighterName} numberOfLines={1}>{me?.nickname ?? '나'}</Text>
                  <View style={s.myBadge}><Text style={s.myBadgeTxt}>{me?.score ?? battle?.score.myScore ?? 0} pts</Text></View>
                  <Text style={s.syncTxt} numberOfLines={1}>{formatSyncTime(me?.latestHealthSyncedAt ?? battle?.healthSync?.latestSyncedAt)}</Text>
                </View>

                <View style={s.vsCol}>
                  <View style={[s.divider, { backgroundColor: '#fbcfe8' }]} />
                  <Text style={s.vsText}>VS</Text>
                  <View style={[s.divider, { backgroundColor: '#bae6fd' }]} />
                </View>

                <View style={s.fighter}>
                  <View style={[s.fighterImg, { borderColor: '#bae6fd' }]}>
                    <ImageWithFallback uri={opponentProfileImageUrl} style={s.fighterImgInner} />
                  </View>
                  <Text style={s.fighterName} numberOfLines={1}>{opponent?.nickname ?? '상대'}</Text>
                  <View style={s.opBadge}><Text style={s.opBadgeTxt}>{opponent?.score ?? battle?.score.opponentScore ?? 0} pts</Text></View>
                  <Text style={s.syncTxt} numberOfLines={1}>{formatSyncTime(opponent?.latestHealthSyncedAt)}</Text>
                </View>
              </View>
            </View>

            <View style={s.statsCard}>
              {battle?.healthSync?.recommended && (
                <View style={s.syncNotice}>
                  <Text style={s.syncNoticeTxt}>최신 운동 기록을 다시 반영했어요.</Text>
                </View>
              )}
              <Text style={s.statsTitle}>남은 시간 {remainingTimeText}</Text>
              {(battle?.metrics ?? []).map(metric => (
                <StatRow key={metric.metricKey} metric={metric} />
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={s.ctaWrap}
              onPress={() => navigation.navigate('BattleResult', {
                battleId,
                duration,
              })}
            >
              <LinearGradient
                colors={['#ec4899', '#0ea5e9']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.cta}
              >
                <Text style={s.ctaTxt}>결과 보기</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerSpacer: { width: 36 },
  headerSub: { fontSize: 9, color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' },
  headerTitle: { color: '#111827', fontWeight: '900', fontSize: 16, marginTop: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, gap: 14 },
  battleCard: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 1.5, borderColor: '#f3f4f6', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 5 },
  vsBadgeWrap: { alignItems: 'center', marginBottom: 16 },
  vsBadge: { borderRadius: 99, paddingHorizontal: 16, paddingVertical: 5 },
  vsBadgeTxt: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  fighters: { flexDirection: 'row', alignItems: 'center' },
  fighter: { flex: 1, alignItems: 'center', gap: 8 },
  fighterImg: { width: 100, height: 120, borderRadius: 16, overflow: 'hidden', borderWidth: 2.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  fighterImgInner: { width: '100%', height: '100%' },
  fighterName: { fontSize: 14, fontWeight: '900', color: '#111827' },
  myBadge: { backgroundColor: '#fdf2f8', borderWidth: 1, borderColor: '#fbcfe8', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 2 },
  myBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#ec4899' },
  opBadge: { backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 2 },
  opBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#0ea5e9' },
  syncTxt: { maxWidth: 118, fontSize: 9, fontWeight: '700', color: '#9ca3af', textAlign: 'center' },
  vsCol: { alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  divider: { width: 2, height: 40, borderRadius: 99 },
  vsText: { fontSize: 30, fontWeight: '900', color: '#ec4899', lineHeight: 34 },
  statsCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: '#f3f4f6', padding: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
  syncNotice: { backgroundColor: '#f0f9ff', borderRadius: 12, borderWidth: 1, borderColor: '#bae6fd', paddingHorizontal: 12, paddingVertical: 9 },
  syncNoticeTxt: { fontSize: 11, fontWeight: '800', color: '#0284c7', textAlign: 'center' },
  statsTitle: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase' },
  statItem: { gap: 4 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  myStatVal: { fontSize: 11, fontWeight: '700', color: '#ec4899', width: 46, textAlign: 'right' },
  barWrap: { flex: 1, flexDirection: 'row' },
  barBg: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 99, overflow: 'hidden' },
  barRight: { transform: [{ scaleX: -1 }] },
  barFill: { height: '100%', borderRadius: 99 },
  opStatVal: { fontSize: 11, fontWeight: '700', color: '#0ea5e9', width: 46 },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af', textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase' },
  ctaWrap: { borderRadius: 16, overflow: 'hidden', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  cta: { paddingVertical: 16, alignItems: 'center' },
  ctaTxt: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
