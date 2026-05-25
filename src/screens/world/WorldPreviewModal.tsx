import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Pressable,
  ScrollView, ActivityIndicator, Image, Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { X, Flame, Users, Star } from 'lucide-react-native';
import { getWorldPreview, WorldPreviewData, resolveMediaUrl } from '../../services/HomeService';
import { ImageWithFallback } from '../../components/ImageWithFallback';

const { height: SCREEN_H } = Dimensions.get('window');
const HERO_H = 200;

interface Props {
  scenarioId: number | null;
  onClose: () => void;
  onEnter?: () => void;
}

function progressBadge(entry: WorldPreviewData['entry']): { label: string; bg: string; color: string } | null {
  if (!entry.canEnter) return { label: '비활성', bg: '#f3f4f6', color: '#9ca3af' };
  if (entry.hasProgress && entry.progressStatus === 'COMPLETED') return { label: '완료됨', bg: '#dcfce7', color: '#16a34a' };
  if (entry.hasProgress) return { label: '진행 중', bg: '#eff6ff', color: '#2563eb' };
  return null;
}

export function WorldPreviewModal({ scenarioId, onClose, onEnter }: Props) {
  const [data, setData] = useState<WorldPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedChar, setSelectedChar] = useState<WorldPreviewData['representativeCharacter']>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  useEffect(() => {
    if (scenarioId == null) {
      setData(null);
      setSelectedChar(null);
      setSummaryExpanded(false);
      return;
    }
    setSummaryExpanded(false);
    setLoading(true);
    getWorldPreview(scenarioId)
      .then(d => { setData(d); setSelectedChar(d.representativeCharacter); })
      .catch(() => { setData(null); setSelectedChar(null); })
      .finally(() => setLoading(false));
  }, [scenarioId]);

  const visible = scenarioId != null;
  const badge = data ? progressBadge(data.entry) : null;
  const heroImg = resolveMediaUrl(data?.scenario.worldImageUrl || data?.scenario.thumbnailUrl);
  const isRepresentative = selectedChar?.representative ?? false;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.card}>

          {/* Hero image */}
          <View style={s.hero}>
            {heroImg ? (
              <Image source={{ uri: heroImg }} style={[s.heroImg, { objectPosition: 'center 35%' } as any]} resizeMode="cover" />
            ) : (
              <View style={[s.heroImg, s.heroPlaceholder]} />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.72)']}
              style={s.heroGrad}
            />
            {/* Close button */}
            <TouchableOpacity style={s.closeBtn} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={14} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
            {/* Hero text */}
            <View style={s.heroText}>
              {data?.scenario.genres?.length ? (
                <View style={s.genreRow}>
                  {data.scenario.genres.slice(0, 3).map(g => (
                    <View key={g} style={s.genrePill}>
                      <Text style={s.genrePillTxt}>{g}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <Text style={s.heroTitle} numberOfLines={2}>
                {data?.scenario.title ?? ''}
              </Text>
            </View>
          </View>

          {/* Body */}
          <ScrollView
            style={s.body}
            contentContainerStyle={s.bodyContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled
          >
            {loading && (
              <View style={s.loadingWrap}>
                <ActivityIndicator color="#ec4899" size="small" />
                <Text style={s.loadingTxt}>불러오는 중...</Text>
              </View>
            )}

            {data && (
              <>
                {/* Summary */}
                {data.scenario.summary ? (
                  <View style={s.summaryBox}>
                    <Text style={s.summary} numberOfLines={summaryExpanded ? undefined : 4}>
                      {data.scenario.summary}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSummaryExpanded(prev => !prev)}
                      style={s.summaryMoreBtn}
                    >
                      <Text style={s.summaryMoreTxt}>{summaryExpanded ? '접기' : '전체보기 >'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Selected character detail */}
                {selectedChar && (
                  <>
                    <View style={s.divider} />
                    <View style={s.sectionLabel}>
                      <Star size={12} color={isRepresentative ? '#ec4899' : '#6b7280'} strokeWidth={2.5} />
                      <Text style={s.sectionLabelTxt}>
                        {isRepresentative ? '대표 캐릭터' : '캐릭터'}
                      </Text>
                    </View>
                    <View style={s.rcCard}>
                      {selectedChar.imageUrl ? (
                        <ImageWithFallback uri={resolveMediaUrl(selectedChar.imageUrl)} style={s.rcImgLarge} />
                      ) : (
                        <LinearGradient
                          colors={isRepresentative ? ['#ec4899', '#f472b6'] : ['#d1d5db', '#9ca3af']}
                          style={[s.rcImgLarge, s.rcImgGrad]}
                        >
                          <Text style={s.rcImgInitialLarge}>{selectedChar.name.charAt(0)}</Text>
                        </LinearGradient>
                      )}
                      <View style={s.rcMeta}>
                        <View style={s.rcNameRow}>
                          <Text style={s.rcName}>{selectedChar.name}</Text>
                          {selectedChar.type ? (
                            <View style={s.rcTypeBadge}>
                              <Text style={s.rcTypeTxt}>{selectedChar.type}</Text>
                            </View>
                          ) : null}
                        </View>
                        {selectedChar.title ? (
                          <Text style={isRepresentative ? s.rcTitleRep : s.rcTitleMuted}>
                            {selectedChar.title}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    {selectedChar.quote ? (
                      <View style={s.quoteBox}>
                        <Text style={s.quoteText}>"{selectedChar.quote}"</Text>
                      </View>
                    ) : null}
                    {selectedChar.tags?.length ? (
                      <View style={s.tagRow}>
                        {selectedChar.tags.slice(0, 5).map(tag => (
                          <View key={tag} style={s.tagPill}>
                            <Text style={s.tagPillTxt}>#{tag}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </>
                )}

                {/* Characters list */}
                {data.characters.length > 0 && (
                  <>
                    <View style={s.divider} />
                    <View style={s.sectionLabel}>
                      <Users size={12} color="#6b7280" strokeWidth={2.5} />
                      <Text style={s.sectionLabelTxt}>등장 캐릭터 {data.characters.length}명</Text>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={s.charScroll}
                      nestedScrollEnabled
                    >
                      {data.characters.map(c => {
                        const isSelected = (c.id != null && c.id === selectedChar?.id) ||
                          (c.id == null && c.name === selectedChar?.name);
                        return (
                          <TouchableOpacity
                            key={c.id ?? c.name}
                            style={s.charItem}
                            activeOpacity={0.75}
                            onPress={() => setSelectedChar(c)}
                          >
                            <View style={[s.charAvatarWrap, isSelected && s.charAvatarWrapSelected]}>
                              {c.imageUrl ? (
                                <ImageWithFallback uri={resolveMediaUrl(c.imageUrl)} style={s.charAvatar} />
                              ) : (
                                <LinearGradient
                                  colors={c.representative ? ['#ec4899', '#f472b6'] : ['#d1d5db', '#9ca3af']}
                                  style={[s.charAvatar, s.charAvatarGrad]}
                                >
                                  <Text style={s.charAvatarInitial}>{c.name.charAt(0)}</Text>
                                </LinearGradient>
                              )}
                            </View>
                            <Text style={[s.charName, isSelected && s.charNameSelected]} numberOfLines={1}>
                              {c.name}
                            </Text>
                            {c.representative && <View style={s.charRepDot} />}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </>
                )}

                {/* Ranking score */}
                <View style={s.divider} />
                <View style={s.scoreRow}>
                  <Flame size={14} color="#fb923c" strokeWidth={2.5} />
                  <Text style={s.scoreTxt}>랭킹 점수</Text>
                  <Text style={s.scoreVal}>{data.ranking.score.toLocaleString()}</Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer */}
          {data && (
            <View style={s.footer}>
              {badge ? (
                <View style={[s.statusBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[s.statusTxt, { color: badge.color }]}>{badge.label}</Text>
                </View>
              ) : (
                <View />
              )}
              <View style={s.footerBtns}>
                <TouchableOpacity style={s.closeFooterBtn} onPress={onClose} activeOpacity={0.85}>
                  <Text style={s.closeFooterTxt}>닫기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.enterBtn} onPress={onEnter} activeOpacity={0.85}>
                  <LinearGradient
                    colors={['#ec4899', '#0ea5e9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.enterGrad}
                  >
                    <Text style={s.enterTxt}>입장하기</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxHeight: SCREEN_H * 0.82,
    backgroundColor: '#fff',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },

  /* Hero */
  hero: { height: HERO_H, position: 'relative' },
  heroImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroPlaceholder: { backgroundColor: '#f3f4f6' },
  heroGrad: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 99,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, gap: 6 },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  genrePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  genrePillTxt: { fontSize: 9, fontWeight: '700', color: '#fff' },
  heroTitle: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.3, lineHeight: 24 },

  /* Body */
  body: { flexShrink: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 12 },

  loadingWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 24 },
  loadingTxt: { fontSize: 12, fontWeight: '700', color: '#9ca3af' },

  summaryBox: { gap: 6 },
  summary: { fontSize: 13, fontWeight: '500', color: '#4b5563', lineHeight: 20 },
  summaryMoreBtn: { alignSelf: 'flex-end', borderRadius: 99, backgroundColor: '#fdf2f8', borderWidth: 1, borderColor: '#fbcfe8', paddingHorizontal: 10, paddingVertical: 4 },
  summaryMoreTxt: { fontSize: 11, fontWeight: '800', color: '#ec4899' },

  divider: { height: 1, backgroundColor: '#f3f4f6' },

  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sectionLabelTxt: { fontSize: 11, fontWeight: '800', color: '#6b7280', letterSpacing: 0.5 },

  /* Selected character card */
  rcCard: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  rcImgLarge: { width: 80, height: 80, borderRadius: 22, overflow: 'hidden', flexShrink: 0 },
  rcImgGrad: { alignItems: 'center', justifyContent: 'center' },
  rcImgInitialLarge: { fontSize: 30, fontWeight: '900', color: '#fff' },
  rcMeta: { flex: 1, gap: 4 },
  rcNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rcName: { fontSize: 16, fontWeight: '900', color: '#111827' },
  rcTypeBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  rcTypeTxt: { fontSize: 9, fontWeight: '700', color: '#6b7280' },
  rcTitleRep: { fontSize: 12, fontWeight: '700', color: '#ec4899' },
  rcTitleMuted: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  quoteBox: {
    backgroundColor: '#fdf2f8',
    borderLeftWidth: 3,
    borderLeftColor: '#f9a8d4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quoteText: { fontSize: 12, fontWeight: '500', color: '#6b7280', fontStyle: 'italic', lineHeight: 18 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagPill: {
    backgroundColor: '#fdf2f8',
    borderWidth: 1,
    borderColor: '#fbcfe8',
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagPillTxt: { fontSize: 10, fontWeight: '700', color: '#ec4899' },

  /* Characters list */
  charScroll: { gap: 14, paddingVertical: 4 },
  charItem: { alignItems: 'center', gap: 4, width: 56 },
  charAvatarWrap: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },
  charAvatarWrapSelected: {
    borderColor: '#ec4899',
    backgroundColor: '#fdf2f8',
  },
  charAvatar: { width: 48, height: 48, borderRadius: 16, overflow: 'hidden' },
  charAvatarGrad: { alignItems: 'center', justifyContent: 'center' },
  charAvatarInitial: { fontSize: 18, fontWeight: '900', color: '#fff' },
  charName: { fontSize: 10, fontWeight: '700', color: '#374151', textAlign: 'center', maxWidth: 56 },
  charNameSelected: { color: '#ec4899' },
  charRepDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: '#ec4899',
  },

  /* Score */
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreTxt: { fontSize: 12, fontWeight: '700', color: '#6b7280', flex: 1 },
  scoreVal: { fontSize: 16, fontWeight: '900', color: '#111827' },

  /* Footer */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statusBadge: { borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  statusTxt: { fontSize: 12, fontWeight: '800' },
  footerBtns: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  closeFooterBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  closeFooterTxt: { fontSize: 13, fontWeight: '700', color: '#9ca3af' },
  enterBtn: { borderRadius: 14, overflow: 'hidden' },
  enterGrad: { paddingHorizontal: 24, paddingVertical: 10, alignItems: 'center' },
  enterTxt: { fontSize: 13, fontWeight: '800', color: '#fff' },
});
