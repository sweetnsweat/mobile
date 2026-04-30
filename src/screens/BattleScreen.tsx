import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { ScreenBackground } from '../components/ScreenBackground';

type Props = NativeStackScreenProps<RootStackParamList, 'Battle'>;

const DEFAULT_STATS = [
  { label: '러닝',  myVal: '3km',  myPct: 60, opPct: 80, opVal: '5km'  },
  { label: '스쿼트', myVal: '50개', myPct: 75, opPct: 60, opVal: '40개' },
  { label: '푸시업', myVal: '30개', myPct: 50, opPct: 70, opVal: '42개' },
];

export function BattleScreen({ route }: Props) {
  const {
    myName = '김수연',
    myImage = '',
    opponentName = '민수 선배',
    opponentImage = '',
  } = route.params ?? {};

  return (
    <ScreenBackground end={{ x: 0, y: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
          <Text style={s.headerSub}>Weekly Battle</Text>
          <Text style={s.headerTitle}>주간 기록 대결</Text>
        </LinearGradient>

        {/* Content */}
        <View style={s.content}>
          {/* Battle card */}
          <View style={s.battleCard}>
            <View style={s.fighters}>
              {/* My character */}
              <View style={s.fighter}>
                <View style={[s.fighterImg, { borderColor: '#fbcfe8' }]}>
                  <ImageWithFallback uri={myImage} style={s.fighterImgInner} />
                </View>
                <View style={s.fighterInfo}>
                  <Text style={s.fighterName}>{myName}</Text>
                  <View style={s.myBadge}><Text style={s.myBadgeTxt}>나</Text></View>
                </View>
              </View>

              {/* VS */}
              <View style={s.vsCol}>
                <View style={s.vsDividerTop} />
                <Text style={s.vsText}>VS</Text>
                <Text style={s.vsSword}>⚔️</Text>
                <View style={s.vsDividerBot} />
              </View>

              {/* Opponent */}
              <View style={s.fighter}>
                <View style={[s.fighterImg, { borderColor: '#bae6fd' }]}>
                  <ImageWithFallback uri={opponentImage} style={s.fighterImgInner} />
                </View>
                <View style={s.fighterInfo}>
                  <Text style={s.fighterName}>{opponentName}</Text>
                  <View style={s.opBadge}><Text style={s.opBadgeTxt}>상대</Text></View>
                </View>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={s.statsCard}>
            <Text style={s.statsTitle}>이번 주 기록</Text>
            {DEFAULT_STATS.map(stat => (
              <View key={stat.label} style={s.statItem}>
                <View style={s.statRow}>
                  <Text style={s.myStatVal}>{stat.myVal}</Text>
                  <View style={s.barWrap}>
                    <View style={s.barBg}>
                      <LinearGradient
                        colors={['#ec4899', '#f9a8d4']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[s.barFill, { width: `${stat.myPct}%` }]}
                      />
                    </View>
                    <View style={[s.barBg, s.barRight]}>
                      <LinearGradient
                        colors={['#0ea5e9', '#7dd3fc']}
                        start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}
                        style={[s.barFill, { width: `${stat.opPct}%` }]}
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
          <TouchableOpacity activeOpacity={0.85} style={s.ctaWrap}>
            <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.cta}>
              <Text style={s.ctaTxt}>도전하기 🔥</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: { paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: '#0284c7' },
  headerSub: { fontSize: 10, color: '#fce7f3', letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700', marginBottom: 4 },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 20, letterSpacing: -0.3 },

  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, gap: 16 },

  battleCard: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 2, borderColor: '#f3f4f6', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 },
  fighters: { flexDirection: 'row', alignItems: 'center' },
  fighter: { flex: 1, alignItems: 'center', gap: 10 },
  fighterImg: { width: 110, height: 130, borderRadius: 16, overflow: 'hidden', borderWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  fighterImgInner: { width: '100%', height: '100%' },
  fighterInfo: { alignItems: 'center', gap: 4 },
  fighterName: { fontSize: 15, fontWeight: '900', color: '#111827', letterSpacing: -0.3 },
  myBadge: { backgroundColor: '#fdf2f8', borderWidth: 1, borderColor: '#fbcfe8', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 2 },
  myBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#ec4899', letterSpacing: 0.5 },
  opBadge: { backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 2 },
  opBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#0ea5e9', letterSpacing: 0.5 },

  vsCol: { alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  vsDividerTop: { width: 2, height: 48, backgroundColor: '#fbcfe8' },
  vsText: { fontSize: 36, fontWeight: '900', color: '#ec4899', lineHeight: 40 },
  vsSword: { fontSize: 18 },
  vsDividerBot: { width: 2, height: 48, backgroundColor: '#bae6fd' },

  statsCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#f3f4f6', padding: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  statsTitle: { fontSize: 11, fontWeight: '700', color: 'rgba(0,0,0,0.35)', letterSpacing: 2, textTransform: 'uppercase' },
  statItem: { gap: 4 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  myStatVal: { fontSize: 11, fontWeight: '700', color: '#ec4899', width: 32, textAlign: 'right' },
  barWrap: { flex: 1, flexDirection: 'row', gap: 0 },
  barBg: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 99, overflow: 'hidden' },
  barRight: { transform: [{ scaleX: -1 }] },
  barFill: { height: '100%', borderRadius: 99 },
  opStatVal: { fontSize: 11, fontWeight: '700', color: '#0ea5e9', width: 32 },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af', textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase' },

  ctaWrap: { borderRadius: 16, overflow: 'hidden', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  cta: { paddingVertical: 16, alignItems: 'center' },
  ctaTxt: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: -0.3 },
});
