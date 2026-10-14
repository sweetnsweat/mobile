import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Flame, Trophy } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenBackground } from '../components/ScreenBackground';
import { BottomNav } from '../components/BottomNav';
import {
  getWeeklyActivityRankingsFull,
  WeeklyActivityRankingsResponse,
} from '../services/HomeService';

type Props = NativeStackScreenProps<RootStackParamList, 'ActivityRankingDetail'>;

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
const PODIUM_COLORS: Record<number, [string, string]> = {
  1: ['#facc15', '#d97706'],
  2: ['#d1d5db', '#9ca3af'],
  3: ['#fda4af', '#fb7185'],
};
const AVATAR_COLORS: [string, string][] = [
  ['#ec4899', '#f472b6'],
  ['#38bdf8', '#60a5fa'],
  ['#a78bfa', '#818cf8'],
  ['#34d399', '#10b981'],
  ['#fb923c', '#f59e0b'],
];

function avatarColors(rank: number): [string, string] {
  return AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length];
}

function formatWeekRange(start: string, end: string): string {
  const fmt = (d: string) => {
    const parts = d.split('-');
    if (parts.length !== 3) return d;
    return `${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
  };
  return `${fmt(start)} ~ ${fmt(end)}`;
}

export function ActivityRankingDetailScreen({ navigation }: Props) {
  const [data, setData] = useState<WeeklyActivityRankingsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    loadRankings();
  }, []));

  async function loadRankings() {
    setLoading(true);
    try {
      const result = await getWeeklyActivityRankingsFull(100);
      setData(result);
    } catch (e) {
      console.log('[ActivityRankingAPI] loadRankings error:', e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const rankings = data?.rankings ?? [];
  const showPodium = rankings.length >= 3;
  const top1 = rankings[0];
  const top2 = rankings[1];
  const top3 = rankings[2];
  const weekRange = data ? formatWeekRange(data.weekStartDate, data.weekEndDate) : '';

  return (
    <ScreenBackground end={{ x: 0, y: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ChevronLeft size={16} color="#4b5563" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={s.headerText}>
            <Text style={s.headerSub}>Leaderboard</Text>
            <View style={s.headerTitleRow}>
              <Trophy size={16} color="#fb923c" strokeWidth={2.5} />
              <Text style={s.headerTitle}>이번 주 랭킹</Text>
            </View>
            {weekRange ? <Text style={s.headerWeek}>{weekRange}</Text> : null}
          </View>
        </View>

        {/* Scroll body */}
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={s.loadingRow}>
              <ActivityIndicator color="#ec4899" size="small" />
              <Text style={s.loadingTxt}>랭킹을 불러오는 중...</Text>
            </View>
          )}

          {/* TOP 3 podium */}
          {showPodium && (
            <View style={s.podiumWrap}>
              {/* 2nd */}
              <View style={s.podiumItem}>
                <LinearGradient colors={avatarColors(top2.rank)} style={[s.podiumAvatar, s.podiumAvatarMd]}>
                  <Text style={s.podiumAvatarTxt}>{top2.nickname.charAt(0)}</Text>
                </LinearGradient>
                <LinearGradient colors={PODIUM_COLORS[2]} style={[s.podiumLabel, { minWidth: 76 }]}>
                  <Text style={s.podiumRankTxt}>🥈 2위</Text>
                  <Text style={s.podiumNameTxt} numberOfLines={1}>{top2.nickname}</Text>
                  <View style={s.podiumScoreRow}>
                    <Flame size={9} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
                    <Text style={s.podiumScoreTxt}>{top2.weeklyExp.toLocaleString()}</Text>
                  </View>
                </LinearGradient>
              </View>

              {/* 1st */}
              <View style={[s.podiumItem, { marginTop: -16 }]}>
                <Text style={s.crownEmoji}>👑</Text>
                <LinearGradient colors={avatarColors(top1.rank)} style={[s.podiumAvatar, s.podiumAvatarLg]}>
                  <Text style={[s.podiumAvatarTxt, { fontSize: 24 }]}>{top1.nickname.charAt(0)}</Text>
                </LinearGradient>
                <LinearGradient colors={PODIUM_COLORS[1]} style={[s.podiumLabel, { minWidth: 84 }]}>
                  <Text style={s.podiumRankTxt}>🥇 1위</Text>
                  <Text style={s.podiumNameTxt} numberOfLines={1}>{top1.nickname}</Text>
                  <View style={s.podiumScoreRow}>
                    <Flame size={9} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
                    <Text style={s.podiumScoreTxt}>{top1.weeklyExp.toLocaleString()}</Text>
                  </View>
                </LinearGradient>
              </View>

              {/* 3rd */}
              <View style={s.podiumItem}>
                <LinearGradient colors={avatarColors(top3.rank)} style={[s.podiumAvatar, s.podiumAvatarMd]}>
                  <Text style={s.podiumAvatarTxt}>{top3.nickname.charAt(0)}</Text>
                </LinearGradient>
                <LinearGradient colors={PODIUM_COLORS[3]} style={[s.podiumLabel, { minWidth: 76 }]}>
                  <Text style={s.podiumRankTxt}>🥉 3위</Text>
                  <Text style={s.podiumNameTxt} numberOfLines={1}>{top3.nickname}</Text>
                  <View style={s.podiumScoreRow}>
                    <Flame size={9} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
                    <Text style={s.podiumScoreTxt}>{top3.weeklyExp.toLocaleString()}</Text>
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* Full ranked list */}
          {!loading && rankings.length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyEmoji}>🏆</Text>
              <Text style={s.emptyTxt}>이번 주 랭킹 데이터가 없습니다</Text>
            </View>
          ) : (
            <View style={s.listCard}>
              {rankings.map((r, i) => (
                <View
                  key={r.userId}
                  style={[s.rankRow, i < rankings.length - 1 && s.rowBorder, r.isMe && s.rankRowMe]}
                >
                  <View style={s.rankLeft}>
                    {MEDAL[r.rank] ? (
                      <Text style={s.medal}>{MEDAL[r.rank]}</Text>
                    ) : (
                      <View style={s.rankNumWrap}>
                        <Text style={s.rankNum}>{r.rank}</Text>
                      </View>
                    )}
                  </View>
                  <LinearGradient colors={avatarColors(r.rank)} style={s.listAvatar}>
                    <Text style={s.listAvatarTxt}>{r.nickname.charAt(0)}</Text>
                  </LinearGradient>
                  <Text style={[s.rankName, r.isMe && s.rankNameMe]} numberOfLines={1}>
                    {r.isMe ? `나 (${r.nickname})` : r.nickname}
                  </Text>
                  <View style={s.scoreRow}>
                    <Flame size={14} color="#fb923c" strokeWidth={2.5} />
                    <Text style={[s.scoreTxt, r.isMe && s.scoreTxtMe]}>{r.weeklyExp.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 8 }} />
        </ScrollView>

        <BottomNav active="home" navigation={navigation} />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backBtn: { width: 32, height: 32, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1, flexShrink: 0 },
  headerText: { flex: 1 },
  headerSub: { fontSize: 10, fontWeight: '700', color: '#9ca3af', letterSpacing: 3, textTransform: 'uppercase' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#111827', letterSpacing: -0.3 },
  headerWeek: { fontSize: 11, fontWeight: '700', color: '#fb923c', marginTop: 2 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 16 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10 },
  loadingTxt: { fontSize: 12, fontWeight: '700', color: '#9ca3af' },

  podiumWrap: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  podiumItem: { alignItems: 'center', gap: 6 },
  crownEmoji: { fontSize: 22 },
  podiumAvatar: { borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  podiumAvatarMd: { width: 52, height: 52 },
  podiumAvatarLg: { width: 68, height: 68 },
  podiumAvatarTxt: { fontSize: 20, fontWeight: '900', color: '#fff' },
  podiumLabel: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', gap: 2 },
  podiumRankTxt: { fontSize: 9, fontWeight: '900', color: '#fff' },
  podiumNameTxt: { fontSize: 11, fontWeight: '900', color: '#fff', maxWidth: 76, textAlign: 'center' },
  podiumScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  podiumScoreTxt: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTxt: { fontSize: 13, fontWeight: '700', color: '#d1d5db' },

  listCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rankRowMe: { backgroundColor: '#fdf2f8' },
  rankLeft: { width: 32, alignItems: 'center' },
  medal: { fontSize: 20 },
  rankNumWrap: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  rankNum: { fontSize: 12, fontWeight: '900', color: '#6b7280' },
  listAvatar: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  listAvatarTxt: { fontSize: 16, fontWeight: '900', color: '#fff' },
  rankName: { flex: 1, fontSize: 14, fontWeight: '900', color: '#1f2937' },
  rankNameMe: { color: '#db2777' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreTxt: { fontSize: 14, fontWeight: '900', color: '#374151' },
  scoreTxtMe: { color: '#db2777' },
});
