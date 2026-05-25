import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swords, Zap, Calendar, Trophy, TrendingUp, Shield } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BottomNav } from '../../components/BottomNav';
import { battleModeToDuration, BattleSummary, durationToBattleMode, getBattleSummary } from '../../services/BattleService';
import { syncHealthDataWithServerIfStale } from '../../services/HealthConnectService';

type Props = NativeStackScreenProps<RootStackParamList, 'BattleLobby'>;
type Duration = '1d' | '7d';

export function BattleLobbyScreen({ navigation }: Props) {
  const [duration, setDuration] = useState<Duration>('1d');
  const [summary, setSummary] = useState<BattleSummary | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadSummary() {
    setLoading(true);
    try {
      try {
        await syncHealthDataWithServerIfStale();
      } catch (e) {
        console.log('[HealthDataSync] battle lobby skipped:', e instanceof Error ? e.message : e);
      }
      setSummary(await getBattleSummary());
    } catch (e: any) {
      Alert.alert('배틀', e?.response?.data?.detail ?? e?.message ?? '배틀 요약을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadSummary);
    return unsubscribe;
  }, [navigation]);

  const selectedBattle =
    durationToBattleMode(duration) === 'DAILY'
      ? summary?.currentDailyBattle
      : summary?.currentWeeklyBattle;

  function handleBattlePress() {
    if (selectedBattle) {
      navigation.navigate('Battle', {
        battleId: selectedBattle.battleId,
        duration: battleModeToDuration(selectedBattle.mode),
      });
      return;
    }

    navigation.navigate('BattleMatching', { duration });
  }

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.topBar}>
          <View>
            <Text style={s.topBarSub}>BATTLE</Text>
            <Text style={s.topBarTitle}>배틀</Text>
          </View>
          <View style={s.topBarIcon}>
            <Swords size={18} color="#ec4899" strokeWidth={2.5} />
          </View>
        </View>

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 랭크 카드 */}
          <View style={s.rankCard}>
            <View style={s.rankCardTop}>
              <View style={s.rankBadgeWrap}>
                <LinearGradient colors={['#ec4899', '#0ea5e9']} style={s.rankBadge}>
                  <Shield size={20} color="#fff" strokeWidth={2.5} />
                </LinearGradient>
              </View>
              <View style={s.rankInfo}>
                <Text style={s.rankLabel}>나의 배틀 랭크</Text>
                <Text style={s.rankName}>{summary?.rankName ?? 'Unranked'}</Text>
                <Text style={s.rankSub}>첫 배틀을 시작해보세요.</Text>
              </View>
            </View>

            <View style={s.rankDivider} />

            <View style={s.statsRow}>
              <View style={s.statChip}>
                <Trophy size={13} color="#facc15" strokeWidth={2.5} />
                <Text style={s.statNum}>{summary?.wins ?? 0}</Text>
                <Text style={s.statLabel}>승</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statChip}>
                <Zap size={13} color="#9ca3af" strokeWidth={2.5} />
                <Text style={s.statNum}>{summary?.losses ?? 0}</Text>
                <Text style={s.statLabel}>패</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statChip}>
                <TrendingUp size={13} color="#34d399" strokeWidth={2.5} />
                <Text style={s.statNum}>{summary?.winRate ?? 0}%</Text>
                <Text style={s.statLabel}>승률</Text>
              </View>
            </View>
          </View>

          {/* 모드 선택 */}
          <Text style={s.sectionLabel}>배틀 기간 선택</Text>
          <View style={s.durationWrap}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[s.durationCard, duration === '1d' && s.durationCardActivePink]}
              onPress={() => setDuration('1d')}
            >
              <LinearGradient
                colors={duration === '1d' ? ['#ec4899', '#f472b6'] : ['#f3f4f6', '#f9fafb']}
                style={s.durationIconWrap}
              >
                <Zap size={20} color={duration === '1d' ? '#fff' : '#9ca3af'} strokeWidth={2.5} />
              </LinearGradient>
              <Text style={[s.durationTitle, duration === '1d' && { color: '#db2777' }]}>하루 배틀</Text>
              <Text style={s.durationDesc}>오늘 하루 기록으로 승부</Text>
              {duration === '1d' && (
                <View style={s.checkBadge}>
                  <Text style={s.checkBadgeTxt}>선택</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[s.durationCard, duration === '7d' && s.durationCardActiveBlue]}
              onPress={() => setDuration('7d')}
            >
              <LinearGradient
                colors={duration === '7d' ? ['#0ea5e9', '#38bdf8'] : ['#f3f4f6', '#f9fafb']}
                style={s.durationIconWrap}
              >
                <Calendar size={20} color={duration === '7d' ? '#fff' : '#9ca3af'} strokeWidth={2.5} />
              </LinearGradient>
              <Text style={[s.durationTitle, duration === '7d' && { color: '#0284c7' }]}>주간 배틀</Text>
              <Text style={s.durationDesc}>7일 누적 기록으로 승부</Text>
              {duration === '7d' && (
                <View style={[s.checkBadge, { backgroundColor: '#e0f2fe', borderColor: '#7dd3fc' }]}>
                  <Text style={[s.checkBadgeTxt, { color: '#0284c7' }]}>선택</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* CTA */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={s.ctaWrap}
            onPress={handleBattlePress}
            disabled={loading}
          >
            <LinearGradient
              colors={duration === '1d' ? ['#ec4899', '#f472b6'] : ['#0ea5e9', '#38bdf8']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.cta}
            >
              <Swords size={18} color="#fff" strokeWidth={2.5} />
              <Text style={s.ctaTxt}>{selectedBattle ? '이어하기' : '매칭 시작하기'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        <BottomNav active="battle" navigation={navigation} />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  topBarSub: { fontSize: 9, fontWeight: '700', color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase' },
  topBarTitle: { fontSize: 22, fontWeight: '900', color: '#111827', letterSpacing: -0.3 },
  topBarIcon: { width: 38, height: 38, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#fbcfe8', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },

  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 },

  /* 랭크 카드 */
  rankCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: '#f3f4f6', padding: 16, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 4 },
  rankCardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rankBadgeWrap: { shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  rankBadge: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rankInfo: { flex: 1, gap: 2 },
  rankLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.5, textTransform: 'uppercase' },
  rankName: { fontSize: 20, fontWeight: '900', color: '#111827', letterSpacing: -0.3 },
  rankSub: { fontSize: 11, fontWeight: '600', color: '#9ca3af' },
  rankDivider: { height: 1, backgroundColor: '#f3f4f6' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statChip: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 20, fontWeight: '900', color: '#111827' },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 32, backgroundColor: '#f3f4f6' },

  /* 기간 카드 */
  durationWrap: { flexDirection: 'row', gap: 10 },
  durationCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: '#f3f4f6', padding: 16, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  durationCardActivePink: { borderColor: '#fbcfe8', backgroundColor: '#fdf2f8' },
  durationCardActiveBlue: { borderColor: '#bae6fd', backgroundColor: '#f0f9ff' },
  durationIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  durationTitle: { fontSize: 14, fontWeight: '900', color: '#374151' },
  durationDesc: { fontSize: 10, fontWeight: '600', color: '#9ca3af', textAlign: 'center' },
  checkBadge: { borderRadius: 99, borderWidth: 1, backgroundColor: '#fdf2f8', borderColor: '#fbcfe8', paddingHorizontal: 10, paddingVertical: 2 },
  checkBadgeTxt: { fontSize: 11, fontWeight: '900', color: '#ec4899' },

  /* CTA */
  ctaWrap: { borderRadius: 16, overflow: 'hidden', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6, marginTop: 4 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  ctaTxt: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: -0.3 },
});
