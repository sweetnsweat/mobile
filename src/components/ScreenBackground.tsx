import React from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/colors';

interface Props {
  children: React.ReactNode;
  colors?: [string, string];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  useGradient?: boolean;
}

export function ScreenBackground({
  children,
  colors = Colors.gradientBg,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  useGradient = true,
}: Props) {
  if (!useGradient) {
    return <View style={[s.root, { backgroundColor: colors[0] }]}>{children}</View>;
  }

  return (
    <LinearGradient colors={colors} start={start} end={end} style={s.root}>
      {children}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
});
