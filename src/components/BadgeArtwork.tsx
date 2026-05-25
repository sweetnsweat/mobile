import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Award, Crown, Dumbbell, Flame, ShieldCheck, Swords, Trophy, Zap } from 'lucide-react-native';

interface Props {
  badgeCode?: string | null;
  earned?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const BADGE_COLORS: Record<string, { bg: string; fg: string; ring: string; accent: string }> = {
  FIRST_QUEST_COMPLETE: { bg: '#fdf2f8', fg: '#ec4899', ring: '#f9a8d4', accent: '#38bdf8' },
  VERIFIED_QUEST_COMPLETE: { bg: '#ecfeff', fg: '#0891b2', ring: '#67e8f9', accent: '#10b981' },
  QUEST_STREAK_3: { bg: '#fff7ed', fg: '#f97316', ring: '#fdba74', accent: '#ec4899' },
  QUEST_10_COMPLETE: { bg: '#fefce8', fg: '#ca8a04', ring: '#fde047', accent: '#0ea5e9' },
  FIRST_BATTLE_JOIN: { bg: '#eff6ff', fg: '#2563eb', ring: '#93c5fd', accent: '#ec4899' },
  FIRST_BATTLE_WIN: { bg: '#fef2f2', fg: '#dc2626', ring: '#fca5a5', accent: '#facc15' },
  BATTLE_SCORE_1000: { bg: '#f5f3ff', fg: '#7c3aed', ring: '#c4b5fd', accent: '#38bdf8' },
};

function iconForBadge(badgeCode?: string | null) {
  switch (badgeCode) {
    case 'FIRST_QUEST_COMPLETE':
      return Dumbbell;
    case 'VERIFIED_QUEST_COMPLETE':
      return ShieldCheck;
    case 'QUEST_STREAK_3':
      return Flame;
    case 'QUEST_10_COMPLETE':
      return Trophy;
    case 'FIRST_BATTLE_JOIN':
      return Swords;
    case 'FIRST_BATTLE_WIN':
      return Crown;
    case 'BATTLE_SCORE_1000':
      return Zap;
    default:
      return Award;
  }
}

export function BadgeArtwork({ badgeCode, earned = true, size = 52, style }: Props) {
  const palette = BADGE_COLORS[badgeCode ?? ''] ?? {
    bg: '#f3f4f6',
    fg: '#6b7280',
    ring: '#d1d5db',
    accent: '#9ca3af',
  };
  const Icon = iconForBadge(badgeCode);
  const iconSize = Math.max(20, Math.round(size * 0.46));

  return (
    <View
      style={[
        s.wrap,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.31),
          backgroundColor: earned ? palette.bg : '#f3f4f6',
          borderColor: earned ? palette.ring : '#d1d5db',
        },
        style,
      ]}
    >
      <View
        style={[
          s.orbit,
          {
            width: Math.round(size * 0.72),
            height: Math.round(size * 0.72),
            borderRadius: Math.round(size * 0.36),
            borderColor: earned ? palette.ring : '#d1d5db',
          },
        ]}
      />
      <View
        style={[
          s.spark,
          {
            width: Math.round(size * 0.17),
            height: Math.round(size * 0.17),
            borderRadius: Math.round(size * 0.085),
            backgroundColor: earned ? palette.accent : '#d1d5db',
            top: Math.round(size * 0.16),
            right: Math.round(size * 0.17),
          },
        ]}
      />
      <View style={s.iconPlate}>
        <Icon size={iconSize} color={earned ? palette.fg : '#9ca3af'} strokeWidth={2.8} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  orbit: {
    position: 'absolute',
    borderWidth: 1.5,
    opacity: 0.45,
  },
  spark: {
    position: 'absolute',
    opacity: 0.9,
  },
  iconPlate: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
