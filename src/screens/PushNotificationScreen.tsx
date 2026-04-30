import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Animated, Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Wifi, Battery, Signal } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ImageWithFallback } from '../components/ImageWithFallback';

type Props = NativeStackScreenProps<RootStackParamList, 'Push'>;

const WALLPAPER = 'https://images.unsplash.com/photo-1655215053810-5440c5e0a5dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';

const DAYS    = ['일','월','화','수','목','금','토'];
const MONTHS  = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

export function PushNotificationScreen({ navigation }: Props) {
  const now     = new Date();
  const hours   = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const time    = `${hours}:${minutes}`;
  const date    = `${MONTHS[now.getMonth()]} ${now.getDate()}일 ${DAYS[now.getDay()]}요일`;

  const slideAnim = useRef(new Animated.Value(-120)).current;
  useEffect(() => {
    Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Wallpaper */}
      <ImageWithFallback uri={WALLPAPER} style={s.wallpaper} />

      {/* Dark overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.4)','transparent','rgba(0,0,0,0.6)']}
        style={s.overlay}
      />

      <SafeAreaView style={s.safe}>
        {/* Status bar */}
        <View style={s.statusBar}>
          <Text style={s.statusTime}>{time}</Text>
          <View style={s.statusIcons}>
            <Signal size={16} color="#fff" strokeWidth={2.5} />
            <Wifi size={16} color="#fff" strokeWidth={2.5} />
            <Battery size={20} color="#fff" strokeWidth={2.5} />
          </View>
        </View>

        {/* Big clock */}
        <View style={s.clockWrap}>
          <Text style={s.clockTime}>{time}</Text>
          <Text style={s.clockDate}>{date}</Text>
        </View>

        {/* Push notification card */}
        <Animated.View style={[s.notifCard, { transform: [{ translateY: slideAnim }] }]}>
          <View style={s.notifHeader}>
            <LinearGradient colors={['#ec4899','#0ea5e9']} style={s.notifIcon}>
              <Dumbbell size={24} color="#fff" strokeWidth={2.5} />
            </LinearGradient>
            <View style={s.notifHeaderText}>
              <Text style={s.notifSender}>민수 선배</Text>
              <Text style={s.notifTime}>지금</Text>
            </View>
          </View>
          <View style={s.notifBody}>
            <Text style={s.notifMsg}>오늘 나랑 20분 러닝 뛸래? 🏃‍♂️</Text>
            <Text style={s.notifSub}>날씨도 좋고...뛰기 딱 좋은 타이밍인데ㅎㅎ</Text>
          </View>
          <View style={s.notifActions}>
            <TouchableOpacity style={s.notifActionBtn}>
              <Text style={s.notifActionTxtGray}>나중에</Text>
            </TouchableOpacity>
            <View style={s.notifDivider} />
            <TouchableOpacity style={s.notifActionBtn}>
              <Text style={s.notifActionTxtBlue}>확인</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Notification badge */}
        <View style={s.notifBadgeWrap}>
          <View style={s.notifBadge}>
            <Text style={s.notifBadgeTxt}>알림 1개</Text>
          </View>
        </View>

        {/* Bottom lock icons */}
        <View style={s.lockIconsRow}>
          <TouchableOpacity style={s.lockIconBtn}>
            <View style={s.lockIconSquare} />
          </TouchableOpacity>
          <TouchableOpacity style={s.lockIconBtn}>
            <View style={s.lockIconCircle} />
          </TouchableOpacity>
        </View>

        {/* Home indicator */}
        <View style={s.homeIndicatorWrap}>
          <View style={s.homeIndicator} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  wallpaper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  safe: { flex: 1 },

  statusBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingTop: 8, paddingBottom: 8 },
  statusTime: { fontSize: 18, fontWeight: '600', color: '#fff' },
  statusIcons: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  clockWrap: { alignItems: 'center', marginTop: 32 },
  clockTime: { fontSize: 80, fontWeight: '300', color: '#fff', letterSpacing: -2, lineHeight: 88 },
  clockDate: { fontSize: 20, fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginTop: 4 },

  notifCard: { marginHorizontal: 16, marginTop: 32, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 20 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  notifIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifHeaderText: { flex: 1 },
  notifSender: { fontWeight: '700', color: '#111827', fontSize: 16 },
  notifTime: { fontSize: 12, color: '#6b7280' },
  notifBody: { paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
  notifMsg: { fontSize: 16, fontWeight: '500', color: '#1f2937', lineHeight: 22 },
  notifSub: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  notifActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  notifActionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  notifDivider: { width: 1, backgroundColor: '#e5e7eb' },
  notifActionTxtGray: { fontSize: 14, fontWeight: '500', color: '#4b5563' },
  notifActionTxtBlue: { fontSize: 14, fontWeight: '700', color: '#0ea5e9' },

  notifBadgeWrap: { position: 'absolute', bottom: 128, left: 0, right: 0, alignItems: 'center' },
  notifBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 24, paddingVertical: 8 },
  notifBadgeTxt: { color: '#fff', fontSize: 14, fontWeight: '500' },

  lockIconsRow: { position: 'absolute', bottom: 48, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 48 },
  lockIconBtn: { width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  lockIconSquare: { width: 24, height: 24, backgroundColor: '#fff', borderRadius: 4 },
  lockIconCircle: { width: 24, height: 24, backgroundColor: '#fff', borderRadius: 12 },

  homeIndicatorWrap: { position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center' },
  homeIndicator: { width: 128, height: 4, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 2 },
});
