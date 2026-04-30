import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, Animated, FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenBackground } from '../components/ScreenBackground';
import { ImageWithFallback } from '../components/ImageWithFallback';

type Props = NativeStackScreenProps<RootStackParamList, 'CharacterShop'>;

const CHARACTERS = [
  { id: 0,  image: 'https://i.imgur.com/v0njcuh.png',   name: '이수연',   desc: '체대 입시생 · 인내력', cost: 0,    owned: true,  special: false, bg: ['#fce7f3','#ffe4e6'] },
  { id: 1,  image: 'https://i.imgur.com/83q0Fz8.jpeg',  name: '칼라일',   desc: '불의 전사 · 투지',     cost: 300,  owned: true,  special: false, bg: ['#ffedd5','#fef3c7'] },
  { id: 2,  image: '',                                   name: '제로스',   desc: '번개 추적자 · 민첩',   cost: 500,  owned: true,  special: false, bg: ['#fef9c3','#ecfccb'] },
  { id: 3,  image: '',                                   name: '하나엘',   desc: '꽃의 정령 · 평온',     cost: 400,  owned: false, special: false, bg: ['#fce7f3','#fdf4ff'] },
  { id: 4,  image: '',                                   name: '드라켄',   desc: '용기사 · 지배력',      cost: 800,  owned: false, special: true,  bg: ['#d1fae5','#ccfbf1'] },
  { id: 5,  image: '',                                   name: '마린',     desc: '파도 항해사 · 자유',   cost: 450,  owned: false, special: false, bg: ['#e0f2fe','#dbeafe'] },
  { id: 6,  image: '',                                   name: '루나르',   desc: '달의 암살자 · 집중력', cost: 600,  owned: false, special: false, bg: ['#ede9fe','#f3e8ff'] },
  { id: 7,  image: '',                                   name: '카일린',   desc: '여우 도적 · 기민함',   cost: 350,  owned: false, special: false, bg: ['#ffedd5','#fee2e2'] },
  { id: 8,  image: '',                                   name: '세라피나', desc: '왕국의 여왕 · 권위',   cost: 1200, owned: false, special: true,  bg: ['#fef9c3','#fef3c7'] },
  { id: 9,  image: '',                                   name: '아스트라', desc: '별의 여행자 · 희망',   cost: 550,  owned: false, special: false, bg: ['#fef3c7','#fef9c3'] },
  { id: 10, image: '',                                   name: '리온',     desc: '명중 사수 · 집중',     cost: 420,  owned: false, special: false, bg: ['#d1fae5','#dcfce7'] },
  { id: 11, image: '',                                   name: '네오',     desc: '우주 탐험가 · 도전',   cost: 900,  owned: false, special: true,  bg: ['#e0f2fe','#e0e7ff'] },
];

const FILTERS = [
  { key: 'all',     label: '전체'    },
  { key: 'owned',   label: '보유 중' },
  { key: 'locked',  label: '미해금'  },
  { key: 'special', label: '스페셜'  },
];

function CoinDot({ size = 13 }: { size?: number }) {
  return (
    <LinearGradient
      colors={['#fde047','#d97706']}
      style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: '#fff' }}
    />
  );
}

type Char = typeof CHARACTERS[0];

