import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { ScreenBackground } from '../../components/ScreenBackground';

type Props = NativeStackScreenProps<RootStackParamList, 'Battle'>;

const DEFAULT_STATS = [
  { label: '러닝',   myVal: '3km',  myPct: 60, opPct: 80, opVal: '5km'  },
  { label: '스쿼트', myVal: '50개', myPct: 75, opPct: 60, opVal: '40개' },
  { label: '푸시업', myVal: '30개', myPct: 50, opPct: 70, opVal: '42개' },
];

export function BattleScreen({ route, navigation }: Props) {
  const {
    myName = '김수연',
    myImage = '',
    opponentName = '민수 선배',
    opponentImage = '',
    duration = '7d',
  } = route.params ?? {};

  const statsTitle = duration === '1d' ? '오늘의 기록' : '이번 주 기록';

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* 헤더 */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ChevronLeft size={20} color="#6b7280" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerSub}>{duration === '1d' ? 'DAILY BATTLE' : 'WEEKLY BATTLE'}</Text>
            <Text style={s.headerTitle}>{duration === '1d' ? '하루 기록 대결 ⚡' : '주간 기록 대결 🗓️'}</Text>
          </View>
          <View style={s.headerSpacer} />
        </View>

        <View style={s.content}>
          {/* 배틀 카드 */}
          <View style={s.battleCard}>
            {/* 상단 VS 배지 */}
            <View style={s.vsBadgeWrap}>
              <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.vsBadge}>
                <Text style={s.vsBadgeTxt}>VS ⚔️</Text>
              </LinearGradient>
            </View>

            <View style={s.fighters}>
              {/* 나 */}
              <View style={s.fighter}>
                <View style={[s.fighterImg, { borderColor: '#fbcfe8' }]}>
                  <ImageWithFallback uri={myImage} style={s.fighterImgInner} />
                </View>
                <Text style={s.fighterName}>{myName}</Text>
                <View style={s.myBadge}><Text style={s.myBadgeTxt}>나</Text></View>
              </View>

              {/* VS 구분선 */}
              <View style={s.vsCol}>
                <View style={[s.divider, { backgroundColor: '#fbcfe8' }]} />
                <Text style={s.vsText}>VS</Text>
                <View style={[s.divider, { backgroundColor: '#bae6fd' }]} />
              </View>

              {/* 상대 */}
              <View style={s.fighter}>
                <View style={[s.fighterImg, { borderColor: '#bae6fd' }]}>
                  <ImageWithFallback uri={opponentImage} style={s.fighterImgInner} />
                </View>
                <Text style={s.fighterName}>{opponentName}</Text>
                <View style={s.opBadge}><Text style={s.opBadgeTxt}>상대</Text></View>
              </View>
            </View>
          </View>

          {/* 스탯 카드 */}
          <View style={s.statsCard}>
            <Text style={s.statsTitle}>{statsTitle}</Text>
            {DEFAULT_STATS.map(stat => (
              <View key={stat.label} style={s.statItem}>
                <View style={s.statRow}>
                  <Text style={s.myStatVal}>{stat.myVal}</Text>
                  <View style={s.barWrap}>
                    <View style={s.barBg}>
                      <LinearGradient
                        colors={['#ec4899', '#f9a8d4']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[s.barFill, { width: `${stat.myPct}%` as any }]}
                      />
                    </View>
                    <View style={[s.barBg, s.barRight]}>
                      <LinearGradient
                        colors={['#0ea5e9', '#7dd3fc']}
                        start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}
                        style={[s.barFill, { width: `${stat.opPct}%` as any }]}
                      />
                    </View>
                  </View>
                  <Text style={s.opStatVal}>{stat.opVal}</Text>
                </View>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={s.ctaWrap}
            onPress={() => navigation.navigate('BattleResult', {
              myName, myImage, opponentName, opponentImage, duration, won: true,
            })}
          >
            <LinearGradient
              colors={['#ec4899', '#0ea5e9']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.cta}
            >
              <Text style={s.ctaTxt}>결과 보기 🏆</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  headerTitle: { color: '#111827', fontWeight: '900', fontSize: 16, letterSpacing: -0.3, marginTop: 1 },

  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, gap: 14 },

  battleCard: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 1.5, borderColor: '#f3f4f6', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 5 },
  vsBadgeWrap: { alignItems: 'center', marginBottom: 16 },
  vsBadge: { borderRadius: 99, paddingHorizontal: 16, paddingVertical: 5 },
  vsBadgeTxt: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  fighters: { flexDirection: 'row', alignItems: 'center' },
  fighter: { flex: 1, alignItems: 'center', gap: 8 },
  fighterImg: { width: 100, height: 120, borderRadius: 16, overflow: 'hidden', borderWidth: 2.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  fighterImgInner: { width: '100%', height: '100%' },
  fighterName: { fontSize: 14, fontWeight: '900', color: '#111827', letterSpacing: -0.3 },
  myBadge: { backgroundColor: '#fdf2f8', borderWidth: 1, borderColor: '#fbcfe8', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 2 },
  myBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#ec4899', letterSpacing: 0.5 },
  opBadge: { backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 2 },
  opBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#0ea5e9', letterSpacing: 0.5 },

  vsCol: { alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  divider: { width: 2, height: 40, borderRadius: 99 },
  vsText: { fontSize: 30, fontWeight: '900', color: '#ec4899', lineHeight: 34 },

  statsCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: '#f3f4f6', padding: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
  statsTitle: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase' },
  statItem: { gap: 4 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  myStatVal: { fontSize: 11, fontWeight: '700', color: '#ec4899', width: 32, textAlign: 'right' },
  barWrap: { flex: 1, flexDirection: 'row' },
  barBg: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 99, overflow: 'hidden' },
  barRight: { transform: [{ scaleX: -1 }] },
  barFill: { height: '100%', borderRadius: 99 },
  opStatVal: { fontSize: 11, fontWeight: '700', color: '#0ea5e9', width: 32 },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af', textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase' },

  ctaWrap: { borderRadius: 16, overflow: 'hidden', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  cta: { paddingVertical: 16, alignItems: 'center' },
  ctaTxt: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: -0.3 },
});
