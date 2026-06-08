import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RiskLevel } from '../types/Alert';
import { RISK_COLORS, RISK_LABELS } from '../utils/riskColors';
import { FONTS, RADIUS } from '../utils/theme';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const color = RISK_COLORS[level];
  const label = RISK_LABELS[level];

  const sizeMap = {
    sm: { px: 8, py: 3, fontSize: 10, dot: 6 },
    md: { px: 12, py: 5, fontSize: 12, dot: 7 },
    lg: { px: 16, py: 8, fontSize: 14, dot: 8 },
  };
  const s = sizeMap[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}18`,
          borderColor: color,
          paddingHorizontal: s.px,
          paddingVertical: s.py,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color, width: s.dot, height: s.dot, borderRadius: s.dot / 2 }]} />
      <Text style={[styles.label, { color, fontSize: s.fontSize }]}>
        Nível {level} — {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  dot: {},
  label: {
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.3,
  },
});
