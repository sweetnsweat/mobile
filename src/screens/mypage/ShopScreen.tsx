import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Lock, Shield, Target, TrendingUp, Zap } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { ScreenBackground } from '../../components/ScreenBackground';
import {
  equipShopItem,
  getShopItems,
  purchaseShopItem,
  ShopItem,
} from '../../services/ShopService';

type Props = NativeStackScreenProps<RootStackParamList, 'Shop'>;
type Category = 'character' | 'pass';
type Filter = 'all' | 'owned' | 'locked' | 'special';
type CardItem = ShopItem & { bg: [string, string] };

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'owned', label: 'Owned' },
  { key: 'locked', label: 'Locked' },
  { key: 'special', label: 'Special' },
];

function CoinDot({ size = 13 }: { size?: number }) {
  return (
    <LinearGradient
      colors={['#fde047', '#d97706']}
      style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: '#fff' }}
    />
  );
}

function itemBg(item: ShopItem): [string, string] {
  const bg = item.metadata?.bg;
  if (Array.isArray(bg) && typeof bg[0] === 'string' && typeof bg[1] === 'string') {
    return [bg[0], bg[1]];
  }
  return item.category === 'character' ? ['#fce7f3', '#ffe4e6'] : ['#f0f9ff', '#e0f2fe'];
}

function normalizeItem(item: ShopItem): CardItem {
  return { ...item, bg: itemBg(item) };
}

function PassIcon({ item }: { item: CardItem }) {
  const Icon =
    item.itemType === 'pvp_badge' ? TrendingUp :
    item.itemType === 'ticket' ? Shield :
    item.itemType === 'gift' ? Target :
    Zap;
  const color =
    item.itemType === 'pvp_badge' ? '#0ea5e9' :
    item.itemType === 'ticket' ? '#ec4899' :
    item.itemType === 'gift' ? '#7c3aed' :
    '#ca8a04';
  return <Icon size={20} color={color} strokeWidth={2.5} />;
}

