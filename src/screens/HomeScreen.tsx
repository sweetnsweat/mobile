import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Animated, Easing, Dimensions, StatusBar, Image, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Flame, Trophy, Zap, Crown } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { ScreenBackground } from '../components/ScreenBackground';
import { BottomNav } from '../components/BottomNav';
import { SectionHeader } from '../components/SectionHeader';
import { getMyProfile } from '../services/UserService';
import { getTodayRoutine, TodayRoutineResponse } from '../services/RoutineService';
import {
  getWeeklyActivityRankings,
  getWorldBanners,
  getWorldRankings,
  resolveMediaUrl,
  WeeklyActivityRankingItem,
  WorldBannerSlide,
  WorldRankingItem,
} from '../services/HomeService';
import { RoutineDetailModal } from './RoutineDetailModal';

const { width: W } = Dimensions.get('window');

const ROUTINE_COLORS: [string, string][] = [
  ['#f472b6', '#fb7185'],
  ['#38bdf8', '#60a5fa'],
  ['#a78bfa', '#818cf8'],
  ['#34d399', '#10b981'],
];

function routineEmoji(sessionType?: string | null): string {
  if (sessionType === 'cardio') return '🏃';
  if (sessionType === 'upper_body') return '💪';
  if (sessionType === 'lower_body') return '🦵';
  if (sessionType === 'core_recovery' || sessionType === 'recovery') return '🧘';
  if (sessionType === 'full_body') return '🏋️';
  return '✨';
}

function todayRoutineTitle(todayRoutine: TodayRoutineResponse): string {
  if (!todayRoutine.activeRoutineExists) return '루틴 설정 필요';
  if (!todayRoutine.routineScheduledToday) return '오늘은 쉬는 날';
  return todayRoutine.session?.sessionName ?? todayRoutine.routine?.name ?? '오늘의 루틴';
}

function todayRoutineSubtitle(todayRoutine: TodayRoutineResponse): string {
  if (!todayRoutine.activeRoutineExists) return '루틴을 설정하면 오늘 할 운동을 보여드려요.';
  if (!todayRoutine.routineScheduledToday) return `${todayRoutine.dayOfWeekDisplayName}은 예정된 운동이 없습니다.`;

  const routineName = todayRoutine.routine?.name;
  const count = todayRoutine.session?.items.length ?? 0;
  const minutes = todayRoutine.session?.estimatedMinutes ?? todayRoutine.routine?.estimatedMinutes;

  if (routineName && minutes) return `${routineName} · ${count}개 운동 · ${minutes}분`;
  if (routineName) return `${routineName} · ${count}개 운동`;
  return `${count}개 운동`;
}

function todayRoutineBadge(todayRoutine: TodayRoutineResponse): string {
  if (!todayRoutine.activeRoutineExists) return '설정 필요';
  if (!todayRoutine.routineScheduledToday) return '휴식';

  const minutes = todayRoutine.session?.estimatedMinutes ?? todayRoutine.routine?.estimatedMinutes;
  if (minutes) return `${minutes}분`;
  const count = todayRoutine.session?.items.length ?? 0;
  return `${count}개`;
}

function isTodayRoutineIdle(todayRoutine: TodayRoutineResponse): boolean {
  return !todayRoutine.activeRoutineExists || !todayRoutine.routineScheduledToday;
}

function todayRoutineWorkoutCount(todayRoutine: TodayRoutineResponse): number {
  return todayRoutine.session?.items.length ?? 0;
}

function getTimeGreeting(date = new Date()): string {
  const hour = (date.getUTCHours() + 9) % 24;
  if (hour < 5) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  if (hour < 22) return 'Good Evening';
  return 'Good Night';
}

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
const BANNER_H = 200;
const BANNER_W = W - 32;
const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
const WORLD_RANK_COLORS: Record<number, [string, string]> = {
  1: ['#facc15', '#f59e0b'],
  2: ['#d1d5db', '#9ca3af'],
  3: ['#fdba74', '#fb7185'],
};

