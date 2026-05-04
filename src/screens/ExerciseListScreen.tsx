import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, ActivityIndicator, FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, Heart } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenBackground } from '../components/ScreenBackground';
import {
  getExerciseCategories,
  getExercises,
  toggleFavorite,
  ExerciseListItem,
  ExerciseCategoryGroup,
  ExerciseCategory,
} from '../services/ExerciseService';

type Props = NativeStackScreenProps<RootStackParamList, 'Exercise'>;

type ScopeTab = 'all' | 'favorite' | 'recent';

const SCOPE_TABS: { key: ScopeTab; label: string }[] = [
  { key: 'all',      label: 'MY' },
  { key: 'favorite', label: '즐겨찾기' },
  { key: 'recent',   label: '최근 한 운동' },
];

const LEVEL_FILTERS = ['전체', '입문', '초급', '중급', '고급'];
const CATEGORY_PAGE_SIZE = 30;
const PAGE_SIZE = 30;

type ExerciseListRow =
  | { type: 'group'; key: string; title: string }
  | { type: 'exercise'; key: string; exercise: ExerciseListItem };

function mergeExerciseGroups(prev: ExerciseCategoryGroup[], next: ExerciseCategoryGroup[]): ExerciseCategoryGroup[] {
  const map = new Map<string, ExerciseCategoryGroup>();

  [...prev, ...next].forEach(group => {
    const existing = map.get(group.category);
    if (!existing) {
      map.set(group.category, { ...group, exercises: [...group.exercises] });
      return;
    }

    const seen = new Set(existing.exercises.map(ex => ex.id));
    const newExercises = group.exercises.filter(ex => !seen.has(ex.id));
    existing.exercises = [...existing.exercises, ...newExercises];
    existing.count = existing.exercises.length;
  });

  return Array.from(map.values());
}

function flattenExerciseGroups(groups: ExerciseCategoryGroup[]): ExerciseListRow[] {
  return groups.flatMap(group => [
    { type: 'group' as const, key: `group-${group.category}`, title: group.categoryDisplayName },
    ...group.exercises.map(ex => ({ type: 'exercise' as const, key: `exercise-${ex.id}`, exercise: ex })),
  ]);
}

function mergeCategories(prev: ExerciseCategory[], next: ExerciseCategory[]): ExerciseCategory[] {
  const seen = new Set(prev.map(c => c.category));
  return [...prev, ...next.filter(c => !seen.has(c.category))];
}

