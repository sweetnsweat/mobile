import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenBackground } from '../components/ScreenBackground';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { GradientText } from '../components/GradientText';

type Props = NativeStackScreenProps<RootStackParamList, 'CharacterSelect'>;

const CHAR_IMG = 'https://i.imgur.com/v0njcuh.png';

const STATS = [
  { label: '체력',   val: 82 },
  { label: '지구력', val: 75 },
  { label: '열정',   val: 90 },
];

export function CharacterSelectScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const displayName = name.trim() || '플레이어';

  function handleStart() {
    if (!name.trim()) return;
    navigation.navigate('Home');
  }

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView style={s.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* Header */}
          <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
            <Text style={s.headerSub}>Character Select</Text>
            <Text style={s.headerTitle}>✨ 나의 캐릭터를 선택하세요</Text>
          </LinearGradient>

          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            {/* Section label */}
            <Text style={s.sectionLabel}>캐릭터 선택</Text>

            {/* Character card */}
            <View style={s.charCard}>
              {/* Image */}
              <View style={s.charImgWrap}>
                <ImageWithFallback uri={CHAR_IMG} style={s.charImg} />
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.9)']}
                  style={s.charImgOverlay}
                />
                {/* Badges */}
                <LinearGradient
                  colors={['#ec4899', '#f43f5e']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.recommendBadge}
                >
                  <Text style={s.recommendBadgeTxt}>추천</Text>
                </LinearGradient>
                <View style={s.checkBadge}>
                  <Text style={s.checkBadgeTxt}>✓</Text>
                </View>
              </View>

              {/* Info */}
              <View style={s.charInfo}>
                <View style={s.charNameRow}>
                  <Text style={s.charName}>{displayName}</Text>
                  <View style={s.roleBadge}>
                    <Text style={s.roleBadgeTxt}>체육 입시생</Text>
                  </View>
                </View>
                <Text style={s.charDesc}>
                  체대 입시를 준비 중인 열정 넘치는 고3.{'\n'}민수 선배에게 도움을 받으며 실력을 키우는 중! 💪
                </Text>

                {/* Stats */}
                <View style={s.statsRow}>
                  {STATS.map(stat => (
                    <View key={stat.label} style={s.statBox}>
                      <GradientText colors={['#ec4899', '#0ea5e9']} style={s.statVal}>
                        {String(stat.val)}
                      </GradientText>
                      <Text style={s.statLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Name input */}
            <View style={s.nameCard}>
              <Text style={s.nameCardLabel}>
                <Text style={{ color: '#38bdf8' }}>✦ </Text>
                당신의 이름을 적어주세요
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                maxLength={10}
                placeholder="이름을 입력하세요..."
                placeholderTextColor="#d1d5db"
                style={s.nameInput}
              />
            </View>

            {/* Start button */}
            <TouchableOpacity
              onPress={handleStart}
              disabled={!name.trim()}
              activeOpacity={0.85}
              style={[s.startBtnWrap, !name.trim() && s.startBtnDisabled]}
            >
              <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.startBtn}>
                <Text style={s.startBtnTxt}>운동 시작하기 🚀</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 16 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },

  header: { paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: '#0284c7', gap: 4 },
  headerSub: { fontSize: 10, color: '#fce7f3', letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: -0.3, textAlign: 'center' },

  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24, gap: 16 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(0,0,0,0.35)', letterSpacing: 2, textTransform: 'uppercase', paddingHorizontal: 4 },

  charCard: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 2, borderColor: '#f9a8d4', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 10 },
  charImgWrap: { height: 224, position: 'relative' },
  charImg: { width: '100%', height: '100%' },
  charImgOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  recommendBadge: { position: 'absolute', top: 12, right: 12, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, zIndex: 10 },
  recommendBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  checkBadge: { position: 'absolute', top: 12, left: 12, width: 28, height: 28, backgroundColor: '#ec4899', borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  checkBadgeTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },

  charInfo: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, gap: 12 },
  charNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  charName: { fontSize: 18, fontWeight: '900', color: '#111827', letterSpacing: -0.3 },
  roleBadge: { backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4 },
  roleBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#0ea5e9', letterSpacing: 0.5 },
  charDesc: { fontSize: 12, color: '#6b7280', lineHeight: 18 },

  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f3f4f6', borderRadius: 12, paddingVertical: 8, alignItems: 'center', gap: 2 },
  statVal: { fontSize: 16, fontWeight: '900' },
  statLabel: { fontSize: 9, color: '#9ca3af', fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

  nameCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#f3f4f6', padding: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  nameCardLabel: { fontSize: 11, fontWeight: '700', color: '#ec4899', letterSpacing: 1.5, textTransform: 'uppercase' },
  nameInput: { backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, fontWeight: '700', color: '#111827' },

  startBtnWrap: { borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#0284c7' },
  startBtnDisabled: { opacity: 0.35 },
  startBtn: { paddingVertical: 16, alignItems: 'center' },
  startBtnTxt: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: -0.3 },
});
