import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, Heart } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenBackground } from '../components/ScreenBackground';

type Props = NativeStackScreenProps<RootStackParamList, 'Exercise'>;

interface Exercise {
  id: number; name: string; category: string; tags: string[];
  calorie: string; emoji: string; iconColors: [string, string]; liked: boolean;
}

const ALL_EXERCISES: Exercise[] = [
  { id: 1,  name: '자유형',          category: '수영',    tags: ['수영','전신'],    calorie: '300 kcal/h', emoji: '🏊', iconColors: ['#bae6fd','#7dd3fc'], liked: true  },
  { id: 2,  name: '배영',            category: '수영',    tags: ['수영','등·어깨'], calorie: '280 kcal/h', emoji: '🤽', iconColors: ['#bae6fd','#7dd3fc'], liked: false },
  { id: 3,  name: '접영',            category: '수영',    tags: ['수영','고급'],    calorie: '400 kcal/h', emoji: '🏄', iconColors: ['#bae6fd','#7dd3fc'], liked: false },
  { id: 4,  name: '하타 요가',       category: '요가',    tags: ['요가','입문'],    calorie: '150 kcal/h', emoji: '🧘', iconColors: ['#e9d5ff','#d8b4fe'], liked: true  },
  { id: 5,  name: '빈야사 요가',     category: '요가',    tags: ['요가','중급'],    calorie: '200 kcal/h', emoji: '🌿', iconColors: ['#e9d5ff','#d8b4fe'], liked: false },
  { id: 6,  name: '아쉬탕가 요가',   category: '요가',    tags: ['요가','고급'],    calorie: '250 kcal/h', emoji: '✨', iconColors: ['#e9d5ff','#d8b4fe'], liked: false },
  { id: 7,  name: '인터벌 러닝',     category: '러닝',    tags: ['러닝','중급'],    calorie: '450 kcal/h', emoji: '🏃', iconColors: ['#fed7aa','#fdba74'], liked: false },
  { id: 8,  name: '조깅',            category: '러닝',    tags: ['러닝','입문'],    calorie: '300 kcal/h', emoji: '🌅', iconColors: ['#fed7aa','#fdba74'], liked: false },
  { id: 9,  name: '스피닝',          category: '사이클',  tags: ['사이클','유산소'],calorie: '400 kcal/h', emoji: '🚴', iconColors: ['#bbf7d0','#86efac'], liked: false },
  { id: 10, name: 'MTB 라이딩',      category: '사이클',  tags: ['사이클','야외'],  calorie: '350 kcal/h', emoji: '🌲', iconColors: ['#bbf7d0','#86efac'], liked: false },
  { id: 11, name: '벤치 프레스',     category: '헬스',    tags: ['헬스','가슴'],    calorie: '중급',       emoji: '💪', iconColors: ['#fce7f3','#f9a8d4'], liked: true  },
  { id: 12, name: '스쿼트',          category: '헬스',    tags: ['헬스','하체'],    calorie: '초급',       emoji: '🏋️', iconColors: ['#fce7f3','#f9a8d4'], liked: false },
  { id: 13, name: '매트 필라테스',   category: '필라테스',tags: ['필라테스','코어'],calorie: '입문',       emoji: '🌸', iconColors: ['#fef3c7','#fde68a'], liked: false },
  { id: 14, name: '리포머 필라테스', category: '필라테스',tags: ['필라테스','기구'],calorie: '중급',       emoji: '⚡', iconColors: ['#fef3c7','#fde68a'], liked: false },
  { id: 15, name: 'K-POP 댄스',     category: '댄스',    tags: ['댄스','유산소'],  calorie: '350 kcal/h', emoji: '💃', iconColors: ['#ede9fe','#c4b5fd'], liked: false },
  { id: 16, name: '발레 핏',         category: '댄스',    tags: ['댄스','초급'],    calorie: '250 kcal/h', emoji: '🩰', iconColors: ['#ede9fe','#c4b5fd'], liked: false },
];