function CharCard({ char, selected, onSelect, equipped }: {
  char: Char; selected: number; onSelect: (id: number) => void; equipped: number;
}) {
  const locked = !char.owned;
  const isSel = selected === char.id;

  return (
    <TouchableOpacity
      onPress={() => onSelect(char.id)}
      activeOpacity={0.85}
      style={[s.charCard, isSel ? s.charCardSel : s.charCardNormal]}
    >
      {/* Image area */}
      <LinearGradient colors={char.bg} style={s.charImgArea}>
        {char.image ? (
          <ImageWithFallback
            uri={char.image}
            style={[s.charImg, locked && { opacity: 0.4 }]}
          />
        ) : (
          <View style={[s.charImgPlaceholder, { backgroundColor: char.bg[0] }]} />
        )}
        {locked && (
          <View style={s.lockOverlay}>
            <View style={s.lockCircle}>
              <Lock size={12} color="#6b7280" strokeWidth={2.5} />
            </View>
          </View>
        )}
        {isSel && !locked && (
          <LinearGradient colors={['#f472b6','#38bdf8']} style={s.checkBadge}>
            <Text style={s.checkBadgeTxt}>✓</Text>
          </LinearGradient>
        )}
        {char.special && (
          <LinearGradient colors={['#f472b6','#c084fc']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.specialBadge}>
            <Text style={s.specialBadgeTxt}>SPECIAL</Text>
          </LinearGradient>
        )}
      </LinearGradient>

      {/* Text area */}
      <View style={s.charTextArea}>
        <Text style={s.charName} numberOfLines={1}>{char.name}</Text>
        <View>
          {char.owned ? (
            char.id === equipped ? (
              <View style={s.usingBadge}><Text style={s.usingBadgeTxt}>사용중</Text></View>
            ) : (
              <View style={s.ownedBadge}><Text style={s.ownedBadgeTxt}>보유중</Text></View>
            )
          ) : (
            <View style={s.costRow}>
              <CoinDot size={9} />
              <Text style={s.costTxt}>{char.cost.toLocaleString()}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function CharacterShopScreen({ navigation }: Props) {
  const [chars, setChars] = useState(CHARACTERS);
  const [gold, setGold] = useState(1200);
  const [selected, setSelected] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);
  const [equipped, setEquipped] = useState(0);

  const toastOpacity = useRef(new Animated.Value(0)).current;

  function showToast(msg: string) {
    setToast(msg);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }

  const filtered = chars.filter(c => {
    if (activeFilter === 'owned')   return c.owned;
    if (activeFilter === 'locked')  return !c.owned;
    if (activeFilter === 'special') return c.special;
    return true;
  });

  const selectedChar = chars.find(c => c.id === selected);
  const canBuy = selectedChar && !selectedChar.owned && gold >= selectedChar.cost;

  function handleBuy() {
    if (!selectedChar || selectedChar.owned || gold < selectedChar.cost) return;
    setGold(g => g - selectedChar.cost);
    setChars(prev => prev.map(c => c.id === selectedChar.id ? { ...c, owned: true } : c));
    showToast(`${selectedChar.name} 해금 완료! 🎉`);
  }

  function handleEquip() {
    if (!selectedChar || !selectedChar.owned) return;
    setEquipped(selectedChar.id);
  }

  const btnLabel = selectedChar
    ? selectedChar.owned
      ? selectedChar.id === equipped ? '현재 사용 중' : '적용하기'
      : canBuy
        ? `${selectedChar.cost.toLocaleString()} 골드로 구매하기`
        : `골드 부족 (${(selectedChar.cost - gold).toLocaleString()} 더 필요)`
    : '';

  const renderItem = ({ item }: { item: Char }) => (
    <View style={s.gridItem}>
      <CharCard char={item} selected={selected} onSelect={setSelected} equipped={equipped} />
    </View>
  );

  return (
    <ScreenBackground end={{ x: 0, y: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ChevronLeft size={16} color="#4b5563" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerSub}>Character Shop</Text>
            <Text style={s.headerTitle}>캐릭터 상점 ✨</Text>
          </View>
          <View style={s.goldBadge}>
            <CoinDot size={13} />
            <Text style={s.goldTxt}>{gold.toLocaleString()}</Text>
          </View>
        </View>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
          {FILTERS.map(({ key, label }) => (
            <TouchableOpacity key={key} onPress={() => setActiveFilter(key)} style={s.filterBtnWrap} activeOpacity={0.8}>
              {activeFilter === key ? (
                <LinearGradient colors={['#f472b6','#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.filterActive}>
                  <Text style={s.filterActiveTxt}>{label}</Text>
                </LinearGradient>
              ) : (
                <View style={s.filterInactive}>
                  <Text style={s.filterInactiveTxt}>{label}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grid */}
        {filtered.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>🔍</Text>
            <Text style={s.emptyTxt}>해당하는 캐릭터가 없어요</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={item => String(item.id)}
            numColumns={3}
            style={s.grid}
            contentContainerStyle={s.gridContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Bottom panel */}
        {selectedChar && (
          <View style={s.bottomPanel}>
            <View style={s.panelInfo}>
              <LinearGradient colors={selectedChar.bg} style={s.panelImg}>
                {selectedChar.image ? (
                  <ImageWithFallback
                    uri={selectedChar.image}
                    style={[s.panelImgInner, !selectedChar.owned && { opacity: 0.5 }]}
                  />
                ) : (
                  <View style={{ flex: 1 }} />
                )}
              </LinearGradient>
              <View style={s.panelText}>
                <Text style={s.panelName} numberOfLines={1}>{selectedChar.name}</Text>
                <Text style={s.panelDesc} numberOfLines={1}>
                  {selectedChar.desc}{selectedChar.owned ? ' · 보유 중' : ''}
                </Text>
              </View>
              {!selectedChar.owned && (
                <View style={s.panelCostBadge}>
                  <CoinDot size={11} />
                  <Text style={s.panelCostTxt}>{selectedChar.cost.toLocaleString()}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={selectedChar.owned ? handleEquip : handleBuy}
              disabled={!canBuy && !selectedChar.owned || (selectedChar.owned && selectedChar.id === equipped)}
              activeOpacity={0.85}
              style={s.actionBtnWrap}
            >
              {selectedChar.owned && selectedChar.id !== equipped ? (
                <LinearGradient colors={['#f472b6','#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.actionBtn}>
                  <Text style={s.actionBtnTxt}>{btnLabel}</Text>
                </LinearGradient>
              ) : canBuy ? (
                <LinearGradient colors={['#f472b6','#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.actionBtn}>
                  <Text style={s.actionBtnTxt}>{btnLabel}</Text>
                </LinearGradient>
              ) : (
                <View style={[s.actionBtn, selectedChar.owned && selectedChar.id === equipped ? s.actionBtnGray : s.actionBtnRed]}>
                  <Text style={[s.actionBtnTxt, selectedChar.owned ? s.actionBtnTxtGray : s.actionBtnTxtRed]}>{btnLabel}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Toast */}
        {toast && (
          <Animated.View style={[s.toast, { opacity: toastOpacity }]}>
            <Text style={s.toastTxt}>{toast}</Text>
          </Animated.View>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  headerCenter: { alignItems: 'center' },
  headerSub: { fontSize: 9, fontWeight: '700', color: '#9ca3af', letterSpacing: 3, textTransform: 'uppercase' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#111827', letterSpacing: -0.3 },
  goldBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  goldTxt: { fontSize: 12, fontWeight: '900', color: '#d97706' },

  filterScroll: { flexGrow: 0 },
  filterContent: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterBtnWrap: { flexShrink: 0 },
  filterActive: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
  filterActiveTxt: { fontSize: 11, fontWeight: '900', color: '#fff' },
  filterInactive: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, backgroundColor: '#fff', borderWidth: 2, borderColor: '#e5e7eb' },
  filterInactiveTxt: { fontSize: 11, fontWeight: '900', color: '#6b7280' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyEmoji: { fontSize: 32 },
  emptyTxt: { fontSize: 13, fontWeight: '700', color: '#d1d5db' },

  grid: { flex: 1 },
  gridContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  gridItem: { flex: 1 / 3, padding: 4 },

  charCard: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff' },
  charCardSel: { shadowColor: '#ec4899', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 6, borderWidth: 2, borderColor: '#f9a8d4' },
  charCardNormal: { borderWidth: 1, borderColor: '#f3f4f6' },
  charImgArea: { aspectRatio: 1, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  charImg: { width: '100%', height: '100%' },
  charImgPlaceholder: { width: '100%', height: '100%' },
  lockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.08)' },
  lockCircle: { width: 24, height: 24, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkBadge: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  checkBadgeTxt: { color: '#fff', fontWeight: '900', fontSize: 8 },
  specialBadge: { position: 'absolute', top: 6, left: 6, borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  specialBadgeTxt: { color: '#fff', fontWeight: '900', fontSize: 7 },

  charTextArea: { paddingHorizontal: 8, paddingVertical: 6, gap: 3 },
  charName: { fontSize: 10, fontWeight: '900', color: '#1f2937' },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  costTxt: { fontSize: 10, fontWeight: '900', color: '#d97706' },
  usingBadge: { backgroundColor: '#ecfdf5', borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  usingBadgeTxt: { fontSize: 9, fontWeight: '900', color: '#059669' },
  ownedBadge: { backgroundColor: '#f5f3ff', borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  ownedBadgeTxt: { fontSize: 9, fontWeight: '900', color: '#7c3aed' },

  bottomPanel: { backgroundColor: '#fff', borderTopWidth: 2, borderTopColor: '#f3f4f6', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 12 },
  panelInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  panelImg: { width: 48, height: 48, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#fbcfe8', flexShrink: 0 },
  panelImgInner: { width: '100%', height: '100%' },
  panelText: { flex: 1 },
  panelName: { fontSize: 13, fontWeight: '900', color: '#111827' },
  panelDesc: { fontSize: 10, fontWeight: '600', color: '#9ca3af', marginTop: 2 },
  panelCostBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  panelCostTxt: { fontSize: 12, fontWeight: '900', color: '#d97706' },

  actionBtnWrap: { borderRadius: 16, overflow: 'hidden' },
  actionBtn: { height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  actionBtnGray: { backgroundColor: '#f3f4f6' },
  actionBtnRed: { backgroundColor: '#fef2f2' },
  actionBtnTxt: { fontSize: 13, fontWeight: '900', color: '#fff' },
  actionBtnTxtGray: { color: '#9ca3af' },
  actionBtnTxtRed: { color: '#f87171' },

  toast: { position: 'absolute', bottom: 100, alignSelf: 'center', backgroundColor: 'rgba(17,24,39,0.85)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99 },
  toastTxt: { color: '#fff', fontSize: 11, fontWeight: '900' },
});
