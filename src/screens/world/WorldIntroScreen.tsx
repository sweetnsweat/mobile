import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, ChevronLeft, Sparkles } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenBackground } from '../../components/ScreenBackground';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { fetchStoryHistory, playStory, StoryPlayResponse } from '../../services/StoryService';
import { getWorldPreview, resolveMediaUrl, WorldPreviewData } from '../../services/HomeService';

type Props = NativeStackScreenProps<RootStackParamList, 'WorldIntro'>;

type IntroState = {
  preview: WorldPreviewData | null;
  story: StoryPlayResponse | null;
};

function firstCharacter(story: StoryPlayResponse | null, preview: WorldPreviewData | null) {
  return story?.opening_characters?.[0] ??
    story?.dialogue?.[0] ??
    preview?.representativeCharacter ??
    preview?.characters?.[0] ??
    null;
}

function readCharacterName(character: unknown): string {
  if (!character || typeof character !== 'object') return '';
  const item = character as Record<string, unknown>;
  const value = item.character_name ?? item.name;
  return typeof value === 'string' ? value : '';
}

function readCharacterTitle(character: unknown): string {
  if (!character || typeof character !== 'object') return '';
  const item = character as Record<string, unknown>;
  const value = item.representativeCharacterTitle ?? item.title;
  return typeof value === 'string' ? value : '';
}

export function WorldIntroScreen({ navigation, route }: Props) {
  const scenarioId = route.params.scenario_id;
  const [data, setData] = useState<IntroState>({ preview: null, story: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    async function loadIntro() {
      setLoading(true);
      setError('');
      try {
        const [preview, history] = await Promise.all([
          getWorldPreview(scenarioId),
          fetchStoryHistory(scenarioId).catch(() => []),
        ]);
        const story = await playStory({
          scenario_id: scenarioId,
          restart: history.length === 0,
        });
        if (alive) setData({ preview, story });
      } catch (e: any) {
        if (alive) setError(e?.message ?? '세계관 정보를 불러오지 못했습니다.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadIntro();
    return () => {
      alive = false;
    };
  }, [scenarioId]);

  const preview = data.preview;
  const story = data.story;
  const character = firstCharacter(story, preview);
  const introImageUrl = resolveMediaUrl(preview?.scenario.playerImageUrl);
  const worldTitle = preview?.scenario.title ?? `Scenario ${scenarioId}`;
  const genre = preview?.scenario.genres?.[0] ?? preview?.scenario.genre ?? 'Story';
  const openingSummary =
    (typeof story?.opening_summary === 'string' && story.opening_summary.trim()) ||
    preview?.scenario.summary ||
    '아직 소개 문구가 준비되지 않았습니다.';
  const characterName = readCharacterName(character) || preview?.representativeCharacter?.name || 'Unknown';
  const characterTitle =
    readCharacterTitle(character) ||
    preview?.representativeCharacter?.title ||
    'Representative';

  function handleEnter() {
    navigation.replace('CharacterQuest', { scenario_id: scenarioId, introStarted: true });
  }

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={s.headerTextWrap}>
            <Text style={s.headerSub}>World Intro</Text>
            <Text style={s.headerTitle}>세계관 소개</Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.sectionLabel}>입장 브리핑</Text>

          <View style={s.worldCard}>
            <View style={s.worldImgWrap}>
              <ImageWithFallback uri={introImageUrl} style={s.worldImg} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.92)']}
                style={s.worldImgOverlay}
              />
              <LinearGradient
                colors={['#ec4899', '#f43f5e']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.worldBadge}
              >
                <Text style={s.worldBadgeTxt}>WORLD</Text>
              </LinearGradient>
              <View style={s.introBadge}>
                <BookOpen size={15} color="#fff" strokeWidth={2.5} />
              </View>
            </View>

            <View style={s.worldInfo}>
              <View style={s.worldNameRow}>
                <Text style={s.worldName} numberOfLines={2}>{worldTitle}</Text>
                <View style={s.roleBadge}>
                  <Text style={s.roleBadgeTxt}>{genre}</Text>
                </View>
              </View>

              {loading ? (
                <View style={s.loadingRow}>
                  <ActivityIndicator color="#ec4899" size="small" />
                  <Text style={s.loadingText}>세계관을 불러오는 중...</Text>
                </View>
              ) : error ? (
                <Text style={s.errorText}>{error}</Text>
              ) : (
                <Text style={s.worldDesc}>{openingSummary}</Text>
              )}
            </View>
          </View>

          <View style={s.nameCard}>
            <Text style={s.nameCardLabel}>
              <Text style={s.nameCardAccent}>주요 인물</Text>
            </Text>
            <View style={s.characterRow}>
              <View style={s.characterMark}>
                <Sparkles size={18} color="#ec4899" strokeWidth={2.5} />
              </View>
              <View style={s.characterMeta}>
                <Text style={s.characterName}>{characterName}</Text>
                <Text style={s.characterTitle}>{characterTitle}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleEnter}
            disabled={loading || !!error}
            activeOpacity={0.85}
            style={[s.startBtnWrap, (loading || !!error) && s.startBtnDisabled]}
          >
            <LinearGradient colors={['#ec4899', '#0ea5e9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.startBtn}>
              <Text style={s.startBtnTxt}>채팅방 입장하기</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={s.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 4, borderBottomColor: '#0284c7' },
  backBtn: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  headerTextWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: 4 },
  headerSub: { fontSize: 10, color: '#fce7f3', letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 18, textAlign: 'center' },

  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24, gap: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(0,0,0,0.35)', letterSpacing: 2, textTransform: 'uppercase', paddingHorizontal: 4 },

  worldCard: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 2, borderColor: '#f9a8d4', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 10 },
  worldImgWrap: { height: 224, position: 'relative' },
  worldImg: { width: '100%', height: '100%' },
  worldImgOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  worldBadge: { position: 'absolute', top: 12, right: 12, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, zIndex: 10 },
  worldBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  introBadge: { position: 'absolute', top: 12, left: 12, width: 28, height: 28, backgroundColor: '#ec4899', borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 10 },

  worldInfo: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, gap: 12 },
  worldNameRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  worldName: { flex: 1, fontSize: 18, fontWeight: '900', color: '#111827' },
  roleBadge: { backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, maxWidth: 120 },
  roleBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#0ea5e9' },
  worldDesc: { fontSize: 12, color: '#6b7280', lineHeight: 19 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  loadingText: { fontSize: 12, fontWeight: '700', color: '#9ca3af' },
  errorText: { fontSize: 12, fontWeight: '700', color: '#ef4444', lineHeight: 18 },

  nameCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#f3f4f6', padding: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  nameCardLabel: { fontSize: 11, fontWeight: '700', color: '#ec4899', letterSpacing: 1.5, textTransform: 'uppercase' },
  nameCardAccent: { color: '#38bdf8' },
  characterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  characterMark: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fdf2f8', alignItems: 'center', justifyContent: 'center' },
  characterMeta: { flex: 1, gap: 3 },
  characterName: { fontSize: 14, fontWeight: '900', color: '#111827' },
  characterTitle: { fontSize: 11, fontWeight: '700', color: '#6b7280' },

  startBtnWrap: { borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#0284c7' },
  startBtnDisabled: { opacity: 0.35 },
  startBtn: { paddingVertical: 16, alignItems: 'center' },
  startBtnTxt: { color: '#fff', fontWeight: '900', fontSize: 16 },
  bottomSpacer: { height: 16 },
});