type HomeSlide = { src: string; name: string; quote: string };
type HomeWorldRank = {
  rank: number;
  name: string;
  score: number;
  img: string;
  title: string;
  colors: [string, string];
  isMe: boolean;
};
type HomeWeeklyRank = { rank: number; name: string; score: number; medal: string; isMe: boolean };

function mapBannerSlide(slide: WorldBannerSlide): HomeSlide {
  const representativeLabel = [
    slide.representativeCharacterTitle,
    slide.representativeCharacterName,
  ].filter(Boolean).join(' ');

  return {
    src: resolveMediaUrl(slide.backgroundImageUrl || slide.imageUrl),
    name: representativeLabel || slide.headline || slide.worldTitle,
    quote: slide.quote || slide.summary || slide.genre || slide.worldTitle,
  };
}

function mapWorldRank(item: WorldRankingItem): HomeWorldRank {
  return {
    rank: item.rank,
    name: item.displayName || item.worldTitle,
    score: item.score,
    img: resolveMediaUrl(item.imageUrl),
    title: item.worldTitle,
    colors: WORLD_RANK_COLORS[item.rank] ?? ['#7dd3fc', '#60a5fa'],
    isMe: false,
  };
}

function mapWeeklyRank(item: WeeklyActivityRankingItem): HomeWeeklyRank {
  return {
    rank: item.rank,
    name: item.nickname,
    score: item.weeklyExp,
    medal: RANK_MEDAL[item.rank] ?? `${item.rank}`,
    isMe: item.isMe,
  };
}

