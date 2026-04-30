import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Flame, Crown, Search } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenBackground } from '../components/ScreenBackground';
import { BottomNav } from '../components/BottomNav';
import { ImageWithFallback } from '../components/ImageWithFallback';

type Props = NativeStackScreenProps<RootStackParamList, 'WorldRanking'>;

const GENRES = ['전체','로맨스','판타지','무협','학원물','현대'];

const WORLD_RANKING = [
  { rank: 1, name: '칼라일',    title: '황제',    score: 9820, img: 'https://i.imgur.com/83q0Fz8.jpeg', colors: ['#facc15','#d97706'] as [string,string], tags: ['#최강자','#황제군림','#무패'],    genre: '판타지', streak: 42, emoji: '' },
  { rank: 2, name: '라이벌 하준',title: '도전자',  score: 8740, img: 'https://i.imgur.com/Zl9DFkK.jpeg', colors: ['#d1d5db','#9ca3af'] as [string,string], tags: ['#라이벌','#끝없는도전','#2위탈출'],genre: '현대',   streak: 31, emoji: '' },
  { rank: 3, name: '이수연',    title: '불꽃',    score: 7210, img: 'https://i.imgur.com/v0njcuh.png',   colors: ['#fda4af','#fb7185'] as [string,string], tags: ['#불꽃챌린저','#7연속','#성장중'],  genre: '학원물', streak: 7,  emoji: '' },
  { rank: 4, name: '민수 선배', title: '베테랑',  score: 6540, img: 'https://i.imgur.com/ub32dOr.png',   colors: ['#7dd3fc','#60a5fa'] as [string,string], tags: ['#베테랑','#선배','#경험치'],      genre: '학원물', streak: 19, emoji: '' },
  { rank: 5, name: '김태양',   title: '신예',    score: 5980, img: '',                                  colors: ['#6ee7b7','#5eead4'] as [string,string], tags: ['#신예','#급성장','#주목'],        genre: '로맨스', streak: 12, emoji: '☀️' },
  { rank: 6, name: '박서진',   title: '철인',    score: 5120, img: '',                                  colors: ['#c4b5fd','#a78bfa'] as [string,string], tags: ['#철인','#꾸준함','#지구력'],      genre: '무협',   streak: 25, emoji: '🛡️' },
  { rank: 7, name: '최유나',   title: '스피드퀸', score: 4780, img: '',                                  colors: ['#f9a8d4','#fda4af'] as [string,string], tags: ['#스피드퀸','#러닝','#최속'],      genre: '로맨스', streak: 9,  emoji: '⚡' },
  { rank: 8, name: '강민혁',   title: '근육맨',  score: 4320, img: '',                                  colors: ['#fca5a5','#fb923c'] as [string,string], tags: ['#근육맨','#웨이트','#파워'],      genre: '무협',   streak: 14, emoji: '💥' },
];

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };


