import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Animated, Easing, Dimensions, StatusBar, Image,
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

const { width: W } = Dimensions.get('window');

const SLIDES = [
  { src: 'https://i.imgur.com/ub32dOr.png', name: '민수 선배', quote: '열심히 연습해서 내년엔 내 후배 하는 거야?' },
  { src: 'https://i.imgur.com/83q0Fz8.jpeg', name: '칼라일', quote: '고작 그 정도 각오로 황제가 되겠다는 건가?' },
  { src: 'https://i.imgur.com/Zl9DFkK.jpeg', name: '라이벌 하준', quote: '너 요즘 늘었던데… 긴장되기 시작했어.' },
];

const QUESTS = [
  { emoji: '🏃', title: '3km 러닝', sub: '25분 이내', exp: 30, colors: ['#f472b6', '#fb7185'] as [string, string] },
  { emoji: '💪', title: '스쿼트 50개', sub: '3세트', exp: 20, colors: ['#38bdf8', '#60a5fa'] as [string, string] },
];

const RANKING = [
  { rank: 1, name: '하준', score: 1240, medal: '🥇' },
  { rank: 2, name: '나 (수연)', score: 980, medal: '🥈' },
  { rank: 3, name: '민지', score: 860, medal: '🥉' },
];

const WORLD_RANKING = [
  { rank: 1, name: '칼라일', score: 9820, img: 'https://i.imgur.com/83q0Fz8.jpeg', title: '황제', colors: ['#facc15', '#f59e0b'] as [string, string] },
  { rank: 2, name: '라이벌 하준', score: 8740, img: 'https://i.imgur.com/Zl9DFkK.jpeg', title: '도전자', colors: ['#d1d5db', '#9ca3af'] as [string, string] },
  { rank: 3, name: '이수연', score: 7210, img: 'https://i.imgur.com/v0njcuh.png', title: '불꽃', colors: ['#fdba74', '#fb7185'] as [string, string] },
  { rank: 4, name: '민수 선배', score: 6540, img: 'https://i.imgur.com/ub32dOr.png', title: '베테랑', colors: ['#7dd3fc', '#60a5fa'] as [string, string] },
  { rank: 5, name: '김태양', score: 5980, img: '', title: '신예', colors: ['#6ee7b7', '#2dd4bf'] as [string, string] },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
const BANNER_H = 200;

export function HomeScreen({ navigation }: Props) {
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const nextIndex = (slide + 1) % SLIDES.length;

  useEffect(() => {
    const timer = setInterval(goNext, 3000);
    return () => clearInterval(timer);
  }, [slide, animating]);

  function goNext() {
    if (animating) return;
    setAnimating(true);
    Animated.timing(slideAnim, {
      toValue: -W,
      duration: 450,
      useNativeDriver: true,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }).start(() => {
      slideAnim.setValue(0);
      setSlide(prev => (prev + 1) % SLIDES.length);
      setAnimating(false);
    });
  }

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* Top bar */}
        <View style={s.topBar}>
          <View>
            <Text style={s.greeting}>Good Morning</Text>
            <Text style={s.title}>수연의 도전 🔥</Text>
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
            <Animated.View style={[s.slideTrack, { transform: [{ translateX: slideAnim }] }]}>
              <View style={{ width: W - 32, height: BANNER_H, overflow: 'hidden' }}>
                <ImageWithFallback uri={SLIDES[slide].src} style={s.slideImg} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={s.slideOverlay} />
                <View style={s.slideText}>
                  <Text style={s.slideName}>{SLIDES[slide].name}</Text>
                  <Text style={s.slideQuote}>"{SLIDES[slide].quote}"</Text>
                </View>
              </View>
              <View style={{ width: W - 32, height: BANNER_H, overflow: 'hidden' }}>
                <ImageWithFallback uri={SLIDES[nextIndex].src} style={s.slideImg} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={s.slideOverlay} />
                <View style={s.slideText}>
                  <Text style={s.slideName}>{SLIDES[nextIndex].name}</Text>
                  <Text style={s.slideQuote}>"{SLIDES[nextIndex].quote}"</Text>
                </View>
              </View>
            </Animated.View>
            <View style={s.dots}>
              {SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={[s.dot, { width: i === slide ? 20 : 6, backgroundColor: i === slide ? '#fff' : 'rgba(255,255,255,0.4)' }]}
                />
              ))}
            </View>
          </View>

          {/* World ranking */}
          <View style={s.section}>
            <SectionHeader
              icon={<Crown size={16} color="#facc15" strokeWidth={2.5} />}
              title="세계관 랭킹"
              onMore={() => navigation.navigate('WorldRanking')}
            />

            {/* TOP 3 podium */}
            <View style={s.podium}>
              {/* 2위 */}
              <View style={s.podiumItem}>
                <View style={[s.podiumImg, { width: 48, height: 48, borderColor: '#d1d5db' }]}>
                  {WORLD_RANKING[1].img ? (
                    <Image source={{ uri: WORLD_RANKING[1].img }} style={s.podiumImgInner} resizeMode="cover" />
                  ) : <View style={[s.podiumImgInner, { backgroundColor: '#e5e7eb' }]} />}
                </View>
                <LinearGradient colors={WORLD_RANKING[1].colors} style={[s.podiumLabel, { minWidth: 56 }]}>
                  <Text style={s.podiumRank}>🥈 2위</Text>
                  <Text style={s.podiumName} numberOfLines={1}>{WORLD_RANKING[1].name}</Text>
                  <Text style={s.podiumScore}>{WORLD_RANKING[1].score.toLocaleString()}</Text>
                </LinearGradient>
              </View>
              {/* 1위 */}
              <View style={[s.podiumItem, { marginTop: -12 }]}>
                <Text style={s.crown}>👑</Text>
                <View style={[s.podiumImg, { width: 56, height: 56, borderColor: '#facc15' }]}>
                  {WORLD_RANKING[0].img ? (
                    <Image source={{ uri: WORLD_RANKING[0].img }} style={s.podiumImgInner} resizeMode="cover" />
                  ) : <View style={[s.podiumImgInner, { backgroundColor: '#e5e7eb' }]} />}
                </View>
                <LinearGradient colors={WORLD_RANKING[0].colors} style={[s.podiumLabel, { minWidth: 64 }]}>
                  <Text style={s.podiumRank}>🥇 1위</Text>
                  <Text style={s.podiumName} numberOfLines={1}>{WORLD_RANKING[0].name}</Text>
                  <Text style={s.podiumScore}>{WORLD_RANKING[0].score.toLocaleString()}</Text>
                </LinearGradient>
              </View>
              {/* 3위 */}
              <View style={s.podiumItem}>
                <View style={[s.podiumImg, { width: 48, height: 48, borderColor: '#fdba74' }]}>
                  {WORLD_RANKING[2].img ? (
                    <Image source={{ uri: WORLD_RANKING[2].img }} style={s.podiumImgInner} resizeMode="cover" />
                  ) : <View style={[s.podiumImgInner, { backgroundColor: '#e5e7eb' }]} />}
                </View>
                <LinearGradient colors={WORLD_RANKING[2].colors} style={[s.podiumLabel, { minWidth: 56 }]}>
                  <Text style={s.podiumRank}>🥉 3위</Text>
                  <Text style={s.podiumName} numberOfLines={1}>{WORLD_RANKING[2].name}</Text>
                  <Text style={s.podiumScore}>{WORLD_RANKING[2].score.toLocaleString()}</Text>
                </LinearGradient>
              </View>
            </View>

            {/* 4-5위 */}
            <View style={s.listCard}>
              {WORLD_RANKING.slice(3).map((r, i) => (
                <View key={r.rank} style={[s.listRow, i < WORLD_RANKING.slice(3).length - 1 && s.listBorder]}>
                  <Text style={s.listRank}>{r.rank}</Text>
                  <View style={s.listAvatar}>
                    {r.img ? (
                      <Image source={{ uri: r.img }} style={s.listAvatarImg} resizeMode="cover" />
                    ) : <View style={[s.listAvatarImg, { backgroundColor: '#e5e7eb' }]} />}
                  </View>
                  <View style={s.listInfo}>
                    <Text style={s.listName}>{r.name}</Text>
                    <Text style={s.listTitle}>{r.title}</Text>
                  </View>
                  <View style={s.listScore}>
                    <Flame size={12} color="#fb923c" strokeWidth={2.5} />
                    <Text style={s.listScoreTxt}>{r.score.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Today's quests */}
          <View style={s.section}>
            <SectionHeader
              icon={<Zap size={16} color="#facc15" strokeWidth={2.5} />}
              title="오늘의 퀘스트"
            />
            {QUESTS.map(q => (
              <View key={q.title} style={s.questCard}>
                <LinearGradient colors={q.colors} style={s.questIcon}>
                  <Text style={{ fontSize: 20 }}>{q.emoji}</Text>
                </LinearGradient>
                <View style={s.questInfo}>
                  <Text style={s.questTitle}>{q.title}</Text>
                  <Text style={s.questSub}>{q.sub}</Text>
                </View>
                <View style={s.questRight}>
                  <View style={s.expBadge}>
                    <Text style={s.expTxt}>+{q.exp} EXP ⭐</Text>
                  </View>
                  <TouchableOpacity>
                    <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.startQuestBtn}>
                      <Text style={s.startQuestTxt}>시작</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Weekly ranking */}
          <View style={s.section}>
            <SectionHeader
              icon={<Trophy size={16} color="#fb923c" strokeWidth={2.5} />}
              title="이번 주 랭킹"
            />
            <View style={s.listCard}>
              {RANKING.map((r, i) => (
                <View
                  key={r.rank}
                  style={[s.rankRow, i < RANKING.length - 1 && s.listBorder, r.name.includes('수연') && s.rankRowMe]}
                >
                  <Text style={s.medal}>{r.medal}</Text>
                  <Text style={[s.rankName, r.name.includes('수연') && s.rankNameMe]}>{r.name}</Text>
                  <View style={s.listScore}>
                    <Flame size={14} color="#fb923c" strokeWidth={2.5} />
                    <Text style={s.rankScore}>{r.score.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 8 }} />
        </ScrollView>

        <BottomNav active="home" navigation={navigation} />
      </SafeAreaView>
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
  slideTrack: { flexDirection: 'row', width: (W - 32) * 2, height: BANNER_H },
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

  /* Quest */
  questCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  questIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  questInfo: { flex: 1 },
  questTitle: { fontSize: 14, fontWeight: '900', color: '#111827' },
  questSub: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  questRight: { alignItems: 'flex-end', gap: 4 },
  expBadge: { backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde047', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  expTxt: { fontSize: 11, fontWeight: '900', color: '#ca8a04' },
  startQuestBtn: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  startQuestTxt: { fontSize: 10, fontWeight: '700', color: '#fff' },

  /* Weekly rank */
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  rankRowMe: { backgroundColor: '#fdf2f8' },
  medal: { fontSize: 18, width: 24, textAlign: 'center' },
  rankName: { flex: 1, fontSize: 14, fontWeight: '900', color: '#1f2937' },
  rankNameMe: { color: '#db2777' },
  rankScore: { fontSize: 14, fontWeight: '900', color: '#374151' },
});