const CATEGORY_FILTERS = ['전체','수영','요가','러닝','사이클','헬스','필라테스','댄스'];
const LEVEL_FILTERS    = ['전체','입문','초급','중급','고급'];

export function ExerciseListScreen({ navigation }: Props) {
  const [exercises, setExercises]           = useState<Exercise[]>(ALL_EXERCISES);
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [levelFilter, setLevelFilter]       = useState('전체');
  const [searchQuery, setSearchQuery]       = useState('');

  function toggleLike(id: number) {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, liked: !ex.liked } : ex));
  }

  const filtered = exercises.filter(ex => {
    const matchCat   = categoryFilter === '전체' || ex.category === categoryFilter;
    const matchLevel = levelFilter === '전체' || ex.tags.includes(levelFilter) || ex.calorie === levelFilter;
    const matchQ     = ex.name.includes(searchQuery) || ex.category.includes(searchQuery);
    return matchCat && matchLevel && matchQ;
  });

  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [];
    acc[ex.category].push(ex);
    return acc;
  }, {});

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <LinearGradient colors={['#ec4899','#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
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

        {/* Filter tabs */}
        <View style={s.filterPanel}>
          {/* Top tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
            {['MY', '즐겨찾기', '최근 한 운동'].map((tab, i) => (
              <View key={tab} style={[s.tabItem, i === 0 && s.tabItemActive]}>
                <Text style={[s.tabTxt, i === 0 ? s.tabTxtActive : s.tabTxtInactive]}>{tab}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={s.filterDivider} />

          {/* 종목 */}
          <Text style={s.filterLabel}>종목</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
            {CATEGORY_FILTERS.map(f => (
              <TouchableOpacity key={f} onPress={() => setCategoryFilter(f)} style={[s.tabItem, categoryFilter === f && s.tabItemActive]}>
                <Text style={[s.tabTxt, categoryFilter === f ? s.tabTxtActive : s.tabTxtInactive]}>{f}</Text>
              </TouchableOpacity>
            ))}
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

        {/* Count */}
        <View style={s.countRow}>
          <Text style={s.countTxt}>전체 {filtered.length}개</Text>
        </View>

        {/* List */}
        <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
          {Object.keys(grouped).length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyTxt}>검색 결과가 없어요 😅</Text>
            </View>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <View key={category}>
                <Text style={s.groupTitle}>{category}</Text>
                {items.map((ex, idx) => (
                  <View key={ex.id} style={[s.exerciseRow, idx < items.length - 1 && s.exerciseBorder]}>
                    <LinearGradient colors={ex.iconColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.exerciseIcon}>
                      <Text style={s.exerciseEmoji}>{ex.emoji}</Text>
                    </LinearGradient>
                    <View style={s.exerciseInfo}>
                      <Text style={s.exerciseName}>{ex.name}</Text>
                      <View style={s.tagRow}>
                        {ex.tags.map(tag => (
                          <View key={tag} style={s.tag}>
                            <Text style={s.tagTxt}>{tag}</Text>
                          </View>
                        ))}
                        <Text style={s.calorieTxt}>{ex.calorie}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => toggleLike(ex.id)} style={s.likeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Heart size={19} strokeWidth={1.8} color={ex.liked ? '#ec4899' : '#d1d5db'} fill={ex.liked ? '#ec4899' : 'none'} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

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
  tabTxt: { fontSize: 12, whiteSpace: 'nowrap' as any },
  tabTxtActive: { fontWeight: '700', color: '#ec4899' },
  tabTxtActiveBlue: { fontWeight: '700', color: '#38bdf8' },
  tabTxtInactive: { fontWeight: '500', color: '#9ca3af' },

  countRow: { paddingHorizontal: 20, paddingVertical: 8 },
  countTxt: { color: '#9ca3af', fontSize: 11 },

  list: { flex: 1 },
  emptyWrap: { alignItems: 'center', marginTop: 40 },
  emptyTxt: { color: '#d1d5db', fontSize: 13 },

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
  calorieTxt: { color: '#9ca3af', fontSize: 11 },
  likeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
