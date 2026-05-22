import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, Animated, FlatList, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Lock, Shield, TrendingUp, Zap, RotateCcw, Target } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenBackground } from '../../components/ScreenBackground';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { equipShopItem, getShopItems, purchaseShopItem, ShopItem } from '../../services/ShopService';

type Props = NativeStackScreenProps<RootStackParamList, 'Shop'>;
type Category = 'character' | 'pass';
type ColorPair = [string, string];

type Char = {
  id: number;
  image: string;
  name: string;
  desc: string;
  cost: number;
  owned: boolean;
  special: boolean;
  bg: ColorPair;
  equipped: boolean;
};

type Pass = {
  id: number;
  Icon: typeof Shield;
  name: string;
  desc: string;
  effect: string;
  cost: number;
  colors: ColorPair;
  iconColor: string;
  ownedQuantity: number;
};

/* ────────── 캐릭터 데이터 ────────── */
const DEFAULT_CHARACTER_BG: ColorPair = ['#fce7f3', '#ffe4e6'];

const CHAR_FILTERS = [
  { key: 'all',     label: '전체'    },
  { key: 'owned',   label: '보유 중' },
  { key: 'locked',  label: '미해금'  },
  { key: 'special', label: '스페셜'  },
];

/* ────────── 이용권 데이터 ────────── */
const PASS_PRESENTATION = [
  { keyword: '방어', Icon: Shield, colors: ['#fdf2f8', '#fce7f3'] as ColorPair, iconColor: '#ec4899' },
  { keyword: '승률', Icon: TrendingUp, colors: ['#f0f9ff', '#e0f2fe'] as ColorPair, iconColor: '#0ea5e9' },
  { keyword: 'EXP', Icon: Zap, colors: ['#fefce8', '#fef9c3'] as ColorPair, iconColor: '#ca8a04' },
  { keyword: '부활', Icon: RotateCcw, colors: ['#f0fdf4', '#dcfce7'] as ColorPair, iconColor: '#16a34a' },
  { keyword: '스킵', Icon: Target, colors: ['#ede9fe', '#f3e8ff'] as ColorPair, iconColor: '#7c3aed' },
];
const DEFAULT_PASS_PRESENTATION = PASS_PRESENTATION[0];

/* ────────── 공통 컴포넌트 ────────── */
function CoinDot({ size = 13 }: { size?: number }) {
  return (
    <LinearGradient
      colors={['#fde047', '#d97706']}
      style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: '#fff' }}
    />
  );
}

function metadataString(item: ShopItem, key: string): string | null {
  const value = item.metadata?.[key];
  return typeof value === 'string' ? value : null;
}

function metadataColors(item: ShopItem, fallback: ColorPair): ColorPair {
  const value = item.metadata?.bg;
  if (Array.isArray(value) && typeof value[0] === 'string' && typeof value[1] === 'string') {
    return [value[0], value[1]];
  }
  return fallback;
}

function mapCharacter(item: ShopItem): Char {
  return {
    id: item.id,
    image: item.imageUrl ?? '',
    name: item.name,
    desc: item.description ?? metadataString(item, 'subtitle') ?? '',
    cost: item.priceCurrency,
    owned: item.owned,
    special: item.special,
    bg: metadataColors(item, DEFAULT_CHARACTER_BG),
    equipped: item.equipped,
  };
}

function mapPass(item: ShopItem): Pass {
  const presentation = PASS_PRESENTATION.find(entry => item.name.includes(entry.keyword)) ?? DEFAULT_PASS_PRESENTATION;
  return {
    id: item.id,
    Icon: presentation.Icon,
    name: item.name,
    desc: item.description ?? '',
    effect: item.effect ?? metadataString(item, 'effectLabel') ?? '보유 아이템',
    cost: item.priceCurrency,
    colors: metadataColors(item, presentation.colors),
    iconColor: presentation.iconColor,
    ownedQuantity: item.ownedQuantity,
  };
}

