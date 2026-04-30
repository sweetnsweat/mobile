import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight, Flame, Bell, Moon, Shield, LogOut,
  Edit3, Camera, Star, TrendingUp, Activity, Calendar,
  Heart, Settings,
} from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenBackground } from '../components/ScreenBackground';
import { BottomNav } from '../components/BottomNav';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { logout, getStoredAuth, clearStoredAuth } from '../services/AuthService';

type Props = NativeStackScreenProps<RootStackParamList, 'Mypage'>;

const PROFILE = {
  name: '수연', handle: '@suyeon_run',
  avatar: 'https://i.imgur.com/v0njcuh.png',
  level: 14, title: '불꽃 챌린저',
  exp: 980, expMax: 1200,
  followers: 38, following: 22, streak: 7,
};

const BADGES = [
  { emoji: '🔥', label: '7일 연속', colors: ['#fb923c','#f87171'] as [string,string] },
  { emoji: '🏃', label: '첫 5K',   colors: ['#f472b6','#fb7185'] as [string,string] },
  { emoji: '💪', label: '근력왕',   colors: ['#38bdf8','#60a5fa'] as [string,string] },
  { emoji: '⚡', label: '퀘스트 10',colors: ['#facc15','#fb923c'] as [string,string] },
  { emoji: '🌟', label: 'TOP 3',   colors: ['#c084fc','#f472b6'] as [string,string] },
  { emoji: '🎯', label: '목표달성', colors: ['#34d399','#2dd4bf'] as [string,string] },
];

type StatIcon = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;

const STATS: { Icon: StatIcon; label: string; value: string; color: string }[] = [
  { Icon: Activity,   label: '총 운동',     value: '7회',   color: '#ec4899' },
  { Icon: Flame,      label: '소모 칼로리', value: '8,340', color: '#fb923c' },
  { Icon: Calendar,   label: '연속 달성',   value: '7일',   color: '#0ea5e9' },
  { Icon: TrendingUp, label: '이번 주 EXP', value: '+320',  color: '#10b981' },
];

type SettingIcon = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;

const SETTINGS: { Icon: SettingIcon; label: string; sub: string; toggle?: boolean; toggleKey?: string; danger?: boolean }[] = [
  { Icon: Bell,    label: '알림 설정',   sub: '퀘스트·랭킹 알림', toggle: true, toggleKey: 'bell' },
  { Icon: Moon,    label: '다크 모드',   sub: '앱 테마 변경',      toggle: true, toggleKey: 'dark' },
  { Icon: Shield,  label: '개인정보 보호', sub: '계정 공개 범위' },
  { Icon: Settings,label: '계정 설정',   sub: '이메일·비밀번호' },
  { Icon: LogOut,  label: '로그아웃',    sub: '', danger: true },
];


