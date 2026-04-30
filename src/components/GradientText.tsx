import React from 'react';
import { Platform, Text, TextStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

interface GradientTextProps {
  colors: string[];
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export function GradientText({
  colors,
  style,
  children,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
}: GradientTextProps) {
  if (Platform.OS === 'android') {
    return (
      <Text style={style}>
        {children}
      </Text>
    );
  }

  return (
    <MaskedView maskElement={<Text style={style}>{children}</Text>}>
      <LinearGradient colors={colors} start={start} end={end}>
        <Text style={[style as TextStyle, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
