import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trophy } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BadgeArtwork } from '../../components/BadgeArtwork';
import { getMyBadges, UserBadge } from '../../services/UserService';

type Props = NativeStackScreenProps<RootStackParamList, 'BadgeList'>;

export function BadgeListScreen({ navigation }: Props) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [earnedCount, setEarnedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let alive = true;
    setLoading(true);

    getMyBadges()
      .then(data => {
        if (!alive) return;
        setBadges(data.badges);
        setEarnedCount(data.earnedCount);
        setTotalCount(data.totalCount);
      })
      .catch(() => {
        if (!alive) return;
        setBadges([]);
        setEarnedCount(0);
        setTotalCount(0);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []));

  return (
    <ScreenBackground end={{ x: 0, y: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.75}>
            <ChevronLeft size={18} color="#4b5563" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerSub}>Achievements</Text>
            <Text style={s.headerTitle}>전체 배지</Text>
          </View>
          <View style={s.countBadge}>
            <Text style={s.countTxt}>{earnedCount}/{totalCount}</Text>
          </View>
        </View>

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator color="#ec4899" size="large" />
          </View>
        ) : (
          <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            {badges.length === 0 ? (
              <View style={s.emptyCard}>
                <Trophy size={28} color="#d1d5db" strokeWidth={2.5} />
                <Text style={s.emptyTitle}>표시할 배지가 없습니다</Text>
              </View>
            ) : badges.map(badge => (
              <View key={badge.badgeCode} style={[s.badgeCard, !badge.earned && s.badgeCardLocked]}>
                <LinearGradient
                  colors={badge.earned ? ['#f472b6', '#38bdf8'] : ['#e5e7eb', '#f3f4f6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.badgeIcon}
                >
                  <BadgeArtwork badgeCode={badge.badgeCode} earned={badge.earned} size={52} />
                </LinearGradient>

                <View style={s.badgeInfo}>
                  <View style={s.badgeTitleRow}>
                    <Text style={[s.badgeName, !badge.earned && s.badgeNameLocked]}>{badge.name}</Text>
                    <View style={[s.stateChip, badge.earned ? s.stateChipEarned : s.stateChipLocked]}>
                      <Text style={[s.stateTxt, badge.earned ? s.stateTxtEarned : s.stateTxtLocked]}>
                        {badge.earned ? '획득' : '잠금'}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.badgeCriteria}>{badge.criteria ?? badge.description ?? ''}</Text>
                  {badge.earnedAt ? <Text style={s.earnedAt}>획득일 {badge.earnedAt.slice(0, 10)}</Text> : null}
                </View>
              </View>
            ))}
            <View style={{ height: 16 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  headerCenter: { alignItems: 'center' },
  headerSub: { fontSize: 9, fontWeight: '700', color: '#9ca3af', letterSpacing: 3, textTransform: 'uppercase' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  countBadge: { minWidth: 42, height: 32, borderRadius: 12, backgroundColor: '#fdf2f8', borderWidth: 1, borderColor: '#fbcfe8', alignItems: 'center', justifyContent: 'center' },
  countTxt: { fontSize: 12, fontWeight: '900', color: '#ec4899' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  emptyCard: { minHeight: 160, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontSize: 13, fontWeight: '800', color: '#9ca3af' },
  badgeCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  badgeCardLocked: { opacity: 0.72 },
  badgeIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  badgeImg: { width: '100%', height: '100%' },
  badgeInfo: { flex: 1, gap: 4 },
  badgeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badgeName: { flex: 1, fontSize: 14, fontWeight: '900', color: '#111827' },
  badgeNameLocked: { color: '#6b7280' },
  badgeCriteria: { fontSize: 11, fontWeight: '600', color: '#9ca3af', lineHeight: 16 },
  earnedAt: { fontSize: 10, fontWeight: '700', color: '#0ea5e9' },
  stateChip: { borderRadius: 99, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  stateChipEarned: { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8' },
  stateChipLocked: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
  stateTxt: { fontSize: 10, fontWeight: '900' },
  stateTxtEarned: { color: '#ec4899' },
  stateTxtLocked: { color: '#9ca3af' },
});
