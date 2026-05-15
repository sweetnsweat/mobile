import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MessageCircle, ChevronRight, BookOpen } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BottomNav } from '../../components/BottomNav';
import { getStoryChatList, StoryChatItem } from '../../services/StoryService';
import { resolveMediaUrl } from '../../services/HomeService';

type Props = NativeStackScreenProps<RootStackParamList, 'StoryChatList'>;

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  PAUSED: '일시정지',
};

const STATUS_COLOR: Record<string, string> = {
  IN_PROGRESS: '#ec4899',
  COMPLETED: '#10b981',
  PAUSED: '#9ca3af',
};

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}시간 전`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}일 전`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function ChatCard({ item, onPress }: { item: StoryChatItem; onPress: () => void }) {
  const title = item.displayName || item.scenarioTitle;
  const imageUri = resolveMediaUrl(item.imageUrl || item.thumbnailUrl);
  const bgUri = resolveMediaUrl(item.backgroundImageUrl || item.worldImageUrl);
  const statusLabel = STATUS_LABEL[item.status] ?? item.status;
  const statusColor = STATUS_COLOR[item.status] ?? '#9ca3af';

  return (
    <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={onPress}>
      {/* Background image strip */}
      {bgUri ? (
        <Image source={{ uri: bgUri }} style={s.cardBg} resizeMode="cover" />
      ) : null}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
        style={StyleSheet.absoluteFill}
      />

      <View style={s.cardInner}>
        {/* Character avatar */}
        <View style={s.avatarWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={s.avatar} resizeMode="cover" />
          ) : (
            <View style={[s.avatar, s.avatarFallback]}>
              <BookOpen size={22} color="#fff" strokeWidth={2.5} />
            </View>
          )}
          <View style={[s.statusDot, { backgroundColor: statusColor }]} />
        </View>

        {/* Text */}
        <View style={s.cardBody}>
          <View style={s.cardTitleRow}>
            <Text style={s.cardTitle} numberOfLines={1}>{title}</Text>
            <View style={[s.statusBadge, { borderColor: statusColor }]}>
              <Text style={[s.statusBadgeTxt, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={s.cardSub} numberOfLines={1}>{item.scenarioTitle}</Text>
          {item.lastMessage ? (
            <Text style={s.lastMsg} numberOfLines={2}>{item.lastMessage}</Text>
          ) : null}
          <View style={s.cardMeta}>
            <Text style={s.cardChapter}>{item.currentChapterNum}챕터</Text>
            <Text style={s.cardTime}>{formatUpdatedAt(item.updatedAt)}</Text>
          </View>
        </View>

        <ChevronRight size={16} color="rgba(255,255,255,0.6)" strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
}

export function StoryChatListScreen({ navigation }: Props) {
  const [chats, setChats] = useState<StoryChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, []),
  );

  async function loadChats() {
    setLoading(true);
    setError('');
    try {
      const data = await getStoryChatList(50);
      setChats(data.chats);
    } catch (e: any) {
      setError(e?.message ?? '채팅 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handlePressChat(item: StoryChatItem) {
    navigation.navigate('CharacterQuest', { scenario_id: item.scenarioId, introStarted: true });
  }

  return (
    <ScreenBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <LinearGradient
          colors={['#ec4899', '#f43f5e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.header}
        >
          <MessageCircle size={20} color="#fff" strokeWidth={2.5} />
          <Text style={s.headerTitle}>스토리 채팅</Text>
        </LinearGradient>

        {/* Content */}
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator color="#ec4899" size="large" />
            <Text style={s.loadingTxt}>채팅 목록 불러오는 중...</Text>
          </View>
        ) : error ? (
          <View style={s.center}>
            <Text style={s.errorTxt}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={loadChats} activeOpacity={0.8}>
              <Text style={s.retryTxt}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : chats.length === 0 ? (
          <View style={s.center}>
            <BookOpen size={48} color="#e5e7eb" strokeWidth={1.5} />
            <Text style={s.emptyTxt}>진행 중인 채팅방이 없습니다</Text>
            <Text style={s.emptySub}>홈에서 세계관을 선택해 채팅을 시작해보세요.</Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={item => String(item.progressId)}
            renderItem={({ item }) => (
              <ChatCard item={item} onPress={() => handlePressChat(item)} />
            )}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={s.separator} />}
          />
        )}

        <BottomNav active="chat" navigation={navigation} />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  loadingTxt: { fontSize: 13, fontWeight: '700', color: '#9ca3af' },
  errorTxt: { fontSize: 13, fontWeight: '700', color: '#ef4444', textAlign: 'center' },
  retryBtn: { backgroundColor: '#ec4899', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  retryTxt: { fontSize: 13, fontWeight: '900', color: '#fff' },
  emptyTxt: { fontSize: 15, fontWeight: '900', color: '#374151', textAlign: 'center' },
  emptySub: { fontSize: 12, fontWeight: '600', color: '#9ca3af', textAlign: 'center', lineHeight: 18 },

  list: { padding: 16, paddingBottom: 8 },
  separator: { height: 12 },

  /* Card */
  card: {
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(236,72,153,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    backgroundColor: '#1f2937',
  },
  cardBg: { ...StyleSheet.absoluteFillObject },
  cardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },

  avatarWrap: { position: 'relative' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarFallback: { backgroundColor: 'rgba(236,72,153,0.5)', alignItems: 'center', justifyContent: 'center' },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },

  cardBody: { flex: 1, gap: 3 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '900', color: '#fff' },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statusBadgeTxt: { fontSize: 9, fontWeight: '700' },
  cardSub: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  lastMsg: { fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 15, fontWeight: '500' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  cardChapter: { fontSize: 10, fontWeight: '700', color: '#f9a8d4' },
  cardTime: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
});
