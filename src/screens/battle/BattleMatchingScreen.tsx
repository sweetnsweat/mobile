import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, StatusBar, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenBackground } from '../../components/ScreenBackground';
import { durationToBattleMode, matchBattle } from '../../services/BattleService';

type Props = NativeStackScreenProps<RootStackParamList, 'BattleMatching'>;

export function BattleMatchingScreen({ navigation, route }: Props) {
  const { duration } = route.params;
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const scale3 = useRef(new Animated.Value(1)).current;
  const op1 = useRef(new Animated.Value(0.5)).current;
  const op2 = useRef(new Animated.Value(0.35)).current;
  const op3 = useRef(new Animated.Value(0.2)).current;

  const isDay = duration === '1d';
  const accentColor = isDay ? '#ec4899' : '#0ea5e9';
  const gradientColors: [string, string] = isDay ? ['#ec4899', '#f472b6'] : ['#0ea5e9', '#38bdf8'];
  const durationLabel = isDay ? '하루 배틀' : '주간 배틀';

  useEffect(() => {
    function makeRipple(scale: Animated.Value, opacity: Animated.Value, delay: number) {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale,   { toValue: 1.6, duration: 1400, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0,   duration: 1400, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale,   { toValue: 1,   duration: 0, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.4, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );
    }
    const l1 = makeRipple(scale1, op1, 0);
    const l2 = makeRipple(scale2, op2, 460);
    const l3 = makeRipple(scale3, op3, 920);
    l1.start(); l2.start(); l3.start();
    return () => { l1.stop(); l2.stop(); l3.stop(); };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startMatching() {
      try {
        const battle = await matchBattle(durationToBattleMode(duration));
        if (!cancelled) {
          navigation.replace('Battle', {
            battleId: battle.battleId,
            duration,
          });
        }
      } catch (e: any) {
        if (cancelled) return;
        const code = e?.response?.data?.code;
        Alert.alert(
          '배틀',
          code === 'BATTLE_OPPONENT_NOT_FOUND'
            ? '지금은 매칭 가능한 상대가 없어요. 잠시 뒤 다시 시도해주세요.'
            : e?.response?.data?.detail ?? e?.message ?? '배틀 매칭에 실패했습니다.',
          [{ text: '확인', onPress: () => navigation.goBack() }],
        );
      }
    }

    startMatching();
    return () => { cancelled = true; };
  }, [duration, navigation]);

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          {/* 리플 링 */}
          <View style={s.ringWrap}>
            <Animated.View style={[s.ring, { transform: [{ scale: scale3 }], opacity: op3, borderColor: accentColor }]} />
            <Animated.View style={[s.ring, { transform: [{ scale: scale2 }], opacity: op2, borderColor: accentColor }]} />
            <Animated.View style={[s.ring, { transform: [{ scale: scale1 }], opacity: op1, borderColor: accentColor }]} />
            <View style={[s.centerCircleOuter, { shadowColor: accentColor }]}>
              <LinearGradient colors={gradientColors} style={s.centerCircle}>
                <Text style={s.centerEmoji}>VS</Text>
              </LinearGradient>
            </View>
          </View>

          {/* 기간 배지 */}
          <View style={[s.durationBadge, isDay ? s.durationBadgePink : s.durationBadgeBlue]}>
            <Text style={[s.durationBadgeTxt, { color: accentColor }]}>{durationLabel}</Text>
          </View>

          <View style={s.textWrap}>
            <Text style={s.mainText}>상대를 찾고 있어요...</Text>
            <Text style={s.subText}>비슷한 점수의 상대와 연결 중입니다.</Text>
          </View>

          {/* 도트 로더 */}
          <View style={s.dotsWrap}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[s.dot, { backgroundColor: accentColor, opacity: 0.3 + i * 0.25 }]} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const RING_SIZE = 180;

const s = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },

  ringWrap: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, borderWidth: 2 },
  centerCircleOuter: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  centerCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  centerEmoji: { fontSize: 30 },

  durationBadge: { borderRadius: 99, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 6 },
  durationBadgePink: { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8' },
  durationBadgeBlue: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' },
  durationBadgeTxt: { fontSize: 13, fontWeight: '900' },

  textWrap: { alignItems: 'center', gap: 6 },
  mainText: { fontSize: 20, fontWeight: '900', color: '#111827', letterSpacing: -0.3 },
  subText: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },

  dotsWrap: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
