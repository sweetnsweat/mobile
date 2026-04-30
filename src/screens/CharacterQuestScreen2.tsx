import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Trophy, Clock, Sparkles, Star } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { usePulseAnimation } from '../hooks/usePulseAnimation';
import { ScreenBackground } from '../components/ScreenBackground';

type Props = NativeStackScreenProps<RootStackParamList, 'CharacterQuest2'>;

const COACH_IMG = 'https://i.imgur.com/ub32dOr.png';
const EVENT_IMG = 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';

export function CharacterQuestScreen2({ navigation }: Props) {
  const sparkPulse = usePulseAnimation();
  const starPulse  = usePulseAnimation();
  const newPulse   = usePulseAnimation();

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
          <View style={s.headerInner}>
            <View style={s.avatarWrap}>
              <View style={s.avatarImg}>
                <ImageWithFallback uri={COACH_IMG} style={s.avatarImgInner} />
              </View>
              <View style={s.onlineDot} />
            </View>
            <View>
              <Text style={s.headerName}>민수 선배</Text>
              <Text style={s.headerSub}>체대생 · 온라인</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Chat scroll area */}
        <ScrollView style={s.chatScroll} contentContainerStyle={s.chatContent}>
          {/* Event announcement */}
          <View style={s.announcementWrap}>
            <View style={s.announcement}>
              <View style={s.sparkRow}>
                <Animated.View style={{ opacity: sparkPulse }}>
                  <Sparkles size={20} color="#eab308" strokeWidth={2.5} />
                </Animated.View>
                <Text style={s.announcementTitle}>이벤트 발생!</Text>
                <Animated.View style={{ opacity: sparkPulse }}>
                  <Sparkles size={20} color="#eab308" strokeWidth={2.5} />
                </Animated.View>
              </View>
              <Text style={s.announcementSub}>
                민수 선배가 특별한 제안을 했다.{'\n'}이 기회를 놓치지 말자!
              </Text>
            </View>
          </View>

          {/* Event card */}
          <View style={s.eventCard}>
            {/* Star decorations */}
            <Animated.View style={[s.starRight, { opacity: starPulse }]}>
              <Star size={24} color="#eab308" fill="#eab308" strokeWidth={2} />
            </Animated.View>
            <Animated.View style={[s.starLeft, { opacity: sparkPulse }]}>
              <Star size={20} color="#ec4899" fill="#ec4899" strokeWidth={2} />
            </Animated.View>

            {/* Event header */}
            <LinearGradient
              colors={['#facc15', '#ec4899', '#0ea5e9']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.eventHeader}
            >
              <View style={s.eventHeaderInner}>
                <Trophy size={24} color="#fff" strokeWidth={2.5} />
                <Text style={s.eventHeaderTitle}>스페셜 이벤트</Text>
              </View>
              <Text style={s.eventHeaderSub}>한정 기간 제공!</Text>
            </LinearGradient>

            {/* Event image */}
            <View style={s.eventImgWrap}>
              <ImageWithFallback uri={EVENT_IMG} style={s.eventImg} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
                style={s.eventImgOverlay}
              />
              <View style={s.eventImgText}>
                <Text style={s.eventImgTitle}>🏃‍♂️ 민수 선배와의 마라톤</Text>
                <Text style={s.eventImgSub}>함께 뛰면 호감도 2배!</Text>
              </View>
            </View>

            {/* Event details */}
            <View style={s.eventDetails}>
              {/* Coach message */}
              <View style={s.coachMsgRow}>
                <View style={s.coachMsgAvatar}>
                  <ImageWithFallback uri={COACH_IMG} style={s.coachMsgAvatarImg} />
                </View>
                <View style={s.coachMsgBubble}>
                  <Text style={s.coachMsgTxt}>
                    수연아! 이번 주말에 우리 학교에서 마라톤하는데, 나랑 같이 뛸래? 😊{'\n\n'}
                    체대입시 준비하는 애들이 많이 오는 행사라서 좋은 경험이 될 거야!{'\n'}
                    내가 옆에서 페이스 조절 도와줄게 💪
                  </Text>
                </View>
              </View>

              {/* Event info badges */}
              <View style={s.infoBadgeRow}>
                <View style={s.infoBadgeBlue}>
                  <Clock size={20} color="#075985" strokeWidth={2.5} />
                  <View style={s.infoBadgeText}>
                    <Text style={s.infoBadgeTitleBlue}>이번 주말</Text>
                    <Text style={s.infoBadgeSubBlue}>오전 9시</Text>
                  </View>
                </View>
                <View style={s.infoBadgePink}>
                  <Flame size={20} color="#9d174d" strokeWidth={2.5} />
                  <View style={s.infoBadgeText}>
                    <Text style={s.infoBadgeTitlePink}>5km 코스</Text>
                    <Text style={s.infoBadgeSubPink}>난이도 ⭐⭐⭐</Text>
                  </View>
                </View>
              </View>

              {/* Special rewards */}
              <LinearGradient
                colors={['#fef9c3', '#ffedd5']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.rewardsBox}
              >
                <View style={s.rewardsHeader}>
                  <Trophy size={20} color="#ca8a04" strokeWidth={2.5} />
                  <Text style={s.rewardsTitle}>스페셜 보상</Text>
                  <Animated.View style={[s.newBadge, { opacity: newPulse }]}>
                    <Text style={s.newBadgeTxt}>NEW!</Text>
                  </Animated.View>
                </View>

                <View style={s.rewardsGrid}>
                  <View style={s.rewardYellow}>
                    <Text style={s.rewardValYellow}>+90</Text>
                    <Text style={s.rewardLblYellow}>EXP{'\n'}⭐</Text>
                  </View>
                  <View style={s.rewardOrange}>
                    <Text style={s.rewardValOrange}>+50</Text>
                    <Text style={s.rewardLblOrange}>골드{'\n'}🪙</Text>
                  </View>
                  <View style={s.rewardPink}>
                    <Text style={s.rewardValPink}>+20</Text>
                    <Text style={s.rewardLblPink}>호감도{'\n'}❤️</Text>
                  </View>
                </View>

                <View style={s.bonusBox}>
                  <Text style={s.bonusTxt}>✨ 민수 선배와 함께하면 보상 2배!</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Choice buttons */}
        <View style={s.choiceArea}>
          <TouchableOpacity activeOpacity={0.85} style={s.choicePrimaryWrap}>
            <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.choicePrimary}>
              <Text style={s.choicePrimaryTxt}>💪 참여하기 - "선배랑 같이 뛸래요!"</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={s.choiceSecondary}>
            <Text style={s.choiceSecondaryTxt}>⏰ 미루기 - "조금만 생각해볼게요..."</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={s.choiceTertiary}>
            <Text style={s.choiceTertiaryTxt}>🔜 다음에 - "다음 기회에 꼭 할게요!"</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 4, borderBottomColor: '#0284c7' },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' },
  avatarImgInner: { width: '100%', height: '100%' },
  onlineDot: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, backgroundColor: '#4ade80', borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
  headerName: { fontWeight: '700', color: '#fff', fontSize: 16 },
  headerSub: { fontSize: 12, color: '#fce7f3' },

  chatScroll: { flex: 1 },
  chatContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16, gap: 16 },

  announcementWrap: { alignItems: 'center' },
  announcement: { backgroundColor: 'rgba(107,114,128,0.2)', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 16, maxWidth: '90%', borderWidth: 2, borderColor: 'rgba(156,163,175,0.3)', gap: 8 },
  sparkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  announcementTitle: { fontSize: 18, fontWeight: '800', color: '#1f2937', fontStyle: 'italic' },
  announcementSub: { fontSize: 14, color: '#4b5563', fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },

  eventCard: { backgroundColor: '#fefce8', borderRadius: 24, borderWidth: 4, borderColor: '#facc15', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 12, position: 'relative' },
  starRight: { position: 'absolute', top: 52, right: 12, zIndex: 10 },
  starLeft:  { position: 'absolute', top: 56, left: 12, zIndex: 10 },

  eventHeader: { paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center', gap: 4 },
  eventHeaderInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eventHeaderTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
  eventHeaderSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },

  eventImgWrap: { height: 208, position: 'relative' },
  eventImg: { width: '100%', height: '100%' },
  eventImgOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  eventImgText: { position: 'absolute', bottom: 16, left: 16, right: 16, gap: 4 },
  eventImgTitle: { color: '#fff', fontWeight: '800', fontSize: 20 },
  eventImgSub: { color: '#fbcfe8', fontSize: 14, fontWeight: '600' },

  eventDetails: { padding: 20, gap: 16 },

  coachMsgRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  coachMsgAvatar: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: '#f9a8d4', flexShrink: 0 },
  coachMsgAvatarImg: { width: '100%', height: '100%' },
  coachMsgBubble: { flex: 1, backgroundColor: '#fff', borderRadius: 16, borderTopLeftRadius: 4, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 2, borderColor: '#fbcfe8', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  coachMsgTxt: { fontSize: 14, color: '#1f2937', lineHeight: 20, fontWeight: '500' },

  infoBadgeRow: { flexDirection: 'row', gap: 12 },
  infoBadgeBlue: { flex: 1, backgroundColor: '#e0f2fe', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 2, borderColor: '#38bdf8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  infoBadgePink: { flex: 1, backgroundColor: '#fce7f3', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 2, borderColor: '#f9a8d4', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  infoBadgeText: { alignItems: 'center' },
  infoBadgeTitleBlue: { fontSize: 12, fontWeight: '700', color: '#075985' },
  infoBadgeSubBlue: { fontSize: 10, color: '#0284c7' },
  infoBadgeTitlePink: { fontSize: 12, fontWeight: '700', color: '#9d174d' },
  infoBadgeSubPink: { fontSize: 10, color: '#ec4899' },

  rewardsBox: { borderRadius: 16, padding: 16, borderWidth: 3, borderColor: '#facc15', gap: 12 },
  rewardsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rewardsTitle: { fontSize: 16, fontWeight: '800', color: '#78350f', flex: 1 },
  newBadge: { backgroundColor: '#ef4444', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  newBadgeTxt: { fontSize: 10, color: '#fff', fontWeight: '700' },

  rewardsGrid: { flexDirection: 'row', gap: 8 },
  rewardYellow: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: '#eab308' },
  rewardValYellow: { fontSize: 20, fontWeight: '800', color: '#a16207' },
  rewardLblYellow: { fontSize: 10, fontWeight: '700', color: '#ca8a04', textAlign: 'center' },
  rewardOrange: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: '#f97316' },
  rewardValOrange: { fontSize: 20, fontWeight: '800', color: '#c2410c' },
  rewardLblOrange: { fontSize: 10, fontWeight: '700', color: '#ea580c', textAlign: 'center' },
  rewardPink: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: '#ec4899' },
  rewardValPink: { fontSize: 20, fontWeight: '800', color: '#be185d' },
  rewardLblPink: { fontSize: 10, fontWeight: '700', color: '#ec4899', textAlign: 'center' },

  bonusBox: { backgroundColor: '#fdf2f8', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#fbcfe8' },
  bonusTxt: { fontSize: 11, color: '#9d174d', fontWeight: '600', textAlign: 'center' },

  choiceArea: { backgroundColor: '#fff', borderTopWidth: 2, borderTopColor: '#e5e7eb', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 8 },
  choicePrimaryWrap: { borderRadius: 12, overflow: 'hidden' },
  choicePrimary: { paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  choicePrimaryTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  choiceSecondary: { paddingVertical: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 2, borderColor: '#9ca3af', alignItems: 'center' },
  choiceSecondaryTxt: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
  choiceTertiary: { paddingVertical: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center' },
  choiceTertiaryTxt: { fontSize: 14, fontWeight: '500', color: '#4b5563' },
});
