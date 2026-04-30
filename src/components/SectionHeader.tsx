import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface Props {
  icon?: React.ReactNode;
  title: string;
  onMore?: () => void;
}

export function SectionHeader({ icon, title, onMore }: Props) {
  return (
    <View style={s.row}>
      <View style={s.titleRow}>
        {icon}
        <Text style={s.title}>{title}</Text>
      </View>
      {onMore && (
        <TouchableOpacity style={s.moreBtn} onPress={onMore}>
          <Text style={s.moreTxt}>전체보기</Text>
          <ChevronRight size={12} color="#ec4899" strokeWidth={3} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 14, fontWeight: '900', color: '#1f2937' },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreTxt: { fontSize: 11, fontWeight: '700', color: '#ec4899' },
});
