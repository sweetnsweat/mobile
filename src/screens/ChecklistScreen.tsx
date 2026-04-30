import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, MessageCircle, Heart, Zap, Brain, TrendingUp } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { GradientText } from '../components/GradientText';
import { ScreenBackground } from '../components/ScreenBackground';
import { useBounceAnimation } from '../hooks/useBounceAnimation';

type Props = NativeStackScreenProps<RootStackParamList, 'Checklist'>;

const CONDITIONS = [
  { value: 'great',  label: '최고', emoji: '😄', borderColor: '#84cc16', bgColor: '#f7fee7' },
  { value: 'good',   label: '좋음', emoji: '😊', borderColor: '#10b981', bgColor: '#ecfdf5' },
  { value: 'normal', label: '보통', emoji: '😐', borderColor: '#eab308', bgColor: '#fefce8' },
  { value: 'tired',  label: '피곤', emoji: '😓', borderColor: '#f97316', bgColor: '#fff7ed' },
  { value: 'bad',    label: '나쁨', emoji: '😞', borderColor: '#ef4444', bgColor: '#fef2f2' },
];

const SLEEP_OPTIONS = [
  { value: 'excellent', label: '아주 잘 잤어요', emoji: '😴' },
  { value: 'good',      label: '잘 잤어요',      emoji: '😊' },
  { value: 'okay',      label: '그럭저럭',        emoji: '😐' },
  { value: 'poor',      label: '못 잤어요',       emoji: '😵' },
];

function getStressEmoji(v: number) { return ['😌','🙂','😐','😰','😫'][v - 1]; }
function getEnergyEmoji(v: number) { return ['🔋','😴','⚡','💪','✨'][v - 1]; }

