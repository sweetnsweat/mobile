import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Flame, Crown, Search } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenBackground } from '../components/ScreenBackground';
import { BottomNav } from '../components/BottomNav';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { FullWorldRankingItem, getFullWorldRankings, resolveMediaUrl } from '../services/HomeService';

type Props = NativeStackScreenProps<RootStackParamList, 'WorldRanking'>;

const GENRES = ['전체','로맨스','판타지','무협','학원물','현대'];

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
const RANK_COLORS: Record<number, [string, string]> = {
  1: ['#facc15','#d97706'],
  2: ['#d1d5db','#9ca3af'],
  3: ['#fda4af','#fb7185'],
};

type WorldRankCard = {
  rank: number;
  name: string;
  title: string;
  score: number;
  img: string;
  colors: [string, string];
  tags: string[];
  genre: string;
  emoji: string;
};

function normalizeGenre(genre?: string | null): string {
  if (!genre) return '세계관';
  if (genre.includes('로맨스')) return '로맨스';
  if (genre.includes('판타지')) return '판타지';
  if (genre.includes('무협')) return '무협';
  if (genre.includes('학원')) return '학원물';
  if (genre.includes('현대')) return '현대';
  return genre;
}

function mapWorldRank(item: FullWorldRankingItem): WorldRankCard {
  const displayName = item.displayName || item.representativeCharacterName || item.characterName;
  const title = item.representativeCharacterTitle || item.characterTitle || item.title || item.worldTitle;
  const genre = normalizeGenre(item.genre);

  return {
    rank: item.rank,
    name: displayName || item.worldTitle,
    title,
    score: item.score,
    img: resolveMediaUrl(item.imageUrl),
    colors: RANK_COLORS[item.rank] ?? ['#7dd3fc','#60a5fa'],
    tags: item.tags?.length ? item.tags : [`#${genre}`, `#${item.worldTitle}`],
    genre,
    emoji: '✨',
  };
}

export function WorldRankingScreen({ navigation }: Props) {
  const [genre, setGenre]   = useState('전체');
  const [search, setSearch] = useState('');
  const [ranking, setRanking] = useState<WorldRankCard[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    loadRankings();
  }, []));

  async function loadRankings() {
    setLoading(true);
    try {
      const data = await getFullWorldRankings(20);
      const nextRanking = data.map(mapWorldRank);
      setRanking(nextRanking);
    } catch (e) {
      console.log('[WorldRankingAPI] loadRankings error:', e);
      setRanking([]);
    } finally {
      setLoading(false);
    }
  }

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = ranking.filter(r => {
    const matchGenre = genre === '전체' || r.genre === genre;
    const matchSearch = !normalizedSearch || (
      r.name.toLowerCase().includes(normalizedSearch) ||
      r.title.toLowerCase().includes(normalizedSearch) ||
      r.genre.toLowerCase().includes(normalizedSearch) ||
      r.tags.some(tag => tag.toLowerCase().includes(normalizedSearch))
    );
    return matchGenre && matchSearch;
  });

  const showTop3 = !normalizedSearch && genre === '전체' && ranking.length >= 3;

  const top1 = ranking[0]!;
  const top2 = ranking[1]!;
  const top3 = ranking[2]!;

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
              placeholder="세계관, 대표 캐릭터 검색..."
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
          {loading && (
            <View style={s.loadingRow}>
              <ActivityIndicator color="#ec4899" size="small" />
              <Text style={s.loadingTxt}>랭킹을 불러오는 중...</Text>
            </View>
          )}

          {/* TOP 3 podium */}
          {showTop3 && (
            <View style={s.podium}>
              {/* 2nd */}
              <View style={s.podiumItem}>
                <View style={[s.podiumImg, { borderColor: '#d1d5db', width: 56, height: 56 }]}>
                  {top2.img ? (
                    <ImageWithFallback uri={top2.img} style={s.podiumImgInner} />
                  ) : (
                    <View style={[s.podiumImgInner, s.grayImage]} />
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
                    <View style={[s.podiumImgInner, s.grayImage]} />
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
                    <View style={[s.podiumImgInner, s.grayImage]} />
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
          {!loading && filtered.length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyEmoji}>🔍</Text>
              <Text style={s.emptyTxt}>해당 조건의 세계관이 없어요</Text>
            </View>
          ) : filtered.length > 0 ? (
            <View style={s.grid}>
              {filtered.map((r) => (
                <View key={r.rank} style={s.gridCard}>
                  {/* Image area */}
                  <View style={s.cardImgWrap}>
                    {r.img ? (
                      <ImageWithFallback uri={r.img} style={s.cardImg} />
                    ) : (
                      <View style={[s.cardImg, s.grayImage]} />
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

                </View>
              ))}
            </View>
          ) : null}

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

  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10 },
  loadingTxt: { fontSize: 12, fontWeight: '700', color: '#9ca3af' },

  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 16 },
  podiumItem: { alignItems: 'center', gap: 4 },
  crownEmoji: { fontSize: 20 },
  podiumImg: { borderRadius: 16, overflow: 'hidden', borderWidth: 2 },
  podiumImgInner: { width: '100%', height: '100%' },
  grayImage: { backgroundColor: '#e5e7eb' },
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
