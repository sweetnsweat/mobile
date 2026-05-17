import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { ScreenBackground } from '../../components/ScreenBackground';

type Props = NativeStackScreenProps<RootStackParamList, 'BattleResult'>;

const RESULT_STATS = [
  { label: '러닝',   myVal: '3km',  myPct: 60, opPct: 80, opVal: '5km'  },
  { label: '스쿼트', myVal: '50개', myPct: 75, opPct: 60, opVal: '40개' },
  { label: '푸시업', myVal: '30개', myPct: 50, opPct: 70, opVal: '42개' },
];

export function BattleResultScreen({ route, navigation }: Props) {
  const { myName, myImage, opponentName, opponentImage, won, duration } = route.params;
  const durationLabel = duration === '1d' ? '하루 배틀' : '주간 배틀';

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* 결과 헤더 */}
        <LinearGradient
          colors={won ? ['#ec4899', '#f472b6'] : ['#9ca3af', '#d1d5db']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.resultHeader}
        >
          <Text style={s.resultSub}>{durationLabel} 결과</Text>
          <Text style={s.resultEmoji}>{won ? '🏆' : '💪'}</Text>
          <Text style={s.resultTitle}>{won ? '승리!' : '패배'}</Text>
          <Text style={s.resultMsg}>{won ? '정말 대단해요! 🎉' : '다음엔 꼭 이길 거예요!'}</Text>
        </LinearGradient>

        <View style={s.content}>
          {/* 파이터 카드 */}
          <View style={s.battleCard}>
            <View style={s.fighters}>
              <View style={s.fighter}>
                <View style={[s.fighterImg, { borderColor: won ? '#fbcfe8' : '#e5e7eb' }]}>
                  <ImageWithFallback uri={myImage} style={s.fighterImgInner} />
                </View>
                <Text style={s.fighterName}>{myName}</Text>
                <View style={[s.resultChip, won ? s.chipWin : s.chipLose]}>
                  <Text style={[s.resultChipTxt, { color: won ? '#ec4899' : '#9ca3af' }]}>{won ? '🏆 승리' : '패배'}</Text>
                </View>
              </View>

              <View style={s.vsCol}>
                <View style={[s.divider, { backgroundColor: '#fbcfe8' }]} />
                <Text style={s.vsText}>VS</Text>
                <View style={[s.divider, { backgroundColor: '#bae6fd' }]} />
              </View>

              <View style={s.fighter}>
                <View style={[s.fighterImg, { borderColor: won ? '#e5e7eb' : '#bae6fd' }]}>
                  <ImageWithFallback uri={opponentImage} style={s.fighterImgInner} />
                </View>
                <Text style={s.fighterName}>{opponentName}</Text>
                <View style={[s.resultChip, won ? s.chipLose : s.chipWinBlue]}>
                  <Text style={[s.resultChipTxt, { color: won ? '#9ca3af' : '#0ea5e9' }]}>{won ? '패배' : '🏆 승리'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 스탯 카드 */}
          <View style={s.statsCard}>
            <Text style={s.statsTitle}>기록 비교</Text>
            {RESULT_STATS.map(stat => (
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

          {/* 버튼 */}
          <View style={s.btnRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={s.secondaryBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={s.secondaryBtnTxt}>홈으로</Text>
            </TouchableOpacity>
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
                <Text style={s.ctaTxt}>다시 도전 🔥</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  resultHeader: { paddingHorizontal: 24, paddingVertical: 22, alignItems: 'center', gap: 4 },
  resultSub: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  resultEmoji: { fontSize: 40, marginTop: 4 },
  resultTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  resultMsg: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 12, justifyContent: 'center' },

  battleCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: '#f3f4f6', padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 4 },
  fighters: { flexDirection: 'row', alignItems: 'center' },
  fighter: { flex: 1, alignItems: 'center', gap: 8 },
  fighterImg: { width: 88, height: 104, borderRadius: 16, overflow: 'hidden', borderWidth: 2.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 3 },
  fighterImgInner: { width: '100%', height: '100%' },
  fighterName: { fontSize: 14, fontWeight: '900', color: '#111827' },
  resultChip: { borderRadius: 99, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 3 },
  chipWin:     { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8' },
  chipLose:    { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' },
  chipWinBlue: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' },
  resultChipTxt: { fontSize: 11, fontWeight: '900' },

  vsCol: { alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  divider: { width: 2, height: 36, borderRadius: 99 },
  vsText: { fontSize: 26, fontWeight: '900', color: '#ec4899', lineHeight: 30 },

  statsCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: '#f3f4f6', padding: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
  statsTitle: { fontSize: 10, fontWeight: '700', color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase' },
  statItem: { gap: 3 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  myStatVal: { fontSize: 11, fontWeight: '700', color: '#ec4899', width: 32, textAlign: 'right' },
  barWrap: { flex: 1, flexDirection: 'row' },
  barBg: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 99, overflow: 'hidden' },
  barRight: { transform: [{ scaleX: -1 }] },
  barFill: { height: '100%', borderRadius: 99 },
  opStatVal: { fontSize: 11, fontWeight: '700', color: '#0ea5e9', width: 32 },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af', textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase' },

  btnRow: { flexDirection: 'row', gap: 10 },
  secondaryBtn: { flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingVertical: 15 },
  secondaryBtnTxt: { fontSize: 14, fontWeight: '900', color: '#6b7280' },
  ctaWrap: { flex: 2, borderRadius: 14, overflow: 'hidden', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  cta: { paddingVertical: 15, alignItems: 'center' },
  ctaTxt: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