export function HomeScreen({ navigation }: Props) {
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [nickname, setNickname] = useState('');
  const [greeting, setGreeting] = useState(getTimeGreeting());
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [worldRanking, setWorldRanking] = useState<HomeWorldRank[]>([]);
  const [weeklyRanking, setWeeklyRanking] = useState<HomeWeeklyRank[]>([]);
  const [homeDataLoading, setHomeDataLoading] = useState(false);
  const [todayRoutine, setTodayRoutine] = useState<TodayRoutineResponse | null>(null);
  const [todayRoutineLoading, setTodayRoutineLoading] = useState(false);
  const [routineModalVisible, setRoutineModalVisible] = useState(false);

  const nextIndex = slides.length > 0 ? (slide + 1) % slides.length : 0;

  useEffect(() => {
    getMyProfile().then(p => setNickname(p.nickname)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setGreeting(getTimeGreeting());
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useFocusEffect(useCallback(() => {
    loadHomeData();
    loadTodayRoutine();
  }, []));

  async function loadHomeData() {
    setHomeDataLoading(true);
    try {
      const [bannerData, worldRankingData, weeklyRankingData] = await Promise.all([
        getWorldBanners(3),
        getWorldRankings(5),
        getWeeklyActivityRankings(3),
      ]);

      const nextSlides = bannerData.map(mapBannerSlide).filter(item => item.src);
      const nextWorldRanking = worldRankingData.map(mapWorldRank);
      const nextWeeklyRanking = weeklyRankingData.map(mapWeeklyRank);

      setSlides(nextSlides);
      setWorldRanking(nextWorldRanking);
      setWeeklyRanking(nextWeeklyRanking);
    } catch (e) {
      console.log('[HomeAPI] loadHomeData error:', e);
      setSlides([]);
      setWorldRanking([]);
      setWeeklyRanking([]);
    } finally {
      setHomeDataLoading(false);
    }
  }

  async function loadTodayRoutine() {
    setTodayRoutineLoading(true);
    try {
      const routine = await getTodayRoutine();
      setTodayRoutine(routine);
    } catch {
      setTodayRoutine(null);
    } finally {
      setTodayRoutineLoading(false);
    }
  }

  useEffect(() => {
    const timer = setInterval(goNext, 3000);
    return () => clearInterval(timer);
  }, [slide, animating, slides.length]);

  useEffect(() => {
    if (slide >= slides.length) setSlide(0);
  }, [slide, slides.length]);

  function goNext() {
    if (animating || slides.length === 0) return;
    setAnimating(true);
    Animated.timing(slideAnim, {
      toValue: -BANNER_W,
      duration: 450,
      useNativeDriver: true,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }).start(() => {
      setSlide(prev => (prev + 1) % slides.length);
      requestAnimationFrame(() => {
        slideAnim.setValue(0);
        setAnimating(false);
      });
    });
  }

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* Top bar */}
        <View style={s.topBar}>
          <View>
            <Text style={s.greeting}>{greeting}</Text>
            <Text style={s.title}>{nickname}의 도전 🔥</Text>
          </View>
          <TouchableOpacity style={s.menuBtn}>
            <Menu size={16} color="#4b5563" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={s.searchWrap}>
          <View style={s.searchBar}>
            <Zap size={16} color="#9ca3af" strokeWidth={2.5} />
            <TextInput
              placeholder="퀘스트, 캐릭터, 친구 검색..."
              placeholderTextColor="#d1d5db"
              style={s.searchInput}
            />
          </View>
        </View>

        {/* Scroll body */}
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Slide banner */}
          <View style={[s.bannerWrap, { height: BANNER_H }]}>
            {slides.length === 0 ? (
              <View style={s.bannerPlaceholder}>
                {homeDataLoading ? <ActivityIndicator color="#ec4899" size="small" /> : null}
                <Text style={s.placeholderTitle}>{homeDataLoading ? '세계관을 불러오는 중...' : '표시할 세계관이 없습니다'}</Text>
              </View>
            ) : (
              <>
                <Animated.View style={[s.slideTrack, { transform: [{ translateX: slideAnim }] }]}>
                  <View style={s.slidePane}>
                    <ImageWithFallback uri={slides[slide].src} style={s.slideImg} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={s.slideOverlay} />
                    <View style={s.slideText}>
                      <Text style={s.slideName}>{slides[slide].name}</Text>
                      <Text style={s.slideQuote}>"{slides[slide].quote}"</Text>
                    </View>
                  </View>
                  <View style={s.slidePane}>
                    <ImageWithFallback uri={slides[nextIndex].src} style={s.slideImg} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={s.slideOverlay} />
                    <View style={s.slideText}>
                      <Text style={s.slideName}>{slides[nextIndex].name}</Text>
                      <Text style={s.slideQuote}>"{slides[nextIndex].quote}"</Text>
                    </View>
                  </View>
                </Animated.View>
                <View style={s.dots}>
                  {slides.map((_, i) => (
                    <View
                      key={i}
                      style={[s.dot, { width: i === slide ? 20 : 6, backgroundColor: i === slide ? '#fff' : 'rgba(255,255,255,0.4)' }]}
                    />
                  ))}
                </View>
              </>
            )}
          </View>

          {/* World ranking */}
          <View style={s.section}>
            <SectionHeader
              icon={<Crown size={16} color="#facc15" strokeWidth={2.5} />}
              title="세계관 랭킹"
              onMore={() => navigation.navigate('WorldRanking')}
            />

            {worldRanking.length < 3 ? (
              <View style={s.placeholderCard}>
                {homeDataLoading ? <ActivityIndicator color="#ec4899" size="small" /> : null}
                <Text style={s.placeholderTitle}>{homeDataLoading ? '랭킹을 불러오는 중...' : '세계관 랭킹이 없습니다'}</Text>
              </View>
            ) : (
              <>
            <View style={s.podium}>
              {/* 2위 */}
              <View style={s.podiumItem}>
                <View style={[s.podiumImg, { width: 48, height: 48, borderColor: '#d1d5db' }]}>
                  {worldRanking[1].img ? (
                    <Image source={{ uri: worldRanking[1].img }} style={s.podiumImgInner} resizeMode="cover" />
                  ) : <View style={[s.podiumImgInner, { backgroundColor: '#e5e7eb' }]} />}
                </View>
                <LinearGradient colors={worldRanking[1].colors} style={[s.podiumLabel, { minWidth: 56 }]}>
                  <Text style={s.podiumRank}>🥈 2위</Text>
                  <Text style={s.podiumName} numberOfLines={1}>{worldRanking[1].name}</Text>
                  <Text style={s.podiumScore}>{worldRanking[1].score.toLocaleString()}</Text>
                </LinearGradient>
              </View>
              {/* 1위 */}
              <View style={[s.podiumItem, { marginTop: -12 }]}>
                <Text style={s.crown}>👑</Text>
                <View style={[s.podiumImg, { width: 56, height: 56, borderColor: '#facc15' }]}>
                  {worldRanking[0].img ? (
                    <Image source={{ uri: worldRanking[0].img }} style={s.podiumImgInner} resizeMode="cover" />
                  ) : <View style={[s.podiumImgInner, { backgroundColor: '#e5e7eb' }]} />}
                </View>
                <LinearGradient colors={worldRanking[0].colors} style={[s.podiumLabel, { minWidth: 64 }]}>
                  <Text style={s.podiumRank}>🥇 1위</Text>
                  <Text style={s.podiumName} numberOfLines={1}>{worldRanking[0].name}</Text>
                  <Text style={s.podiumScore}>{worldRanking[0].score.toLocaleString()}</Text>
                </LinearGradient>
              </View>
              {/* 3위 */}
              <View style={s.podiumItem}>
                <View style={[s.podiumImg, { width: 48, height: 48, borderColor: '#fdba74' }]}>
                  {worldRanking[2].img ? (
                    <Image source={{ uri: worldRanking[2].img }} style={s.podiumImgInner} resizeMode="cover" />
                  ) : <View style={[s.podiumImgInner, { backgroundColor: '#e5e7eb' }]} />}
                </View>
                <LinearGradient colors={worldRanking[2].colors} style={[s.podiumLabel, { minWidth: 56 }]}>
                  <Text style={s.podiumRank}>🥉 3위</Text>
                  <Text style={s.podiumName} numberOfLines={1}>{worldRanking[2].isMe ? nickname : worldRanking[2].name}</Text>
                  <Text style={s.podiumScore}>{worldRanking[2].score.toLocaleString()}</Text>
                </LinearGradient>
              </View>
            </View>

            {/* 4-5위 */}
            <View style={s.listCard}>
              {worldRanking.slice(3).map((r, i) => (
                <View key={r.rank} style={[s.listRow, i < worldRanking.slice(3).length - 1 && s.listBorder]}>
                  <Text style={s.listRank}>{r.rank}</Text>
                  <View style={s.listAvatar}>
                    {r.img ? (
                      <Image source={{ uri: r.img }} style={s.listAvatarImg} resizeMode="cover" />
                    ) : <View style={[s.listAvatarImg, { backgroundColor: '#e5e7eb' }]} />}
                  </View>
                  <View style={s.listInfo}>
                    <Text style={s.listName}>{r.isMe ? nickname : r.name}</Text>
                    <Text style={s.listTitle}>{r.title}</Text>
                  </View>
                  <View style={s.listScore}>
                    <Flame size={12} color="#fb923c" strokeWidth={2.5} />
                    <Text style={s.listScoreTxt}>{r.score.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>
              </>
            )}
          </View>

          {/* Today's routine */}
          <View style={s.section}>
            <SectionHeader
              icon={<Zap size={16} color="#facc15" strokeWidth={2.5} />}
              title="오늘의 루틴"
            />
            {todayRoutineLoading ? (
              <View style={s.routineCard}>
                <Text style={s.routineSub}>오늘의 루틴 불러오는 중...</Text>
              </View>
            ) : todayRoutine && !todayRoutine.activeRoutineExists ? (
              <View style={s.routineCard}>
                <LinearGradient colors={ROUTINE_COLORS[0]} style={s.routineIcon}>
                  <Text style={{ fontSize: 20 }}>✨</Text>
                </LinearGradient>
                <View style={s.routineInfo}>
                  <Text style={s.routineTitle}>루틴 설정 필요</Text>
                  <Text style={s.routineSub}>루틴을 설정하면 오늘 할 운동을 보여드려요.</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('RoutineSetup', { todayConditionCompleted: true, hideSkip: true })}
                  style={s.createRoutineBtn}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={['#ec4899', '#f472b6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.createRoutineGrad}>
                    <Text style={s.createRoutineTxt}>루틴 생성</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : todayRoutine ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setRoutineModalVisible(true)}
                style={[s.routineCard, isTodayRoutineIdle(todayRoutine) && s.routineCardIdle]}
              >
                <LinearGradient colors={ROUTINE_COLORS[0]} style={s.routineIcon}>
                  <Text style={{ fontSize: 20 }}>{routineEmoji(todayRoutine.session?.sessionType)}</Text>
                </LinearGradient>
                <View style={s.routineInfo}>
                  <Text style={s.routineTitle}>{todayRoutineTitle(todayRoutine)}</Text>
                  <Text style={s.routineSub}>{todayRoutineSubtitle(todayRoutine)}</Text>
                </View>
                <View style={s.routineRight}>
                  <View style={s.routineMetaBadge}>
                    <Text style={s.routineMetaTxt}>{todayRoutineBadge(todayRoutine)}</Text>
                  </View>
                  {isTodayRoutineIdle(todayRoutine) ? (
                    <View style={s.routineIdleBadge}>
                      <Text style={s.routineIdleTxt}>휴식</Text>
                    </View>
                  ) : (
                    <View style={s.routineReadyBadge}>
                      <Text style={s.routineReadyTxt}>{todayRoutineWorkoutCount(todayRoutine)}개 운동</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ) : (
              <View style={s.routineCard}>
                <View style={s.routineInfo}>
                  <Text style={s.routineTitle}>오늘의 루틴 없음</Text>
                  <Text style={s.routineSub}>루틴 정보를 불러오지 못했습니다.</Text>
                </View>
              </View>
            )}
          </View>

          {/* Weekly ranking */}
          <View style={s.section}>
            <SectionHeader
              icon={<Trophy size={16} color="#fb923c" strokeWidth={2.5} />}
              title="이번 주 랭킹"
              onMore={() => navigation.navigate('ActivityRankingDetail')}
            />
            {weeklyRanking.length === 0 ? (
              <View style={s.placeholderCard}>
                {homeDataLoading ? <ActivityIndicator color="#ec4899" size="small" /> : null}
                <Text style={s.placeholderTitle}>{homeDataLoading ? '랭킹을 불러오는 중...' : '이번 주 랭킹이 없습니다'}</Text>
              </View>
            ) : (
              <View style={s.listCard}>
              {weeklyRanking.map((r, i) => (
                <View
                  key={r.rank}
                  style={[s.rankRow, i < weeklyRanking.length - 1 && s.listBorder, r.isMe && s.rankRowMe]}
                >
                  <Text style={s.medal}>{r.medal}</Text>
                  <Text style={[s.rankName, r.isMe && s.rankNameMe]}>{r.isMe ? `나 (${nickname})` : r.name}</Text>
                  <View style={s.listScore}>
                    <Flame size={14} color="#fb923c" strokeWidth={2.5} />
                    <Text style={s.rankScore}>{r.score.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
              </View>
            )}
          </View>

          <View style={{ height: 8 }} />
        </ScrollView>

        <BottomNav active="home" navigation={navigation} />
      </SafeAreaView>

      <RoutineDetailModal
        visible={routineModalVisible}
        routine={todayRoutine}
        onClose={() => setRoutineModalVisible(false)}
      />
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  greeting: { fontSize: 10, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { fontSize: 18, fontWeight: '900', color: '#111827', letterSpacing: -0.3 },
  menuBtn: { width: 36, height: 36, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 12, fontWeight: '600', color: '#374151' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 8, gap: 16 },

  /* Banner */
  bannerWrap: { borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: '#fbcfe8', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 },
  bannerPlaceholder: { height: BANNER_H, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', gap: 8 },
  placeholderCard: { backgroundColor: '#f3f4f6', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', minHeight: 84, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14 },
  placeholderTitle: { fontSize: 12, fontWeight: '800', color: '#9ca3af' },
  slideTrack: { flexDirection: 'row', width: BANNER_W * 2, height: BANNER_H },
  slidePane: { width: BANNER_W, height: BANNER_H, overflow: 'hidden' },
  slideImg: { position: 'absolute', top: 0, width: '100%', height: BANNER_H * 1.5 },
  slideOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: BANNER_H * 0.6 },
  slideText: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  slideName: { fontSize: 10, fontWeight: '700', color: '#f9a8d4', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  slideQuote: { color: '#fff', fontWeight: '900', fontSize: 13, lineHeight: 18 },
  dots: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 4 },
  dot: { height: 6, borderRadius: 99 },

  /* Section */
  section: { gap: 10 },

  /* Podium */
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 8 },
  podiumItem: { alignItems: 'center', gap: 4 },
  crown: { fontSize: 18 },
  podiumImg: { borderRadius: 16, overflow: 'hidden', borderWidth: 2 },
  podiumImgInner: { width: '100%', height: '100%' },
  podiumLabel: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6, alignItems: 'center' },
  podiumRank: { fontSize: 9, fontWeight: '900', color: '#fff' },
  podiumName: { fontSize: 10, fontWeight: '900', color: '#fff', maxWidth: 56, textAlign: 'center' },
  podiumScore: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },

  /* List card */
  listCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  listBorder: { borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 12 },
  listRank: { fontSize: 12, fontWeight: '900', color: '#9ca3af', width: 16, textAlign: 'center' },
  listAvatar: { width: 32, height: 32, borderRadius: 12, overflow: 'hidden' },
  listAvatarImg: { width: '100%', height: '100%' },
  listInfo: { flex: 1 },
  listName: { fontSize: 12, fontWeight: '900', color: '#1f2937' },
  listTitle: { fontSize: 9, color: '#9ca3af', fontWeight: '600' },
  listScore: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  listScoreTxt: { fontSize: 12, fontWeight: '900', color: '#374151' },

  /* Routine */
  routineCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  routineIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  routineInfo: { flex: 1 },
  routineTitle: { fontSize: 14, fontWeight: '900', color: '#111827' },
  routineSub: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  routineRight: { alignItems: 'flex-end', gap: 4 },
  routineMetaBadge: { backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde047', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  routineMetaTxt: { fontSize: 11, fontWeight: '900', color: '#ca8a04' },
  routineCardIdle: { opacity: 0.65 },
  createRoutineBtn: { borderRadius: 10, overflow: 'hidden' },
  createRoutineGrad: { paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  createRoutineTxt: { fontSize: 11, fontWeight: '700', color: '#fff' },
  routineIdleBadge: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#86efac', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 },
  routineIdleTxt: { fontSize: 10, fontWeight: '900', color: '#16a34a' },
  routineReadyBadge: { backgroundColor: '#e0f2fe', borderWidth: 1, borderColor: '#7dd3fc', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 },
  routineReadyTxt: { fontSize: 10, fontWeight: '900', color: '#0284c7' },
  /* Weekly rank */
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  rankRowMe: { backgroundColor: '#fdf2f8' },
  medal: { fontSize: 18, width: 24, textAlign: 'center' },
  rankName: { flex: 1, fontSize: 14, fontWeight: '900', color: '#1f2937' },
  rankNameMe: { color: '#db2777' },
  rankScore: { fontSize: 14, fontWeight: '900', color: '#374151' },
});
