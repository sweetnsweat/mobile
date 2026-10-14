import React from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  Dimensions, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Dumbbell, MessageCircle, Activity, Heart, Footprints, Star, Trophy, Zap } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { GradientText } from '../components/GradientText';
import { ScreenBackground } from '../components/ScreenBackground';
import { GradientButton } from '../components/GradientButton';
import { useBounceAnimation } from '../hooks/useBounceAnimation';

const { width: W, height: H } = Dimensions.get('window');
const MAP_W = Math.min(W - 32, 320);
const MAP_H = 260;

type Props = NativeStackScreenProps<RootStackParamList, 'EmojiMapHero'>;

export function EmojiMapHeroScreen({ navigation }: Props) {
  const b1 = useBounceAnimation(1500); const b2 = useBounceAnimation(1250);
  const b3 = useBounceAnimation(1750); const b4 = useBounceAnimation(1400);
  const m1 = useBounceAnimation(1500); const m2 = useBounceAnimation(1250);
  const m3 = useBounceAnimation(1600); const m4 = useBounceAnimation(1400);
  const m5 = useBounceAnimation(1650); const m6 = useBounceAnimation(1300);
  const m7 = useBounceAnimation(1750); const m8 = useBounceAnimation(1450);

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* Screen floating icons */}
        <Animated.View style={[s.fStar1, { transform: [{ translateY: b1 }] }]}>
          <Star size={24} color="#facc15" fill="#facc15" strokeWidth={2} />
        </Animated.View>
        <Animated.View style={[s.fZap, { transform: [{ translateY: b2 }] }]}>
          <Zap size={28} color="#f97316" fill="#fb923c" strokeWidth={2} />
        </Animated.View>
        <Animated.View style={[s.fStar2, { transform: [{ translateY: b3 }] }]}>
          <Star size={20} color="#ca8a04" fill="#eab308" strokeWidth={2} />
        </Animated.View>
        <Animated.View style={[s.fTrophy, { transform: [{ translateY: b4 }] }]}>
          <Trophy size={24} color="#db2777" strokeWidth={2} />
        </Animated.View>

        <View style={s.content}>
          {/* Logo */}
          <View style={s.logoRow}>
            <Dumbbell size={48} color="#db2777" strokeWidth={2.5} />
            <MessageCircle size={40} color="#0284c7" strokeWidth={2.5} />
          </View>

          {/* Title */}
          <View style={s.titleBlock}>
            <GradientText colors={['#db2777', '#0284c7']} style={s.titleLg}>sweet</GradientText>
            <GradientText colors={['#ec4899', '#0ea5e9']} style={s.titleMd}>&</GradientText>
            <GradientText colors={['#0284c7', '#db2777']} style={s.titleLg}>sweat</GradientText>
          </View>

          {/* Map */}
          <View style={[s.mapBox, { width: MAP_W, height: MAP_H }]}>
            {/* Floating map icons */}
            <Animated.View style={[s.mHeart1, { transform: [{ translateY: m1 }] }]}><Heart size={24} color="#f472b6" fill="#f9a8d4" strokeWidth={2} /></Animated.View>
            <Animated.View style={[s.mHeart2, { transform: [{ translateY: m2 }] }]}><Heart size={20} color="#ec4899" fill="#f472b6" strokeWidth={2} /></Animated.View>
            <Animated.View style={[s.mHeart3, { transform: [{ translateY: m3 }] }]}><Heart size={28} color="#f472b6" fill="#f9a8d4" strokeWidth={2} /></Animated.View>
            <Animated.View style={[s.mDumbbell, { transform: [{ translateY: m4 }] }]}><Dumbbell size={24} color="#0ea5e9" strokeWidth={2} /></Animated.View>
            <Animated.View style={[s.mActivity, { transform: [{ translateY: m5 }] }]}><Activity size={20} color="#ec4899" strokeWidth={2} /></Animated.View>
            <Animated.View style={[s.mZap, { transform: [{ translateY: m6 }] }]}><Zap size={20} color="#38bdf8" strokeWidth={2} /></Animated.View>
            <Animated.View style={[s.mTrophy, { transform: [{ translateY: m7 }] }]}><Trophy size={20} color="#eab308" strokeWidth={2} /></Animated.View>
            <Animated.View style={[s.mStar, { transform: [{ translateY: m8 }] }]}><Star size={16} color="#facc15" fill="#fde047" strokeWidth={2} /></Animated.View>

            {/* Chat bubbles */}
            <View style={s.chatLeft}><View style={s.bubbleWhite}><Text style={s.chatEmoji}>💬</Text></View></View>
            <View style={s.chatRight}><LinearGradient colors={['#38bdf8','#0ea5e9']} style={s.bubbleBlue}><Text style={s.chatEmoji}>💬</Text></LinearGradient></View>
            <View style={s.chatCenter}><LinearGradient colors={['#fbcfe8','#bae6fd']} style={s.bubblePink}><Text style={s.chatEmoji}>💬</Text></LinearGradient></View>
            <View style={s.chatBotL}><View style={s.bubbleWhiteSm}><Text style={s.chatEmojiSm}>💬</Text></View></View>
            <View style={s.chatBotR}><LinearGradient colors={['#f9a8d4','#f472b6']} style={s.bubblePinkSm}><Text style={s.chatEmojiSm}>💬</Text></LinearGradient></View>

            {/* Corner icon buttons */}
            <TouchableOpacity style={[s.cornerBtn, s.cBL]}>
              <LinearGradient colors={['#fff','#fce7f3']} style={s.cornerInner}><Dumbbell size={20} color="#db2777" strokeWidth={2.5} /></LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={[s.cornerBtn, s.cBR]}>
              <LinearGradient colors={['#fff','#f0f9ff']} style={s.cornerInner}><Activity size={20} color="#0284c7" strokeWidth={2.5} /></LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={[s.cornerBtn, s.cTR]}>
              <LinearGradient colors={['#fff','#fce7f3']} style={s.cornerInner}><Heart size={20} color="#db2777" fill="#f472b6" strokeWidth={2.5} /></LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={[s.cornerBtn, s.cTL]}>
              <LinearGradient colors={['#fff','#f0f9ff']} style={s.cornerInner}><Footprints size={20} color="#0284c7" strokeWidth={2.5} /></LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Start button */}
          <GradientButton
            label="시작하기 🚀"
            onPress={() => navigation.navigate('Auth')}
            wrapStyle={s.startWrap}
            textStyle={s.startText}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, marginTop: 16 },
  titleBlock: { alignItems: 'center', marginBottom: 24 },
  titleLg: { fontSize: 48, fontWeight: '700', letterSpacing: -1 },
  titleMd: { fontSize: 30, fontWeight: '700' },

  /* Map */
  mapBox: {
    borderRadius: 16, borderWidth: 2, borderColor: '#f9a8d4',
    backgroundColor: '#fce7f3', overflow: 'hidden', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 12,
  },

  /* Floating screen icons */
  fStar1: { position: 'absolute', top: H * 0.12, left: 24 },
  fZap:   { position: 'absolute', top: H * 0.15, right: 32 },
  fStar2: { position: 'absolute', bottom: 160, right: 24 },
  fTrophy:{ position: 'absolute', bottom: 200, left: 16 },

  /* Map floating icons */
  mHeart1:  { position: 'absolute', top: '10%', left: '8%' },
  mHeart2:  { position: 'absolute', top: '55%', right: '12%' },
  mHeart3:  { position: 'absolute', bottom: '15%', left: '15%' },
  mDumbbell:{ position: 'absolute', top: '25%', right: '8%' },
  mActivity:{ position: 'absolute', bottom: '35%', right: '15%' },
  mZap:     { position: 'absolute', top: '65%', left: '10%' },
  mTrophy:  { position: 'absolute', bottom: '50%', left: '8%' },
  mStar:    { position: 'absolute', top: '40%', left: '20%' },

  /* Chat bubbles */
  chatLeft:  { position: 'absolute', top: '20%', left: '25%' },
  chatRight: { position: 'absolute', top: '45%', right: '20%' },
  chatCenter:{ position: 'absolute', top: '35%', left: '33%' },
  chatBotL:  { position: 'absolute', bottom: '25%', left: '30%' },
  chatBotR:  { position: 'absolute', top: '60%', right: '35%' },
  bubbleWhite:   { backgroundColor: '#fff', borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: 20, paddingVertical: 14, borderWidth: 2, borderColor: '#f9a8d4', shadowColor: '#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.1, shadowRadius:8, elevation:6 },
  bubbleBlue:    { borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 20, paddingVertical: 14, borderWidth: 2, borderColor: '#7dd3fc' },
  bubblePink:    { borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14, borderWidth: 2, borderColor: '#fff' },
  bubbleWhiteSm: { backgroundColor: '#fff', borderRadius: 12, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 2, borderColor: '#fbcfe8' },
  bubblePinkSm:  { borderRadius: 12, borderBottomRightRadius: 4, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 2, borderColor: '#fbcfe8' },
  chatEmoji:   { fontSize: 24 },
  chatEmojiSm: { fontSize: 20 },

  /* Corner buttons */
  cornerBtn: { position: 'absolute', borderRadius: 999, borderWidth: 2, shadowColor: '#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.15, shadowRadius:6, elevation:6 },
  cBL: { bottom: 12, left: 12, borderColor: '#f472b6' },
  cBR: { bottom: 12, right: 12, borderColor: '#38bdf8' },
  cTR: { top: 12, right: 12, borderColor: '#f472b6' },
  cTL: { top: 12, left: 12, borderColor: '#38bdf8' },
  cornerInner: { borderRadius: 999, padding: 10 },

  /* Start button */
  startWrap: { width: '100%', borderRadius: 16, shadowColor: '#ec4899', shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:8 },
  startText: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
});