export function ExerciseListScreen({ navigation }: Props) {
  const [categories,     setCategories]     = useState<ExerciseCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesLoadingMore, setCategoriesLoadingMore] = useState(false);
  const [categoriesHasNext, setCategoriesHasNext] = useState(false);
  const [categoriesNextPage, setCategoriesNextPage] = useState<number | null>(null);
  const [groups,         setGroups]         = useState<ExerciseCategoryGroup[]>([]);
  const [totalCount,     setTotalCount]     = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [loadingMore,    setLoadingMore]    = useState(false);
  const [error,          setError]          = useState('');
  const [hasNext,        setHasNext]        = useState(false);
  const [nextPage,       setNextPage]       = useState<number | null>(null);

  const [scope,          setScope]          = useState<ScopeTab>('all');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [levelFilter,    setLevelFilter]    = useState('전체');
  const [searchQuery,    setSearchQuery]    = useState('');

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);
  const categoryRequestingRef = useRef(false);

  // 카테고리 목록 로드
  useEffect(() => {
    let mounted = true;
    loadCategoriesPage(0, false, () => mounted);
    return () => { mounted = false; };
  }, []);

  async function loadCategoriesPage(page = 0, append = false, isMounted = () => true) {
    if (categoryRequestingRef.current) return;
    categoryRequestingRef.current = true;

    if (append) {
      setCategoriesLoadingMore(true);
    } else {
      setCategoriesLoading(true);
    }

    getExerciseCategories({ page, size: CATEGORY_PAGE_SIZE })
      .then(data => {
        if (!isMounted()) return;
        setCategories(prev => append ? mergeCategories(prev, data.categories) : data.categories);
        setCategoriesHasNext(data.hasNext);
        setCategoriesNextPage(data.nextPage);
      })
      .catch(() => {
        if (!isMounted()) return;
        if (!append) setCategories([]);
        setCategoriesHasNext(false);
        setCategoriesNextPage(null);
      })
      .finally(() => {
        categoryRequestingRef.current = false;
        if (!isMounted()) return;
        setCategoriesLoading(false);
        setCategoriesLoadingMore(false);
      });
  }

  function loadMoreCategories() {
    if (categoriesLoading || categoriesLoadingMore || !categoriesHasNext || categoriesNextPage == null) return;
    loadCategoriesPage(categoriesNextPage, true);
  }

  function handleCategoryScroll(e: any) {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.width + contentOffset.x >= contentSize.width - 80) {
      loadMoreCategories();
    }
  }

  // 운동 목록 로드
  const loadExercises = useCallback(async (keyword: string, page = 0, append = false) => {
    const seq = ++requestSeq.current;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const data = await getExercises({
        scope,
        category: categoryFilter !== '전체' ? categoryFilter : undefined,
        level:    levelFilter    !== '전체' ? levelFilter    : undefined,
        keyword:  keyword.trim() || undefined,
        page,
        size: PAGE_SIZE,
      });
      if (seq !== requestSeq.current) return;
      setGroups(prev => append ? mergeExerciseGroups(prev, data.groups) : data.groups);
      setTotalCount(data.totalCount);
      setHasNext(data.hasNext);
      setNextPage(data.nextPage);
    } catch (e: any) {
      if (seq === requestSeq.current) {
        setError(e?.message ?? '운동 목록을 불러오지 못했어요.');
      }
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [scope, categoryFilter, levelFilter]);

  // scope/category/level 변경 시 즉시 로드
  useEffect(() => {
    loadExercises(searchQuery, 0, false);
  }, [scope, categoryFilter, levelFilter]);

  // 검색어 디바운스 (500ms)
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      loadExercises(searchQuery, 0, false);
    }, 500);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  const listRows = useMemo(() => flattenExerciseGroups(groups), [groups]);

  const loadMoreExercises = useCallback(() => {
    if (loading || loadingMore || !hasNext || nextPage == null) return;
    loadExercises(searchQuery, nextPage, true);
  }, [hasNext, loadExercises, loading, loadingMore, nextPage, searchQuery]);

  async function handleToggleLike(item: ExerciseListItem) {
    const newLiked = !item.liked;
    // 낙관적 업데이트
    setGroups(prev => prev.map(g => ({
      ...g,
      exercises: g.exercises.map(ex =>
        ex.id === item.id ? { ...ex, liked: newLiked } : ex,
      ),
    })));
    try {
      await toggleFavorite(item.id, newLiked);
    } catch {
      // 실패 시 롤백
      setGroups(prev => prev.map(g => ({
        ...g,
        exercises: g.exercises.map(ex =>
          ex.id === item.id ? { ...ex, liked: item.liked } : ex,
        ),
      })));
    }
  }

  function goToDetail(ex: ExerciseListItem) {
    navigation.navigate('ExerciseDetail', {
      exercise: {
        id: ex.id,
        name: ex.name,
        category: ex.category,
        categoryDisplayName: ex.categoryDisplayName,
        level: ex.level,
        levelDisplayName: ex.levelDisplayName,
        equipment: ex.equipment,
        met: ex.met,
        estimatedKcalPerHour: ex.estimatedKcalPerHour,
        primaryMuscles: ex.primaryMuscles,
        emoji: ex.emoji,
        liked: ex.liked,
      },
    });
  }

  const categoryTabs = [
    { category: '전체', categoryDisplayName: '전체' },
    ...categories,
  ];

  function renderListRow({ item }: { item: ExerciseListRow }) {
    if (item.type === 'group') {
      return <Text style={s.groupTitle}>{item.title}</Text>;
    }

    const ex = item.exercise;
    return (
      <TouchableOpacity
        onPress={() => goToDetail(ex)}
        activeOpacity={0.75}
        style={[s.exerciseRow, s.exerciseBorder]}
      >
        <LinearGradient
          colors={CATEGORY_COLORS[ex.categoryDisplayName] ?? ['#f3f4f6', '#e5e7eb']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.exerciseIcon}
        >
          <Text style={s.exerciseEmoji}>{ex.emoji}</Text>
        </LinearGradient>
        <View style={s.exerciseInfo}>
          <Text style={s.exerciseName}>{ex.name}</Text>
          <View style={s.tagRow}>
            <View style={s.tag}><Text style={s.tagTxt}>{ex.levelDisplayName}</Text></View>
            {ex.primaryMuscles.slice(0, 1).map(m => (
              <View key={m} style={s.tag}><Text style={s.tagTxt}>{m}</Text></View>
            ))}
            {ex.estimatedKcalPerHour > 0 && (
              <Text style={s.kcalTxt}>{ex.estimatedKcalPerHour} kcal/h</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleToggleLike(ex)}
          style={s.likeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Heart
            size={19} strokeWidth={1.8}
            color={ex.liked ? '#ec4899' : '#d1d5db'}
            fill={ex.liked ? '#ec4899' : 'none'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>

        {/* 헤더 */}
        <LinearGradient colors={['#ec4899', '#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
          <View style={s.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <ChevronLeft size={16} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>운동 목록</Text>
            <View style={{ width: 32 }} />
          </View>
          <View style={s.searchBar}>
            <Search size={15} color="rgba(255,255,255,0.9)" strokeWidth={2} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="운동 이름으로 검색해보세요"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={s.searchInput}
            />
          </View>
        </LinearGradient>

        {/* 필터 패널 */}
        <View style={s.filterPanel}>
          {/* 스코프 탭 (MY / 즐겨찾기 / 최근) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
            {SCOPE_TABS.map(tab => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => {
                  setScope(tab.key);
                  setCategoryFilter('전체');
                  setLevelFilter('전체');
                }}
                style={[s.tabItem, scope === tab.key && s.tabItemActive]}
              >
                <Text style={[s.tabTxt, scope === tab.key ? s.tabTxtActive : s.tabTxtInactive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={s.filterDivider} />

          {/* 종목 */}
          <Text style={s.filterLabel}>종목</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tabRow}
            onScroll={handleCategoryScroll}
            scrollEventThrottle={16}
          >
            {categoryTabs.map(c => (
              <TouchableOpacity
                key={c.categoryDisplayName}
                onPress={() => {
                  setCategoryFilter(c.categoryDisplayName);
                  setLevelFilter('전체');
                }}
                style={[s.tabItem, categoryFilter === c.categoryDisplayName && s.tabItemActive]}
              >
                <Text style={[s.tabTxt, categoryFilter === c.categoryDisplayName ? s.tabTxtActive : s.tabTxtInactive]}>
                  {c.categoryDisplayName}
                </Text>
              </TouchableOpacity>
            ))}
            {(categoriesLoading || categoriesLoadingMore) && (
              <View style={s.categoryLoading}>
                <ActivityIndicator size="small" color="#ec4899" />
              </View>
            )}
          </ScrollView>
          <View style={s.filterDivider} />

          {/* 강도 */}
          <Text style={[s.filterLabel, { color: '#38bdf8' }]}>강도</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.tabRow, { paddingBottom: 4 }]}>
            {LEVEL_FILTERS.map(f => (
              <TouchableOpacity key={f} onPress={() => setLevelFilter(f)} style={[s.tabItem, levelFilter === f && s.tabItemActiveBlue]}>
                <Text style={[s.tabTxt, levelFilter === f ? s.tabTxtActiveBlue : s.tabTxtInactive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 개수 */}
        <View style={s.countRow}>
          <Text style={s.countTxt}>전체 {totalCount}개</Text>
        </View>

        {/* 목록 */}
        {loading ? (
          <View style={s.list}>
            <View style={s.centerWrap}>
              <ActivityIndicator size="large" color="#ec4899" />
            </View>
          </View>
        ) : error ? (
          <View style={s.list}>
            <View style={s.centerWrap}>
              <Text style={s.errorTxt}>{error}</Text>
              <TouchableOpacity onPress={() => loadExercises(searchQuery, 0, false)} style={s.retryBtn}>
                <Text style={s.retryTxt}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            data={listRows}
            keyExtractor={item => item.key}
            renderItem={renderListRow}
            style={s.list}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreExercises}
            onEndReachedThreshold={0.35}
            ListEmptyComponent={
              <View style={s.centerWrap}>
                <Text style={s.emptyTxt}>검색 결과가 없어요</Text>
              </View>
            }
            ListFooterComponent={
              <View style={s.listFooter}>
                {loadingMore && <ActivityIndicator color="#ec4899" />}
              </View>
            }
          />
        )}

        {/* 다음 버튼 */}
        <View style={s.nextWrap}>
          <TouchableOpacity onPress={() => navigation.navigate('RoutineCreate')} activeOpacity={0.85} style={s.nextBtn}>
            <LinearGradient colors={['#ec4899', '#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.nextGrad}>
              <Text style={s.nextTxt}>루틴 만들기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const CATEGORY_COLORS: Record<string, [string, string]> = {
  수영:    ['#bae6fd', '#7dd3fc'],
  요가:    ['#e9d5ff', '#d8b4fe'],
  러닝:    ['#fed7aa', '#fdba74'],
  사이클:  ['#bbf7d0', '#86efac'],
  헬스:    ['#fce7f3', '#f9a8d4'],
  필라테스:['#fef3c7', '#fde68a'],
  댄스:    ['#ede9fe', '#c4b5fd'],
  근력:    ['#fce7f3', '#f9a8d4'],
};

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)' },
  searchInput: { flex: 1, color: '#fff', fontSize: 13 },

  filterPanel: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  filterLabel: { color: '#ec4899', fontSize: 10, fontWeight: '700', paddingTop: 7, paddingLeft: 16, letterSpacing: 1 },
  filterDivider: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 16 },
  tabRow: { paddingHorizontal: 16, flexDirection: 'row', gap: 4 },
  tabItem: { paddingHorizontal: 14, paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#ec4899' },
  tabItemActiveBlue: { borderBottomColor: '#38bdf8' },
  tabTxt: { fontSize: 12 },
  tabTxtActive: { fontWeight: '700', color: '#ec4899' },
  tabTxtActiveBlue: { fontWeight: '700', color: '#38bdf8' },
  tabTxtInactive: { fontWeight: '500', color: '#9ca3af' },
  categoryLoading: { width: 36, alignItems: 'center', justifyContent: 'center' },

  countRow: { paddingHorizontal: 20, paddingVertical: 8 },
  countTxt: { color: '#9ca3af', fontSize: 11 },

  list: { flex: 1 },
  listFooter: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  centerWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 40, gap: 12 },
  emptyTxt: { color: '#d1d5db', fontSize: 13 },
  errorTxt: { color: '#ef4444', fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: { backgroundColor: '#fdf2f8', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#fbcfe8' },
  retryTxt: { color: '#ec4899', fontSize: 13, fontWeight: '600' },

  groupTitle: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4, color: '#374151', fontSize: 15, fontWeight: '800' },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 13, backgroundColor: '#fff' },
  exerciseBorder: { borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  exerciseIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  exerciseEmoji: { fontSize: 24 },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: '#1f2937', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  tagRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
  tag: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  tagTxt: { color: '#6b7280', fontSize: 10 },
  kcalTxt: { color: '#9ca3af', fontSize: 11 },
  likeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  nextWrap: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  nextBtn:  { borderRadius: 12, overflow: 'hidden' },
  nextGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  nextTxt:  { color: '#fff', fontSize: 16, fontWeight: '700' },
});