function CharCard({ char, selected, onSelect, equipped }: {
  char: Char; selected: number | null; onSelect: (id: number) => void; equipped: number | null;
}) {
  const locked = !char.owned;
  const isSel = selected === char.id;

  return (
    <TouchableOpacity
      onPress={() => onSelect(char.id)}
      activeOpacity={0.85}
      style={[s.charCard, isSel ? s.charCardSel : s.charCardNormal]}
    >
      <LinearGradient colors={char.bg} style={s.charImgArea}>
        {char.image ? (
          <ImageWithFallback uri={char.image} style={[s.charImg, locked && { opacity: 0.4 }]} />
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
          <LinearGradient colors={['#f472b6', '#38bdf8']} style={s.checkBadge}>
            <Text style={s.checkBadgeTxt}>✓</Text>
          </LinearGradient>
        )}
        {char.special && (
          <LinearGradient colors={['#f472b6', '#c084fc']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.specialBadge}>
            <Text style={s.specialBadgeTxt}>SPECIAL</Text>
          </LinearGradient>
        )}
      </LinearGradient>
      <View style={s.charTextArea}>
        <Text style={s.charName} numberOfLines={1}>{char.name}</Text>
        {char.owned ? (
          char.id === equipped
            ? <View style={s.usingBadge}><Text style={s.usingBadgeTxt}>사용중</Text></View>
            : <View style={s.ownedBadge}><Text style={s.ownedBadgeTxt}>보유중</Text></View>
        ) : (
          <View style={s.costRow}>
            <CoinDot size={9} />
            <Text style={s.costTxt}>{char.cost.toLocaleString()}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ────────── 메인 화면 ────────── */
export function ShopScreen({ navigation }: Props) {
  const [category, setCategory] = useState<Category>('character');
  const [chars, setChars] = useState<Char[]>([]);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [gold, setGold] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);
  const [equipped, setEquipped] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [toastOpacity]);

  const loadShop = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [characterResponse, passResponse] = await Promise.all([
        getShopItems('character'),
        getShopItems('pass'),
      ]);
      const nextChars = characterResponse.items.map(mapCharacter);
      const nextPasses = passResponse.items.map(mapPass);
      const equippedChar = nextChars.find(char => char.equipped);
      setChars(nextChars);
      setPasses(nextPasses);
      setGold(characterResponse.balanceCurrency ?? passResponse.balanceCurrency ?? 0);
      setEquipped(equippedChar?.id ?? null);
      setSelected(prev => (prev != null && nextChars.some(char => char.id === prev)) ? prev : nextChars[0]?.id ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '상점 정보를 불러오지 못했습니다.';
      setError(message);
      showToast(message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadShop();
  }, [loadShop]);

  const filtered = chars.filter(c => {
    if (activeFilter === 'owned')   return c.owned;
    if (activeFilter === 'locked')  return !c.owned;
    if (activeFilter === 'special') return c.special;
    return true;
  });

  const selectedChar = chars.find(c => c.id === selected);
  const canBuy = selectedChar && !selectedChar.owned && gold >= selectedChar.cost;

  async function handleBuy() {
    if (!selectedChar || selectedChar.owned || gold < selectedChar.cost) return;
    try {
      const response = await purchaseShopItem(selectedChar.id);
      setGold(response.balanceCurrency);
      setChars(prev => prev.map(c => c.id === selectedChar.id ? { ...c, owned: true } : c));
      showToast(`${selectedChar.name} 해금 완료!`);
      loadShop();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '구매에 실패했습니다.');
    }
  }

  async function handleEquip() {
    if (!selectedChar || !selectedChar.owned) return;
    try {
      await equipShopItem(selectedChar.id);
      setEquipped(selectedChar.id);
      setChars(prev => prev.map(c => ({ ...c, equipped: c.id === selectedChar.id })));
      showToast(`${selectedChar.name} 적용 완료`);
      loadShop();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '적용에 실패했습니다.');
    }
  }

  async function handleBuyPass(pass: Pass) {
    if (gold < pass.cost) {
      showToast('골드가 부족해요');
      return;
    }
    try {
      const response = await purchaseShopItem(pass.id);
      setGold(response.balanceCurrency);
      setPasses(prev => prev.map(item => item.id === pass.id ? { ...item, ownedQuantity: item.ownedQuantity + 1 } : item));
      showToast(`${pass.name} 구매 완료!`);
      loadShop();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '구매에 실패했습니다.');
    }
  }

  const btnLabel = selectedChar
    ? selectedChar.owned
      ? selectedChar.id === equipped ? '현재 사용 중' : '적용하기'
      : canBuy
        ? `${selectedChar.cost.toLocaleString()} 골드로 구매하기`
        : `골드 부족 (${(selectedChar.cost - gold).toLocaleString()} 더 필요)`
    : '';

  const renderChar = ({ item }: { item: Char }) => (
    <View style={s.gridItem}>
      <CharCard char={item} selected={selected} onSelect={setSelected} equipped={equipped} />
    </View>
  );

  return (
    <ScreenBackground end={{ x: 0, y: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* 헤더 */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ChevronLeft size={16} color="#4b5563" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerSub}>Shop</Text>
            <Text style={s.headerTitle}>상점 ✨</Text>
          </View>
          <View style={s.goldBadge}>
            <CoinDot size={13} />
            <Text style={s.goldTxt}>{gold.toLocaleString()}</Text>
          </View>
        </View>

        {/* 카테고리 탭 */}
        <View style={s.categoryWrap}>
          <TouchableOpacity
            style={[s.categoryTab, category === 'character' && s.categoryTabActive]}
            onPress={() => setCategory('character')}
            activeOpacity={0.8}
          >
            {category === 'character' ? (
              <LinearGradient colors={['#f472b6', '#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.categoryTabGrad}>
                <Text style={s.categoryTabTxtActive}>캐릭터</Text>
              </LinearGradient>
            ) : (
              <Text style={s.categoryTabTxt}>캐릭터</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.categoryTab, category === 'pass' && s.categoryTabActive]}
            onPress={() => setCategory('pass')}
            activeOpacity={0.8}
          >
            {category === 'pass' ? (
              <LinearGradient colors={['#f472b6', '#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.categoryTabGrad}>
                <Text style={s.categoryTabTxtActive}>이용권</Text>
              </LinearGradient>
            ) : (
              <Text style={s.categoryTabTxt}>이용권</Text>
            )}
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={s.emptyWrap}>
            <ActivityIndicator color="#ec4899" />
            <Text style={s.emptyTxt}>상점 정보를 불러오는 중이에요</Text>
          </View>
        )}

        {!loading && error && (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>!</Text>
            <Text style={s.emptyTxt}>{error}</Text>
            <TouchableOpacity activeOpacity={0.85} onPress={loadShop} style={s.retryBtn}>
              <Text style={s.retryTxt}>다시 불러오기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── 캐릭터 탭 ── */}
        {!loading && !error && category === 'character' && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
              {CHAR_FILTERS.map(({ key, label }) => (
                <TouchableOpacity key={key} onPress={() => setActiveFilter(key)} style={s.filterBtnWrap} activeOpacity={0.8}>
                  {activeFilter === key ? (
                    <LinearGradient colors={['#f472b6', '#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.filterActive}>
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

            {filtered.length === 0 ? (
              <View style={s.emptyWrap}>
                <Text style={s.emptyEmoji}>🔍</Text>
                <Text style={s.emptyTxt}>해당하는 캐릭터가 없어요</Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                renderItem={renderChar}
                keyExtractor={item => String(item.id)}
                numColumns={3}
                style={s.grid}
                contentContainerStyle={s.gridContent}
                showsVerticalScrollIndicator={false}
              />
            )}

            {selectedChar && (
              <View style={s.bottomPanel}>
                <View style={s.panelInfo}>
                  <LinearGradient colors={selectedChar.bg} style={s.panelImg}>
                    {selectedChar.image
                      ? <ImageWithFallback uri={selectedChar.image} style={[s.panelImgInner, !selectedChar.owned && { opacity: 0.5 }]} />
                      : <View style={{ flex: 1 }} />}
                  </LinearGradient>
                  <View style={s.panelText}>
                    <Text style={s.panelName} numberOfLines={1}>{selectedChar.name}</Text>
                    <Text style={s.panelDesc} numberOfLines={1}>{selectedChar.desc}{selectedChar.owned ? ' · 보유 중' : ''}</Text>
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
                  disabled={(!canBuy && !selectedChar.owned) || (selectedChar.owned && selectedChar.id === equipped)}
                  activeOpacity={0.85}
                  style={s.actionBtnWrap}
                >
                  {(selectedChar.owned && selectedChar.id !== equipped) || canBuy ? (
                    <LinearGradient colors={['#f472b6', '#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.actionBtn}>
                      <Text style={s.actionBtnTxt}>{btnLabel}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[s.actionBtn, selectedChar.owned ? s.actionBtnGray : s.actionBtnRed]}>
                      <Text style={[s.actionBtnTxt, selectedChar.owned ? s.actionBtnTxtGray : s.actionBtnTxtRed]}>{btnLabel}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* ── 이용권 탭 ── */}
        {!loading && !error && category === 'pass' && (
          <ScrollView style={s.passScroll} contentContainerStyle={s.passContent} showsVerticalScrollIndicator={false}>
            <Text style={s.passSectionLabel}>배틀 · 기록 보호 아이템</Text>
            {passes.map(pass => {
              const canAfford = gold >= pass.cost;
              const PassIcon = pass.Icon;
              return (
                <View key={pass.id} style={s.passCard}>
                  <LinearGradient colors={pass.colors} style={s.passIconWrap}>
                    <PassIcon size={20} color={pass.iconColor} strokeWidth={2.5} />
                  </LinearGradient>
                  <View style={s.passInfo}>
                    <Text style={s.passName}>{pass.name}</Text>
                    <Text style={s.passDesc}>{pass.desc}</Text>
                    <View style={s.passEffectBadge}>
                      <Text style={s.passEffectTxt}>{pass.effect}{pass.ownedQuantity > 0 ? ` · 보유 ${pass.ownedQuantity}` : ''}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={s.passBuyBtn}
                    onPress={() => handleBuyPass(pass)}
                  >
                    {canAfford ? (
                      <LinearGradient colors={['#f472b6', '#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.passBuyGrad}>
                        <CoinDot size={10} />
                        <Text style={s.passBuyTxt}>{pass.cost.toLocaleString()}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={s.passBuyDisabled}>
                        <CoinDot size={10} />
                        <Text style={s.passBuyTxtDisabled}>{pass.cost.toLocaleString()}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
            <View style={{ height: 16 }} />
          </ScrollView>
        )}

        {/* 토스트 */}
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

  /* 카테고리 탭 */
  categoryWrap: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#f3f4f6', borderRadius: 14, padding: 4, gap: 4 },
  categoryTab: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  categoryTabActive: {},
  categoryTabGrad: { paddingVertical: 8, alignItems: 'center' },
  categoryTabTxt: { fontSize: 13, fontWeight: '900', color: '#9ca3af', textAlign: 'center', paddingVertical: 8 },
  categoryTabTxtActive: { fontSize: 13, fontWeight: '900', color: '#fff' },

  /* 캐릭터 필터 */
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
  retryBtn: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', paddingHorizontal: 14, paddingVertical: 8 },
  retryTxt: { fontSize: 12, fontWeight: '900', color: '#ec4899' },

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

  /* 이용권 탭 */
  passScroll: { flex: 1 },
  passContent: { paddingHorizontal: 16, paddingTop: 4, gap: 10 },
  passSectionLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  passCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  passIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  passInfo: { flex: 1, gap: 3 },
  passName: { fontSize: 14, fontWeight: '900', color: '#111827' },
  passDesc: { fontSize: 11, fontWeight: '600', color: '#6b7280' },
  passEffectBadge: { backgroundColor: '#f9fafb', borderRadius: 99, borderWidth: 1, borderColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  passEffectTxt: { fontSize: 9, fontWeight: '700', color: '#9ca3af' },
  passBuyBtn: { flexShrink: 0, borderRadius: 12, overflow: 'hidden' },
  passBuyGrad: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8 },
  passBuyTxt: { fontSize: 12, fontWeight: '900', color: '#fff' },
  passBuyDisabled: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f3f4f6', borderRadius: 12 },
  passBuyTxtDisabled: { fontSize: 12, fontWeight: '900', color: '#9ca3af' },

  toast: { position: 'absolute', bottom: 100, alignSelf: 'center', backgroundColor: 'rgba(17,24,39,0.85)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99 },
  toastTxt: { color: '#fff', fontSize: 11, fontWeight: '900' },
});