export function ChecklistScreen({ navigation }: Props) {
  const [condition,    setCondition]    = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [stressLevel,  setStressLevel]  = useState(3);
  const [energy,       setEnergy]       = useState(3);

  const b1 = useBounceAnimation(3000);
  const b2 = useBounceAnimation(2500);
  const b3 = useBounceAnimation(3200);
  const b4 = useBounceAnimation(2800);

  const stressColor = stressLevel <= 2 ? '#84cc16' : stressLevel === 3 ? '#fbbf24' : '#ef4444';
  const energyColor = energy >= 4 ? '#84cc16' : energy === 3 ? '#fbbf24' : '#ef4444';

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Floating icons */}
      <Animated.View style={[s.fDumbbell, { transform: [{ translateY: b1 }] }]}><Dumbbell size={32} color="#f9a8d4" strokeWidth={1.5} /></Animated.View>
      <Animated.View style={[s.fHeart,    { transform: [{ translateY: b2 }] }]}><Heart    size={28} color="#7dd3fc" strokeWidth={1.5} /></Animated.View>
      <Animated.View style={[s.fZap,      { transform: [{ translateY: b3 }] }]}><Zap      size={28} color="#f9a8d4" strokeWidth={1.5} /></Animated.View>
      <Animated.View style={[s.fBrain,    { transform: [{ translateY: b4 }] }]}><Brain    size={28} color="#7dd3fc" strokeWidth={1.5} /></Animated.View>

      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.logoRow}>
              <Dumbbell size={28} color="#db2777" strokeWidth={2.5} />
              <MessageCircle size={24} color="#0284c7" strokeWidth={2.5} />
            </View>
            <GradientText colors={['#db2777', '#0284c7']} style={s.appTitle}>sweet & sweat</GradientText>
            <Text style={s.subtitle}>오늘의 컨디션을 알려주세요</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            {/* Q1: 컨디션 */}
            <View style={s.question}>
              <View style={s.qHeader}>
                <LinearGradient colors={['#f472b6', '#38bdf8']} style={s.qNum}><Text style={s.qNumTxt}>1</Text></LinearGradient>
                <Text style={s.qTitle}>오늘 컨디션은 어떠세요?</Text>
              </View>
              <View style={s.conditionGrid}>
                {CONDITIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setCondition(opt.value)}
                    style={[
                      s.conditionBtn,
                      condition === opt.value
                        ? { borderColor: opt.borderColor, backgroundColor: opt.bgColor }
                        : { borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
                    ]}
                  >
                    <Text style={s.conditionEmoji}>{opt.emoji}</Text>
                    <Text style={s.conditionLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Q2: 수면 */}
            <View style={[s.question, s.divider]}>
              <View style={s.qHeader}>
                <LinearGradient colors={['#f472b6', '#38bdf8']} style={s.qNum}><Text style={s.qNumTxt}>2</Text></LinearGradient>
                <Text style={s.qTitle}>어젯밤 잠은 잘 주무셨나요?</Text>
              </View>
              <View style={s.sleepGrid}>
                {SLEEP_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setSleepQuality(opt.value)}
                    style={[
                      s.sleepBtn,
                      sleepQuality === opt.value
                        ? { borderColor: '#0ea5e9', backgroundColor: '#f0f9ff' }
                        : { borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
                    ]}
                  >
                    <Text style={s.sleepEmoji}>{opt.emoji}</Text>
                    <Text style={s.sleepLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Q3: 스트레스 */}
            <View style={[s.question, s.divider]}>
              <View style={s.qHeader}>
                <LinearGradient colors={['#f472b6', '#38bdf8']} style={s.qNum}><Text style={s.qNumTxt}>3</Text></LinearGradient>
                <Text style={s.qTitle}>스트레스는 얼마나 받으셨나요?</Text>
              </View>
              <View style={s.sliderWrap}>
                <Slider
                  minimumValue={1} maximumValue={5} step={1}
                  value={stressLevel}
                  onValueChange={v => setStressLevel(Math.round(v))}
                  minimumTrackTintColor={stressColor}
                  maximumTrackTintColor="#e5e7eb"
                  thumbTintColor={stressColor}
                  style={s.slider}
                />
                <View style={s.sliderLabels}>
                  <Text style={[s.sliderLabel, { color: '#65a30d' }]}>😌 전혀없어요</Text>
                  <Text style={[s.sliderLabel, { color: '#ca8a04' }]}>😐 보통</Text>
                  <Text style={[s.sliderLabel, { color: '#dc2626' }]}>😫 많이</Text>
                </View>
                <Text style={s.sliderEmoji}>{getStressEmoji(stressLevel)}</Text>
              </View>
            </View>

            {/* Q4: 에너지 */}
            <View style={[s.question, s.divider]}>
              <View style={s.qHeader}>
                <LinearGradient colors={['#f472b6', '#38bdf8']} style={s.qNum}><Text style={s.qNumTxt}>4</Text></LinearGradient>
                <Text style={s.qTitle}>현재 에너지 레벨은요?</Text>
              </View>
              <View style={s.sliderWrap}>
                <Slider
                  minimumValue={1} maximumValue={5} step={1}
                  value={energy}
                  onValueChange={v => setEnergy(Math.round(v))}
                  minimumTrackTintColor={energyColor}
                  maximumTrackTintColor="#e5e7eb"
                  thumbTintColor={energyColor}
                  style={s.slider}
                />
                <View style={s.sliderLabels}>
                  <Text style={[s.sliderLabel, { color: '#dc2626' }]}>🔋 낮음</Text>
                  <Text style={[s.sliderLabel, { color: '#ca8a04' }]}>⚡ 보통</Text>
                  <Text style={[s.sliderLabel, { color: '#65a30d' }]}>✨ 높음</Text>
                </View>
                <Text style={s.sliderEmoji}>{getEnergyEmoji(energy)}</Text>
              </View>
            </View>

            {/* Submit */}
            <View style={s.submitWrap}>
              <TouchableOpacity activeOpacity={0.85} style={s.submitBtn} onPress={() => navigation.navigate('Home')}>
                <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.submitGrad}>
                  <TrendingUp size={20} color="#fff" strokeWidth={2.5} />
                  <Text style={s.submitTxt}>완료하기</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 32, alignItems: 'center' },

  /* Floating */
  fDumbbell: { position: 'absolute', top: 80,  left: 16 },
  fHeart:    { position: 'absolute', top: 128, right: 24 },
  fZap:      { position: 'absolute', bottom: 160, left: 24 },
  fBrain:    { position: 'absolute', bottom: 192, right: 32 },

  /* Header */
  header: { alignItems: 'center', marginBottom: 20, gap: 8 },
  logoRow: { flexDirection: 'row', gap: 10 },
  appTitle: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#4b5563', textAlign: 'center' },

  /* Card */
  card: {
    width: '100%', maxWidth: 448,
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#fbcfe8',
    padding: 20, gap: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 10,
  },

  /* Question */
  question: { gap: 12 },
  divider: { paddingTop: 16, borderTopWidth: 2, borderTopColor: '#f3f4f6' },
  qHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qNum: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  qNumTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  qTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937', flex: 1 },

  /* Condition */
  conditionGrid: { flexDirection: 'row', gap: 8 },
  conditionBtn: { flex: 1, paddingVertical: 8, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: 2 },
  conditionEmoji: { fontSize: 22 },
  conditionLabel: { fontSize: 10, fontWeight: '500', color: '#374151', textAlign: 'center' },

  /* Sleep */
  sleepGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sleepBtn: { width: '47%', paddingVertical: 12, borderRadius: 12, borderWidth: 2, alignItems: 'flex-start', paddingHorizontal: 12, gap: 4 },
  sleepEmoji: { fontSize: 28 },
  sleepLabel: { fontSize: 10, fontWeight: '500', color: '#374151' },

  /* Slider */
  sliderWrap: { gap: 8 },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  sliderLabel: { fontSize: 10, fontWeight: '500' },
  sliderEmoji: { fontSize: 24, textAlign: 'center', marginTop: 4 },

  /* Submit */
  submitWrap: { paddingTop: 4 },
  submitBtn: { borderRadius: 12, overflow: 'hidden' },
  submitGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