function CharacterCard({
  item,
  selected,
  onSelect,
}: {
  item: CardItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const locked = !item.owned;

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.85}
      style={[s.charCard, selected ? s.charCardSel : s.charCardNormal]}
    >
      <LinearGradient colors={item.bg} style={s.charImgArea}>
        {item.imageUrl ? (
          <ImageWithFallback uri={item.imageUrl} style={[s.charImg, locked && { opacity: 0.4 }]} />
        ) : (
          <View style={[s.charImgPlaceholder, { backgroundColor: item.bg[0] }]} />
        )}
        {locked && (
          <View style={s.lockOverlay}>
            <View style={s.lockCircle}>
              <Lock size={12} color="#6b7280" strokeWidth={2.5} />
            </View>
          </View>
        )}
        {selected && !locked && (
          <LinearGradient colors={['#f472b6', '#38bdf8']} style={s.checkBadge}>
            <Text style={s.checkBadgeTxt}>OK</Text>
          </LinearGradient>
        )}
        {item.special && (
          <LinearGradient colors={['#f472b6', '#c084fc']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.specialBadge}>
            <Text style={s.specialBadgeTxt}>SPECIAL</Text>
          </LinearGradient>
        )}
      </LinearGradient>
      <View style={s.charTextArea}>
        <Text style={s.charName} numberOfLines={1}>{item.name}</Text>
        {item.owned ? (
          <View style={item.equipped ? s.usingBadge : s.ownedBadge}>
            <Text style={item.equipped ? s.usingBadgeTxt : s.ownedBadgeTxt}>
              {item.equipped ? 'Equipped' : `Owned ${item.ownedQuantity}`}
            </Text>
          </View>
        ) : (
          <View style={s.costRow}>
            <CoinDot size={9} />
            <Text style={s.costTxt}>{item.priceCurrency.toLocaleString()}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function ShopScreen({ navigation }: Props) {
  const [category, setCategory] = useState<Category>('character');
  const [characters, setCharacters] = useState<CardItem[]>([]);
  const [passes, setPasses] = useState<CardItem[]>([]);
  const [gold, setGold] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  function showToast(message: string) {
    setToast(message);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }

  async function loadShop() {
    setLoading(true);
    try {
      const [characterList, passList] = await Promise.all([
        getShopItems('character'),
        getShopItems('pass'),
      ]);
      const nextCharacters = characterList.items.map(normalizeItem);
      const nextPasses = passList.items.map(normalizeItem);
      const equipped = nextCharacters.find(item => item.equipped);

      setCharacters(nextCharacters);
      setPasses(nextPasses);
      setGold(characterList.balanceCurrency ?? passList.balanceCurrency ?? 0);
      setSelectedId(prev =>
        prev != null && nextCharacters.some(item => item.id === prev)
          ? prev
          : equipped?.id ?? nextCharacters[0]?.id ?? null,
      );
    } catch (error: any) {
      Alert.alert('Shop', error?.response?.data?.detail ?? error?.message ?? 'Failed to load shop.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadShop);
    return unsubscribe;
  }, [navigation]);

  const filteredCharacters = characters.filter(item => {
    if (filter === 'owned') return item.owned;
    if (filter === 'locked') return !item.owned;
    if (filter === 'special') return item.special;
    return true;
  });
  const selectedItem = characters.find(item => item.id === selectedId);
  const canBuySelected = !!selectedItem && !selectedItem.owned && selectedItem.purchasable;

  async function refreshAfterAction(message: string, nextGold?: number) {
    if (nextGold != null) setGold(nextGold);
    showToast(message);
    await loadShop();
  }

  async function handlePurchase(item: CardItem) {
    if (actionLoading || !item.purchasable) return;
    setActionLoading(true);
    try {
      const result = await purchaseShopItem(item.id, { quantity: 1 });
      await refreshAfterAction(`${item.name} purchased.`, result.balanceCurrency);
    } catch (error: any) {
      const code = error?.response?.data?.code;
      showToast(code === 'INSUFFICIENT_BALANCE'
        ? 'Not enough gold.'
        : error?.response?.data?.detail ?? error?.message ?? 'Purchase failed.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEquip(item: CardItem) {
    if (actionLoading || !item.owned || item.equipped) return;
    setActionLoading(true);
    try {
      await equipShopItem(item.id);
      await refreshAfterAction(`${item.name} equipped.`);
    } catch (error: any) {
      const code = error?.response?.data?.code;
      showToast(code === 'ITEM_NOT_OWNED'
        ? 'You do not own this item.'
        : error?.response?.data?.detail ?? error?.message ?? 'Equip failed.');
    } finally {
      setActionLoading(false);
    }
  }

  function selectedButtonLabel() {
    if (!selectedItem) return '';
    if (selectedItem.equipped) return 'Equipped';
    if (selectedItem.owned) return 'Equip';
    if (!selectedItem.purchasable) return 'Unavailable';
    if (gold < selectedItem.priceCurrency) {
      return `Need ${(selectedItem.priceCurrency - gold).toLocaleString()} more`;
    }
    return `${selectedItem.priceCurrency.toLocaleString()} gold`;
  }

  return (
    <ScreenBackground end={{ x: 0, y: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ChevronLeft size={16} color="#4b5563" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerSub}>Shop</Text>
            <Text style={s.headerTitle}>Store</Text>
          </View>
          <View style={s.goldBadge}>
            <CoinDot size={13} />
            <Text style={s.goldTxt}>{gold.toLocaleString()}</Text>
          </View>
        </View>

        <View style={s.categoryWrap}>
          {(['character', 'pass'] as Category[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={s.categoryTab}
              onPress={() => setCategory(tab)}
              activeOpacity={0.8}
            >
              {category === tab ? (
                <LinearGradient colors={['#f472b6', '#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.categoryTabGrad}>
                  <Text style={s.categoryTabTxtActive}>{tab === 'character' ? 'Character' : 'Pass'}</Text>
                </LinearGradient>
              ) : (
                <Text style={s.categoryTabTxt}>{tab === 'character' ? 'Character' : 'Pass'}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color="#ec4899" size="large" />
          </View>
        ) : category === 'character' ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
              {FILTERS.map(({ key, label }) => (
                <TouchableOpacity key={key} onPress={() => setFilter(key)} style={s.filterBtnWrap} activeOpacity={0.8}>
                  {filter === key ? (
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

            <FlatList
              data={filteredCharacters}
              renderItem={({ item }) => (
                <View style={s.gridItem}>
                  <CharacterCard
                    item={item}
                    selected={item.id === selectedId}
                    onSelect={() => setSelectedId(item.id)}
                  />
                </View>
              )}
              keyExtractor={item => String(item.id)}
              numColumns={3}
              style={s.grid}
              contentContainerStyle={s.gridContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={s.emptyWrap}>
                  <Text style={s.emptyTxt}>No items.</Text>
                </View>
              }
            />

            {selectedItem && (
              <View style={s.bottomPanel}>
                <View style={s.panelInfo}>
                  <LinearGradient colors={selectedItem.bg} style={s.panelImg}>
                    {selectedItem.imageUrl
                      ? <ImageWithFallback uri={selectedItem.imageUrl} style={[s.panelImgInner, !selectedItem.owned && { opacity: 0.5 }]} />
                      : <View style={{ flex: 1 }} />}
                  </LinearGradient>
                  <View style={s.panelText}>
                    <Text style={s.panelName} numberOfLines={1}>{selectedItem.name}</Text>
                    <Text style={s.panelDesc} numberOfLines={1}>
                      {selectedItem.effect ?? selectedItem.description ?? ''}
                    </Text>
                  </View>
                  {!selectedItem.owned && (
                    <View style={s.panelCostBadge}>
                      <CoinDot size={11} />
                      <Text style={s.panelCostTxt}>{selectedItem.priceCurrency.toLocaleString()}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => selectedItem.owned ? handleEquip(selectedItem) : handlePurchase(selectedItem)}
                  disabled={actionLoading || selectedItem.equipped || (!selectedItem.owned && (!canBuySelected || gold < selectedItem.priceCurrency))}
                  activeOpacity={0.85}
                  style={s.actionBtnWrap}
                >
                  {actionLoading ? (
                    <View style={[s.actionBtn, s.actionBtnGray]}>
                      <ActivityIndicator color="#9ca3af" size="small" />
                    </View>
                  ) : (selectedItem.owned && !selectedItem.equipped) || (canBuySelected && gold >= selectedItem.priceCurrency) ? (
                    <LinearGradient colors={['#f472b6', '#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.actionBtn}>
                      <Text style={s.actionBtnTxt}>{selectedButtonLabel()}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[s.actionBtn, selectedItem.owned ? s.actionBtnGray : s.actionBtnRed]}>
                      <Text style={[s.actionBtnTxt, selectedItem.owned ? s.actionBtnTxtGray : s.actionBtnTxtRed]}>{selectedButtonLabel()}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <ScrollView style={s.passScroll} contentContainerStyle={s.passContent} showsVerticalScrollIndicator={false}>
            <Text style={s.passSectionLabel}>Battle and utility items</Text>
            {passes.map(item => {
              const canAfford = gold >= item.priceCurrency;
              return (
                <View key={item.id} style={s.passCard}>
                  <LinearGradient colors={item.bg} style={s.passIconWrap}>
                    <PassIcon item={item} />
                  </LinearGradient>
                  <View style={s.passInfo}>
                    <Text style={s.passName}>{item.name}</Text>
                    <Text style={s.passDesc}>{item.description ?? ''}</Text>
                    <View style={s.passEffectBadge}>
                      <Text style={s.passEffectTxt}>{item.effect ?? `Owned ${item.ownedQuantity}`}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={s.passBuyBtn}
                    disabled={actionLoading || !item.purchasable || !canAfford}
                    onPress={() => handlePurchase(item)}
                  >
                    {item.purchasable && canAfford ? (
                      <LinearGradient colors={['#f472b6', '#38bdf8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.passBuyGrad}>
                        <CoinDot size={10} />
                        <Text style={s.passBuyTxt}>{item.priceCurrency.toLocaleString()}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={s.passBuyDisabled}>
                        <CoinDot size={10} />
                        <Text style={s.passBuyTxtDisabled}>{item.priceCurrency.toLocaleString()}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
            <View style={{ height: 16 }} />
          </ScrollView>
        )}

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
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  headerCenter: { alignItems: 'center' },
  headerSub: { fontSize: 9, fontWeight: '700', color: '#9ca3af', letterSpacing: 3, textTransform: 'uppercase' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  goldBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  goldTxt: { fontSize: 12, fontWeight: '900', color: '#d97706' },
  categoryWrap: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#f3f4f6', borderRadius: 14, padding: 4, gap: 4 },
  categoryTab: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  categoryTabGrad: { paddingVertical: 8, alignItems: 'center' },
  categoryTabTxt: { fontSize: 13, fontWeight: '900', color: '#9ca3af', textAlign: 'center', paddingVertical: 8 },
  categoryTabTxtActive: { fontSize: 13, fontWeight: '900', color: '#fff' },
  filterScroll: { flexGrow: 0 },
  filterContent: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterBtnWrap: { flexShrink: 0 },
  filterActive: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
  filterActiveTxt: { fontSize: 11, fontWeight: '900', color: '#fff' },
  filterInactive: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, backgroundColor: '#fff', borderWidth: 2, borderColor: '#e5e7eb' },
  filterInactiveTxt: { fontSize: 11, fontWeight: '900', color: '#6b7280' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
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
  checkBadge: { position: 'absolute', top: 6, right: 6, minWidth: 20, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', paddingHorizontal: 4 },
  checkBadgeTxt: { color: '#fff', fontWeight: '900', fontSize: 7 },
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
