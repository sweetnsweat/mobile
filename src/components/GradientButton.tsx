import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/colors';

interface Props {
  label: string;
  onPress?: () => void;
  colors?: [string, string];
  icon?: React.ReactNode;
  wrapStyle?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  activeOpacity?: number;
}

export function GradientButton({
  label,
  onPress,
  colors = Colors.gradientBrand,
  icon,
  wrapStyle,
  textStyle,
  disabled = false,
  activeOpacity = 0.85,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      style={[s.wrap, wrapStyle]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.gradient}
      >
        {icon}
        <Text style={[s.text, textStyle]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  wrap: { borderRadius: 12, overflow: 'hidden' },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  text: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