export function MypageScreen({ navigation }: Props) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({ bell: true, dark: false });
  const expPct = Math.round((PROFILE.exp / PROFILE.expMax) * 100);

  const handleLogout = async () => {
    const auth = getStoredAuth();
    if (auth) {
      await logout(auth.accessToken);
      clearStoredAuth();
    }
    navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  return (
    <ScreenBackground end={{ x: 0, y: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerSub}>My Profile</Text>
            <Text style={s.headerTitle}>마이페이지 ✨</Text>
          </View>
          <TouchableOpacity style={s.editBtn}>
            <Edit3 size={16} color="#4b5563" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Scroll body */}
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile card */}
          <View style={s.profileCard}>
            <View style={s.profileTop}>
              <View style={s.avatarWrap}>
                <View style={s.avatarImg}>
                  <ImageWithFallback uri={PROFILE.avatar} style={s.avatarImgInner} />
                </View>
                <LinearGradient colors={['#ec4899','#0ea5e9']} style={s.cameraBtn}>
                  <Camera size={12} color="#fff" strokeWidth={2.5} />
                </LinearGradient>
              </View>
              <View style={s.profileInfo}>
                <View style={s.nameRow}>
                  <Text style={s.profileName}>{PROFILE.name}</Text>
                  <View style={s.titleBadge}>
                    <Text style={s.titleBadgeTxt}>{PROFILE.title}</Text>
                  </View>
                </View>
                <View style={s.rankRow}>
                  <Text style={s.rankTxt}>🏆 랭킹 <Text style={{ color: '#ec4899' }}>#12</Text></Text>
                  <View style={s.streakRow}>
                    <Flame size={14} color="#fb923c" strokeWidth={2.5} />
                    <Text style={s.streakTxt}>{PROFILE.streak}일</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* EXP bar */}
            <View style={s.expSection}>
              <View style={s.expLabelRow}>
                <View style={s.expLvRow}>
                  <LinearGradient colors={['#facc15','#fb923c']} style={s.expLvBadge}>
                    <Star size={12} color="#fff" strokeWidth={2.5} />
                  </LinearGradient>
                  <Text style={s.expLvTxt}>Lv.{PROFILE.level}</Text>
                </View>
                <Text style={s.expNumTxt}>{PROFILE.exp.toLocaleString()} / {PROFILE.expMax.toLocaleString()} EXP</Text>
              </View>
              <View style={s.expBarBg}>
                <LinearGradient colors={['#f472b6','#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.expBarFill, { width: `${expPct}%` as any }]} />
              </View>
              <Text style={s.expNextTxt}>다음 레벨까지 {(PROFILE.expMax - PROFILE.exp).toLocaleString()} EXP 남았어요!</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={s.section}>
            <View style={s.sectionTitle}>
              <TrendingUp size={16} color="#f472b6" strokeWidth={2.5} />
              <Text style={s.sectionTitleTxt}>이번 주 통계</Text>
            </View>
            <View style={s.statsGrid}>
              {STATS.map(({ Icon, label, value, color }) => (
                <View key={label} style={s.statCard}>
                  <View style={s.statIconWrap}>
                    <Icon size={16} color={color} strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text style={[s.statValue, { color }]}>{value}</Text>
                    <Text style={s.statLabel}>{label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Badges */}
          <View style={s.section}>
            <View style={s.badgeHeader}>
              <View style={s.sectionTitle}>
                <Text style={{ fontSize: 16 }}>🏆</Text>
                <Text style={s.sectionTitleTxt}>획득 배지</Text>
              </View>
              <TouchableOpacity style={s.viewAllBtn}>
                <Text style={s.viewAllTxt}>전체보기</Text>
                <ChevronRight size={12} color="#ec4899" strokeWidth={3} />
              </TouchableOpacity>
            </View>
            <View style={s.badgeRow}>
              {BADGES.map(b => (
                <View key={b.label} style={s.badgeItem}>
                  <LinearGradient colors={b.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.badgeCircle}>
                    <Text style={s.badgeEmoji}>{b.emoji}</Text>
                  </LinearGradient>
                  <Text style={s.badgeLabel}>{b.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Settings */}
          <View style={s.section}>
            <View style={s.sectionTitle}>
              <Settings size={16} color="#38bdf8" strokeWidth={2.5} />
              <Text style={s.sectionTitleTxt}>설정</Text>
            </View>
            <View style={s.settingsCard}>
              {SETTINGS.map(({ Icon, label, sub, toggle, toggleKey, danger }, i) => {
                const isOn = toggleKey ? toggles[toggleKey] : false;
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => {
                      if (danger) { handleLogout(); }
                      else if (toggleKey) { setToggles(p => ({ ...p, [toggleKey]: !p[toggleKey] })); }
                    }}
                    style={[s.settingRow, i < SETTINGS.length - 1 && s.settingBorder]}
                    activeOpacity={0.7}
                  >
                    <View style={[s.settingIconWrap, danger && s.settingIconWrapDanger]}>
                      <Icon size={16} color={danger ? '#f87171' : '#6b7280'} strokeWidth={2.5} />
                    </View>
                    <View style={s.settingText}>
                      <Text style={[s.settingLabel, danger && s.settingLabelDanger]}>{label}</Text>
                      {sub ? <Text style={s.settingSubLabel}>{sub}</Text> : null}
                    </View>
                    {toggle ? (
                      <View style={[s.toggleTrack, isOn && s.toggleTrackOn]}>
                        <View style={[s.toggleThumb, { left: isOn ? 20 : 4 }]} />
                      </View>
                    ) : !danger ? (
                      <ChevronRight size={16} color="#d1d5db" strokeWidth={2.5} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Banner */}
          <LinearGradient colors={['#f472b6','#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.banner}>
            <View style={s.bannerIcon}>
              <Heart size={20} color="#fff" strokeWidth={2.5} />
            </View>
            <View style={s.bannerText}>
              <Text style={s.bannerTitle}>오늘도 수연 파이팅! 🔥</Text>
              <Text style={s.bannerSub}>7일 연속 달성 중! 계속 달려봐요</Text>
            </View>
          </LinearGradient>

          <View style={{ height: 8 }} />
        </ScrollView>

        <BottomNav active="mypage" navigation={navigation} />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerSub: { fontSize: 10, fontWeight: '700', color: '#9ca3af', letterSpacing: 3, textTransform: 'uppercase' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#111827', letterSpacing: -0.3 },
  editBtn: { width: 36, height: 36, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 16 },

  profileCard: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#fce7f3', padding: 16, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatarImg: { width: 64, height: 64, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#fbcfe8' },
  avatarImgInner: { width: '100%', height: '100%' },
  cameraBtn: { position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  profileInfo: { flex: 1, gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  profileName: { fontSize: 16, fontWeight: '900', color: '#111827' },
  titleBadge: { backgroundColor: '#fdf2f8', borderWidth: 1, borderColor: '#fbcfe8', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  titleBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#ec4899' },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankTxt: { fontSize: 12, fontWeight: '700', color: '#374151' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakTxt: { fontSize: 12, fontWeight: '700', color: '#fb923c' },

  expSection: { gap: 6 },
  expLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  expLvRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  expLvBadge: { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  expLvTxt: { fontSize: 11, fontWeight: '900', color: '#1f2937' },
  expNumTxt: { fontSize: 10, fontWeight: '700', color: '#9ca3af' },
  expBarBg: { width: '100%', height: 8, backgroundColor: '#f3f4f6', borderRadius: 99, overflow: 'hidden' },
  expBarFill: { height: '100%', borderRadius: 99 },
  expNextTxt: { fontSize: 10, fontWeight: '600', color: '#9ca3af', textAlign: 'right' },

  section: { gap: 10 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitleTxt: { fontSize: 14, fontWeight: '900', color: '#1f2937' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  statIconWrap: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 14, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '600', color: '#9ca3af' },

  badgeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllTxt: { fontSize: 11, fontWeight: '700', color: '#ec4899' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeItem: { alignItems: 'center', gap: 4 },
  badgeCircle: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  badgeEmoji: { fontSize: 20 },
  badgeLabel: { fontSize: 9, fontWeight: '700', color: '#6b7280', textAlign: 'center' },

  settingsCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  settingIconWrap: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  settingIconWrapDanger: { backgroundColor: '#fef2f2' },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 13, fontWeight: '900', color: '#1f2937' },
  settingLabelDanger: { color: '#f87171' },
  settingSubLabel: { fontSize: 10, fontWeight: '600', color: '#9ca3af' },
  toggleTrack: { width: 40, height: 22, borderRadius: 11, backgroundColor: '#e5e7eb', position: 'relative' },
  toggleTrackOn: { backgroundColor: '#f472b6' },
  toggleThumb: { position: 'absolute', top: 3, width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2, elevation: 2 },

  banner: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerIcon: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 14, fontWeight: '900', color: '#fff' },
  bannerSub: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
});
