import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, MessageCircle, Swords, BookOpen, User } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

export type NavTab = 'battle' | 'chat' | 'home' | 'record' | 'mypage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TABS: { key: NavTab; Icon: React.ComponentType<any>; label: string }[] = [
  { key: 'battle', Icon: Swords,        label: '배틀' },
  { key: 'chat',   Icon: MessageCircle, label: '채팅' },
  { key: 'home',   Icon: Home,          label: '홈'   },
  { key: 'record', Icon: BookOpen,      label: '기록' },
  { key: 'mypage', Icon: User,          label: '마이' },
];

interface Props {
  active: NavTab;
  navigation?: NavigationProp;
}

export function BottomNav({ active, navigation }: Props) {
  function handlePress(key: NavTab) {
    if (!navigation) return;
    if (key === 'battle') {
      navigation.navigate('Battle', {
        myName: '이수연',
        myImage: 'https://i.imgur.com/v0njcuh.png',
        opponentName: '민수 선배',
        opponentImage: 'https://i.imgur.com/ub32dOr.png',
      });
    } else if (key === 'chat') {
      navigation.navigate('CharacterQuest');
    } else if (key === 'home') {
      navigation.navigate('Home');
    } else if (key === 'mypage') {
      navigation.navigate('Mypage');
    }
  }

  return (
    <View style={s.navBar}>
      {TABS.map(({ key, Icon, label }) => {
        const isActive = key === active;
        return (
          <TouchableOpacity
            key={key}
            style={s.navItem}
            activeOpacity={0.7}
            onPress={() => handlePress(key)}
          >
            <Icon size={20} color={isActive ? '#ec4899' : '#9ca3af'} strokeWidth={isActive ? 2.5 : 2} />
            <Text style={[s.navLabel, isActive && s.navLabelActive]}>{label}</Text>
            {isActive && <View style={s.navDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  navBar: {
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderTopColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  navItem: { alignItems: 'center', gap: 2, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  navLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af' },
  navLabelActive: { color: '#ec4899' },
  navDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ec4899' },
});
