import React from 'react';
import { StyleSheet, View } from 'react-native';
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
  return (
    <View style={[s.root, { backgroundColor: colors[0] }]}>
      {useGradient && (
        <View
          pointerEvents="none"
          style={[
            s.tint,
            {
              backgroundColor: colors[1],
              opacity: start.x === end.x && start.y === end.y ? 0 : 0.45,
            },
          ]}
        />
      )}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  tint: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
