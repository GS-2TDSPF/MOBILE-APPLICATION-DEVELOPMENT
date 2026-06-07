import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Alert } from '../types/Alert';
import { RiskBadge } from './RiskBadge';
import { RISK_COLORS } from '../utils/riskColors';
import { timeAgo } from '../utils/dateFormatter';

interface AlertCardProps {
  alert: Alert;
  onPress?: (alert: Alert) => void;
}

export function AlertCard({ alert, onPress }: AlertCardProps) {
  const borderColor = RISK_COLORS[alert.nivel];

  const tipoIcon: Record<string, string> = {
    DESLIZAMENTO: '🏔️',
    ENCHENTE: '🌊',
    SECA: '🌵',
    OUTROS: '⚠️',
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: borderColor }]}
      onPress={() => onPress?.(alert)}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{tipoIcon[alert.tipoDesastre] ?? '⚠️'}</Text>
        <View style={styles.headerText}>
          <Text style={styles.titulo} numberOfLines={1}>
            {alert.titulo}
          </Text>
          <Text style={styles.municipio}>
            {alert.municipio}, {alert.estado}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          {alert.ativo && <View style={styles.activeDot} />}
        </View>
      </View>

      <Text style={styles.descricao} numberOfLines={2}>
        {alert.descricao}
      </Text>

      <View style={styles.footer}>
        <RiskBadge level={alert.nivel} size="sm" />
        <Text style={styles.tempo}>{timeAgo(alert.dataHora)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1F2E',
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  icon: {
    fontSize: 26,
  },
  headerText: {
    flex: 1,
  },
  titulo: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  municipio: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  descricao: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tempo: {
    color: '#64748B',
    fontSize: 11,
  },
});