export function WorldRankingScreen({ navigation }: Props) {
  const [genre, setGenre]   = useState('전체');
  const [search, setSearch] = useState('');

  const filtered = WORLD_RANKING.filter(r => {
    const matchGenre  = genre === '전체' || r.genre === genre;
    const matchSearch = !search || r.name.includes(search) || r.title.includes(search);
    return matchGenre && matchSearch;
  });

  const showTop3 = !search && genre === '전체';

  const top1 = WORLD_RANKING[0];
  const top2 = WORLD_RANKING[1];
  const top3 = WORLD_RANKING[2];

  return (
    <ScreenBackground end={{ x: 0, y: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ChevronLeft size={16} color="#4b5563" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={s.headerText}>
            <Text style={s.headerSub}>Leaderboard</Text>
            <View style={s.headerTitleRow}>
              <Crown size={16} color="#facc15" strokeWidth={2.5} />
              <Text style={s.headerTitle}>세계관 랭킹</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <View style={s.searchBar}>
            <Search size={16} color="#9ca3af" strokeWidth={2.5} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="이름, 칭호 검색..."
              placeholderTextColor="#d1d5db"
              style={s.searchInput}
            />
          </View>
        </View>

        {/* Genre filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.genreScroll} contentContainerStyle={s.genreContent}>
          {GENRES.map(g => (
            <TouchableOpacity key={g} onPress={() => setGenre(g)} style={s.genreBtnWrap} activeOpacity={0.8}>
              {genre === g ? (
                <LinearGradient colors={['#ec4899','#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.genreBtnActive}>
                  <Text style={s.genreBtnActiveTxt}>{g}</Text>
                </LinearGradient>
              ) : (
                <View style={s.genreBtnInactive}>
                  <Text style={s.genreBtnInactiveTxt}>{g}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Scroll body */}
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {/* TOP 3 podium */}
          {showTop3 && (
            <View style={s.podium}>
              {/* 2nd */}
              <View style={s.podiumItem}>
                <View style={[s.podiumImg, { borderColor: '#d1d5db', width: 56, height: 56 }]}>
                  {top2.img ? (
                    <ImageWithFallback uri={top2.img} style={s.podiumImgInner} />
                  ) : (
                    <LinearGradient colors={top2.colors} style={s.podiumImgInner} />
                  )}
                </View>
                <LinearGradient colors={top2.colors} style={[s.podiumLabel, { minWidth: 60 }]}>
                  <Text style={s.podiumRankTxt}>🥈 2위</Text>
                  <Text style={s.podiumNameTxt} numberOfLines={1}>{top2.name}</Text>
                  <Text style={s.podiumScoreTxt}>{top2.score.toLocaleString()}</Text>
                </LinearGradient>
              </View>

              {/* 1st */}
              <View style={[s.podiumItem, { marginTop: -16 }]}>
                <Text style={s.crownEmoji}>👑</Text>
                <View style={[s.podiumImg, { borderColor: '#facc15', width: 64, height: 64 }]}>
                  {top1.img ? (
                    <ImageWithFallback uri={top1.img} style={s.podiumImgInner} />
                  ) : (
                    <LinearGradient colors={top1.colors} style={s.podiumImgInner} />
                  )}
                </View>
                <LinearGradient colors={top1.colors} style={[s.podiumLabel, { minWidth: 68 }]}>
                  <Text style={s.podiumRankTxt}>🥇 1위</Text>
                  <Text style={s.podiumNameTxt} numberOfLines={1}>{top1.name}</Text>
                  <Text style={s.podiumScoreTxt}>{top1.score.toLocaleString()}</Text>
                </LinearGradient>
              </View>

              {/* 3rd */}
              <View style={s.podiumItem}>
                <View style={[s.podiumImg, { borderColor: '#fb923c', width: 56, height: 56 }]}>
                  {top3.img ? (
                    <ImageWithFallback uri={top3.img} style={s.podiumImgInner} />
                  ) : (
                    <LinearGradient colors={top3.colors} style={s.podiumImgInner} />
                  )}
                </View>
                <LinearGradient colors={top3.colors} style={[s.podiumLabel, { minWidth: 60 }]}>
                  <Text style={s.podiumRankTxt}>🥉 3위</Text>
                  <Text style={s.podiumNameTxt} numberOfLines={1}>{top3.name}</Text>
                  <Text style={s.podiumScoreTxt}>{top3.score.toLocaleString()}</Text>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyEmoji}>🔍</Text>
              <Text style={s.emptyTxt}>해당 장르의 캐릭터가 없어요</Text>
            </View>
          ) : (
            <View style={s.grid}>
              {filtered.map((r, idx) => (
                <View key={r.rank} style={[s.gridCard, r.name === '이수연' && s.gridCardMe]}>
                  {/* Image area */}
                  <View style={s.cardImgWrap}>
                    {r.img ? (
                      <ImageWithFallback uri={r.img} style={s.cardImg} />
                    ) : (
                      <LinearGradient colors={r.colors} style={[s.cardImg, { alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ fontSize: 36 }}>{r.emoji}</Text>
                      </LinearGradient>
                    )}
                    <LinearGradient
                      colors={['transparent','rgba(0,0,0,0.6)']}
                      style={s.cardImgOverlay}
                    />
                    {/* Rank badge */}
                    <View style={s.cardRankBadge}>
                      {MEDAL[r.rank] ? (
                        <Text style={{ fontSize: 14 }}>{MEDAL[r.rank]}</Text>
                      ) : (
                        <View style={s.cardRankNum}>
                          <Text style={s.cardRankNumTxt}>#{r.rank}</Text>
                        </View>
                      )}
                    </View>
                    {/* Streak */}
                    <View style={s.cardStreak}>
                      <Flame size={10} color="#fb923c" strokeWidth={2.5} />
                      <Text style={s.cardStreakTxt}>{r.streak}일</Text>
                    </View>
                    {/* Name overlay */}
                    <View style={s.cardNameOverlay}>
                      <Text style={s.cardName} numberOfLines={1}>{r.name}</Text>
                    </View>
                  </View>

                  {/* Text area */}
                  <View style={s.cardBody}>
                    <View style={s.cardTitleRow}>
                      <LinearGradient colors={r.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.cardTitleBadge}>
                        <Text style={s.cardTitleTxt}>{r.title}</Text>
                      </LinearGradient>
                      <View style={s.cardScoreRow}>
                        <Flame size={12} color="#fb923c" strokeWidth={2.5} />
                        <Text style={s.cardScore}>{r.score.toLocaleString()}</Text>
                      </View>
                    </View>
                    <View style={s.cardTagRow}>
                      <View style={s.cardGenreBadge}>
                        <Text style={s.cardGenreTxt}>{r.genre}</Text>
                      </View>
                      {r.tags.slice(0, 1).map(tag => (
                        <View key={tag} style={s.cardTagBadge}>
                          <Text style={s.cardTagTxt}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Me highlight */}
                  {r.name === '이수연' && <View style={s.meHighlight} />}
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 8 }} />
        </ScrollView>

        <BottomNav active="home" navigation={navigation} />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 32, height: 32, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1, flexShrink: 0 },
  headerText: { flex: 1 },
  headerSub: { fontSize: 10, fontWeight: '700', color: '#9ca3af', letterSpacing: 3, textTransform: 'uppercase' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#111827', letterSpacing: -0.3 },

  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  searchInput: { flex: 1, fontSize: 12, fontWeight: '600', color: '#374151' },

  genreScroll: { flexGrow: 0 },
  genreContent: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  genreBtnWrap: { flexShrink: 0 },
  genreBtnActive: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  genreBtnActiveTxt: { fontSize: 11, fontWeight: '900', color: '#fff' },
  genreBtnInactive: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  genreBtnInactiveTxt: { fontSize: 11, fontWeight: '900', color: '#9ca3af' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },

  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 16 },
  podiumItem: { alignItems: 'center', gap: 4 },
  crownEmoji: { fontSize: 20 },
  podiumImg: { borderRadius: 16, overflow: 'hidden', borderWidth: 2 },
  podiumImgInner: { width: '100%', height: '100%' },
  podiumLabel: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12, alignItems: 'center' },
  podiumRankTxt: { color: '#fff', fontWeight: '900', fontSize: 9 },
  podiumNameTxt: { color: '#fff', fontWeight: '900', fontSize: 10, maxWidth: 60, textAlign: 'center' },
  podiumScoreTxt: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 9 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 8 },
  emptyEmoji: { fontSize: 36 },
  emptyTxt: { fontSize: 12, fontWeight: '700', color: '#d1d5db' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: { width: '47%', backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  gridCardMe: { borderColor: '#f9a8d4' },

  cardImgWrap: { height: 130, position: 'relative' },
  cardImg: { width: '100%', height: '100%' },
  cardImgOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  cardRankBadge: { position: 'absolute', top: 8, left: 8 },
  cardRankNum: { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  cardRankNumTxt: { fontSize: 11, fontWeight: '900', color: '#fff' },
  cardStreak: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  cardStreakTxt: { fontSize: 9, fontWeight: '900', color: '#fff' },
  cardNameOverlay: { position: 'absolute', bottom: 8, left: 8, right: 8 },
  cardName: { color: '#fff', fontWeight: '900', fontSize: 13, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },

  cardBody: { paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitleBadge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  cardTitleTxt: { fontSize: 10, fontWeight: '900', color: '#fff' },
  cardScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  cardScore: { fontSize: 11, fontWeight: '900', color: '#374151' },
  cardTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cardGenreBadge: { backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  cardGenreTxt: { fontSize: 8, fontWeight: '700', color: '#0ea5e9' },
  cardTagBadge: { backgroundColor: '#fdf2f8', borderWidth: 1, borderColor: '#fbcfe8', borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  cardTagTxt: { fontSize: 8, fontWeight: '700', color: '#ec4899' },

  meHighlight: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 24, borderWidth: 2, borderColor: '#f9a8d4' },
});
