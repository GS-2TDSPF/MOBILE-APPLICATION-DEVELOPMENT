import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RiskLevel } from '../types/Alert';
import { RISK_COLORS, RISK_LABELS, RISK_BG_COLORS } from '../utils/riskColors';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const color = RISK_COLORS[level];
  const bgColor = RISK_BG_COLORS[level];
  const label = RISK_LABELS[level];

  const sizeStyles = {
    sm: { paddingHorizontal: 8, paddingVertical: 3, fontSize: 10, borderRadius: 6 },
    md: { paddingHorizontal: 12, paddingVertical: 5, fontSize: 12, borderRadius: 8 },
    lg: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, borderRadius: 10 },
  };

  const s = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderColor: color,
          paddingHorizontal: s.paddingHorizontal,
          paddingVertical: s.paddingVertical,
          borderRadius: s.borderRadius,
        },
      ]}
    >
      <Text style={[styles.dot, { color }]}>●</Text>
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
    gap: 5,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    fontSize: 8,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
