import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, MapPin, Heart, Send, Flame, Trophy, Clock } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { ScreenBackground } from '../components/ScreenBackground';

type Props = NativeStackScreenProps<RootStackParamList, 'CharacterQuest'>;

const COACH_IMG = 'https://i.imgur.com/ub32dOr.png';
const QUEST_IMG = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';

export function CharacterQuestScreen({ navigation }: Props) {
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

        {/* Chat messages */}
        <ScrollView style={s.chatScroll} contentContainerStyle={s.chatContent}>
          {/* Message 1 */}
          <View style={s.msgRow}>
            <View style={s.msgAvatar}><ImageWithFallback uri={COACH_IMG} style={s.msgAvatarImg} /></View>
            <View style={s.msgBubbleWrap}>
              <View style={s.msgBubble}>
                <Text style={s.msgTxt}>수연아! 오늘도 열심히 준비하고 있어? 😊</Text>
              </View>
              <Text style={s.msgTime}>오전 9:23</Text>
            </View>
          </View>

          {/* Message 2 */}
          <View style={s.msgRow}>
            <View style={s.msgAvatar}><ImageWithFallback uri={COACH_IMG} style={s.msgAvatarImg} /></View>
            <View style={s.msgBubbleWrap}>
              <View style={s.msgBubble}>
                <Text style={s.msgTxt}>
                  우리 학교 오려면 기초 체력이 {'\n'}정말 중요해.{'\n'}
                  특히 지구력이랑 근력은 필수야! {'\n'} 열심히 해서 나랑 같이 학교 다녀야지.
                </Text>
              </View>
              <Text style={s.msgTime}>오전 9:24</Text>
            </View>
          </View>

          {/* Narration */}
          <View style={s.narrationWrap}>
            <View style={s.narration}>
              <Text style={s.narrationTxt}>
                민수 선배가 나를 도와주려 한다. {'\n'}열심히 운동해서 점수를 딸 기회! {'\n'}
                아래 운동들을 수행하여 민수 선배의 {'\n'}호감을 얻어보자.
              </Text>
            </View>
          </View>

          {/* Quest card */}
          <View style={s.questCard}>
            {/* Quest header */}
            <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.questHeader}>
              <View style={s.questHeaderInner}>
                <View style={s.questHeaderLeft}>
                  <Trophy size={20} color="#fde047" strokeWidth={2.5} />
                  <Text style={s.questHeaderTitle}>오늘의 퀘스트</Text>
                </View>
                <View style={s.dayBadge}><Text style={s.dayBadgeTxt}>Day 3</Text></View>
              </View>
            </LinearGradient>

            {/* Quest image */}
            <View style={s.questImgWrap}>
              <ImageWithFallback uri={QUEST_IMG} style={s.questImg} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={s.questImgOverlay} />
              <View style={s.questImgText}>
                <Text style={s.questImgTitle}>🏃‍♂️ 3km 러닝 챌린지</Text>
              </View>
            </View>

            {/* Quest details */}
            <View style={s.questDetails}>
              <View style={s.questInfoRow}>
                <View style={s.questInfoBadgeGreen}>
                  <Clock size={16} color="#15803d" strokeWidth={2} />
                  <Text style={s.questInfoGreenTxt}>25분 이내</Text>
                </View>
                <View style={s.questInfoBadgeOrange}>
                  <Flame size={16} color="#c2410c" strokeWidth={2} />
                  <Text style={s.questInfoOrangeTxt}>200 kcal</Text>
                </View>
              </View>

              <View style={s.adviceBox}>
                <View style={s.adviceHeader}>
                  <Heart size={16} color="#065f46" strokeWidth={2.5} />
                  <Text style={s.adviceTitle}>민수 선배의 조언</Text>
                </View>
                <Text style={s.adviceTxt}>
                  "첫 1km는 천천히 워밍업하고, 중간은 페이스 유지, 마지막은 힘내서 달려!
                  체대 입시에서 심폐지구력은 정말 중요해.{'\n'}오늘도 화이팅! 💪"
                </Text>
              </View>

              <View style={s.rewardsSection}>
                <Text style={s.rewardsTitle}>보상</Text>
                <View style={s.rewardsGrid}>
                  <View style={s.rewardBadgeYellow}>
                    <Text style={s.rewardVal}>+30</Text>
                    <Text style={s.rewardLabelYellow}>EXP {'\n'}⭐</Text>
                  </View>
                  <View style={s.rewardBadgeRed}>
                    <Text style={s.rewardValRed}>+15</Text>
                    <Text style={s.rewardLabelRed}>골드 🪙</Text>
                  </View>
                  <View style={s.rewardBadgePink}>
                    <Text style={s.rewardValPink}>+5</Text>
                    <Text style={s.rewardLabelPink}>호감도 ❤️</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.85} style={s.startBtnWrap}>
                <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.startBtn}>
                  <Text style={s.startBtnTxt}>퀘스트 시작하기! 🚀</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Input area */}
        <View style={s.inputArea}>
          <TextInput
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#9ca3af"
            style={s.textInput}
          />
          <TouchableOpacity style={s.sendBtnWrap}>
            <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.sendBtn}>
              <Send size={20} color="#fff" strokeWidth={2} />
            </LinearGradient>
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

  msgRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  msgAvatar: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: '#f9a8d4' },
  msgAvatarImg: { width: '100%', height: '100%' },
  msgBubbleWrap: { flex: 1 },
  msgBubble: { backgroundColor: '#fff', borderRadius: 16, borderTopLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#e5e7eb' },
  msgTxt: { fontSize: 14, color: '#1f2937', lineHeight: 20 },
  msgTime: { fontSize: 12, color: '#6b7280', marginLeft: 8, marginTop: 4 },

  narrationWrap: { alignItems: 'center', marginVertical: 8 },
  narration: { backgroundColor: 'rgba(107,114,128,0.2)', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, maxWidth: '85%' },
  narrationTxt: { fontSize: 12, color: '#4b5563', fontStyle: 'italic', textAlign: 'center', lineHeight: 18 },

  questCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 4, borderColor: '#f472b6', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 },
  questHeader: { paddingHorizontal: 16, paddingVertical: 12 },
  questHeaderInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  questHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  questHeaderTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  dayBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4 },
  dayBadgeTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },

  questImgWrap: { height: 192, position: 'relative' },
  questImg: { width: '100%', height: '100%' },
  questImgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  questImgText: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  questImgTitle: { color: '#fff', fontWeight: '700', fontSize: 20 },

  questDetails: { padding: 20, gap: 16 },
  questInfoRow: { flexDirection: 'row', gap: 12 },
  questInfoBadgeGreen: { flex: 1, backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: '#86efac' },
  questInfoGreenTxt: { fontSize: 12, fontWeight: '600', color: '#15803d' },
  questInfoBadgeOrange: { flex: 1, backgroundColor: '#ffedd5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: '#fdba74' },
  questInfoOrangeTxt: { fontSize: 12, fontWeight: '600', color: '#c2410c' },

  adviceBox: { backgroundColor: '#ecfdf5', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: '#a7f3d0', gap: 8 },
  adviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adviceTitle: { fontWeight: '700', color: '#065f46', fontSize: 14 },
  adviceTxt: { fontSize: 14, color: '#065f46', lineHeight: 20 },

  rewardsSection: { gap: 8 },
  rewardsTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  rewardsGrid: { flexDirection: 'row', gap: 12 },
  rewardBadgeYellow: { flex: 1, backgroundColor: '#fefce8', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: '#fde047' },
  rewardVal: { fontSize: 18, fontWeight: '800', color: '#a16207' },
  rewardLabelYellow: { fontSize: 10, color: '#ca8a04', textAlign: 'center' },
  rewardBadgeRed: { flex: 1, backgroundColor: '#fef2f2', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: '#fca5a5' },
  rewardValRed: { fontSize: 18, fontWeight: '800', color: '#b91c1c' },
  rewardLabelRed: { fontSize: 10, color: '#dc2626', textAlign: 'center' },
  rewardBadgePink: { flex: 1, backgroundColor: '#fdf2f8', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: '#f9a8d4' },
  rewardValPink: { fontSize: 18, fontWeight: '800', color: '#be185d' },
  rewardLabelPink: { fontSize: 10, color: '#ec4899', textAlign: 'center' },

  startBtnWrap: { borderRadius: 12, overflow: 'hidden' },
  startBtn: { paddingVertical: 14, alignItems: 'center' },
  startBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },

  inputArea: { backgroundColor: '#fff', borderTopWidth: 2, borderTopColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  textInput: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 99, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, borderWidth: 1, borderColor: '#d1d5db', color: '#111827' },
  sendBtnWrap: { borderRadius: 20, overflow: 'hidden' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
