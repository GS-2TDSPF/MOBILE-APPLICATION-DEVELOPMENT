import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert } from '../types/Alert';
import { RiskBadge } from './RiskBadge';
import { RISK_COLORS } from '../utils/riskColors';
import { timeAgo } from '../utils/dateFormatter';
import { COLORS, FONTS, RADIUS } from '../utils/theme';

interface AlertCardProps {
  alert: Alert;
  onPress?: (alert: Alert) => void;
}

const TIPO_ICONS: Record<string, { lib: 'feather' | 'mci'; name: string }> = {
  DESLIZAMENTO: { lib: 'mci', name: 'landslide' },
  ENCHENTE: { lib: 'mci', name: 'waves' },
  SECA: { lib: 'mci', name: 'weather-sunny-alert' },
  OUTROS: { lib: 'feather', name: 'alert-triangle' },
};

export function AlertCard({ alert, onPress }: AlertCardProps) {
  const borderColor = RISK_COLORS[alert.nivel];
  const iconDef = TIPO_ICONS[alert.tipoDesastre] ?? TIPO_ICONS.OUTROS;

  const renderIcon = () => {
    if (iconDef.lib === 'mci') {
      return <MaterialCommunityIcons name={iconDef.name as any} size={28} color={borderColor} />;
    }
    return <Feather name={iconDef.name as any} size={24} color={borderColor} />;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: borderColor }]}
      onPress={() => onPress?.(alert)}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${borderColor}15` }]}>
          {renderIcon()}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.titulo} numberOfLines={1}>{alert.titulo}</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={11} color={COLORS.textMuted} />
            <Text style={styles.municipio}>{alert.municipio}, {alert.estado}</Text>
          </View>
        </View>
        {alert.ativo && <View style={styles.activeDot} />}
      </View>

      <Text style={styles.descricao} numberOfLines={2}>{alert.descricao}</Text>

      <View style={styles.footer}>
        <RiskBadge level={alert.nivel} size="sm" />
        <View style={styles.timeRow}>
          <Feather name="clock" size={11} color={COLORS.textMuted} />
          <Text style={styles.tempo}>{timeAgo(alert.dataHora)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  titulo: { color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.semiBold },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  municipio: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.regular },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  descricao: { color: COLORS.textSecondary, fontSize: 13, fontFamily: FONTS.regular, lineHeight: 20, marginBottom: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tempo: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.regular },
});
