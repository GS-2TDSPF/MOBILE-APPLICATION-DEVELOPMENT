import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlertContext } from '../contexts/AlertContext';
import { Sensor } from '../services/sensorService';
import { COLORS, FONTS, RADIUS } from '../utils/theme';

const TIPO_ICON: Record<string, { icon: string; lib: 'Feather' | 'MCI'; color: string }> = {
  PLUVIOMETRO:   { icon: 'weather-rainy',       lib: 'MCI',    color: '#38BDF8' },
  NIVEL_RIO:     { icon: 'waves',               lib: 'MCI',    color: '#0EA5E9' },
  METEOROLOGICA: { icon: 'cloud',               lib: 'Feather', color: '#94A3B8' },
  INCLINOMETRO:  { icon: 'trending-up',         lib: 'Feather', color: '#F59E0B' },
  BAROMETRO:     { icon: 'gauge',               lib: 'MCI',    color: '#A78BFA' },
  SISMOGRAFO:    { icon: 'vibrate',             lib: 'MCI',    color: '#EF4444' },
  DEFAULT:       { icon: 'radio',               lib: 'MCI',    color: COLORS.primary },
};

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `Há ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Há ${diffH}h`;
    return `Há ${Math.floor(diffH / 24)} dia(s)`;
  } catch {
    return '—';
  }
}

function SensorIcon({ tipo, size = 20 }: { tipo: string; size?: number }) {
  const cfg = TIPO_ICON[tipo] ?? TIPO_ICON.DEFAULT;
  if (cfg.lib === 'MCI') {
    return <MaterialCommunityIcons name={cfg.icon as any} size={size} color={cfg.color} />;
  }
  return <Feather name={cfg.icon as any} size={size} color={cfg.color} />;
}

export default function SensorsScreen() {
  const { sensors, refresh, isRefreshing } = useAlertContext();
  const [isLoading, setIsLoading] = useState(false);

  const online = sensors.filter((s) => s.status === 'ONLINE');
  const offline = sensors.filter((s) => s.status === 'OFFLINE');
  const maintenance = sensors.filter((s) => s.status === 'MANUTENCAO');

  function statusColor(status: Sensor['status']) {
    if (status === 'ONLINE') return COLORS.success;
    if (status === 'OFFLINE') return COLORS.danger;
    return COLORS.warning;
  }

  function statusLabel(status: Sensor['status']) {
    if (status === 'ONLINE') return 'Online';
    if (status === 'OFFLINE') return 'Offline';
    return 'Manutenção';
  }

  if (sensors.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Conectando à rede de sensores...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconWrapper}>
          <MaterialCommunityIcons name="broadcast" size={24} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Rede de Sensores IoT</Text>
          <Text style={styles.headerSubtitle}>
            {sensors.length} dispositivos registrados
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: COLORS.success, borderLeftWidth: 3 }]}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{online.length}</Text>
          <Text style={styles.statLabel}>Online</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: COLORS.danger, borderLeftWidth: 3 }]}>
          <Text style={[styles.statValue, { color: COLORS.danger }]}>{offline.length}</Text>
          <Text style={styles.statLabel}>Offline</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: COLORS.warning, borderLeftWidth: 3 }]}>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>{maintenance.length}</Text>
          <Text style={styles.statLabel}>Manutenção</Text>
        </View>
      </View>

      {/* Sensores Online */}
      {online.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Ativos e Operacionais</Text>
          {online.map((sensor) => <SensorCard key={sensor.id} sensor={sensor} />)}
        </>
      )}

      {/* Sensores em Manutenção */}
      {maintenance.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Em Manutenção</Text>
          {maintenance.map((sensor) => <SensorCard key={sensor.id} sensor={sensor} />)}
        </>
      )}

      {/* Sensores Offline */}
      {offline.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Offline</Text>
          {offline.map((sensor) => <SensorCard key={sensor.id} sensor={sensor} />)}
        </>
      )}
    </ScrollView>
  );
}

function SensorCard({ sensor }: { sensor: Sensor }) {
  const cfg = TIPO_ICON[sensor.tipo] ?? TIPO_ICON.DEFAULT;
  const color = cfg.color;

  function batteryIcon() {
    if (sensor.bateria > 60) return 'battery';
    if (sensor.bateria > 20) return 'battery';
    return 'battery-charging';
  }

  function batteryColor() {
    if (sensor.bateria > 40) return COLORS.success;
    if (sensor.bateria > 15) return COLORS.warning;
    return COLORS.danger;
  }

  return (
    <View style={styles.sensorCard}>
      {/* Cabeçalho */}
      <View style={styles.sensorHeader}>
        <View style={[styles.sensorIconBox, { backgroundColor: `${color}15` }]}>
          <SensorIcon tipo={sensor.tipo} size={22} />
        </View>
        <View style={styles.sensorInfo}>
          <Text style={styles.sensorName}>{sensor.nome}</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={11} color={COLORS.textMuted} />
            <Text style={styles.sensorLocation}>
              {sensor.localizacao} — {sensor.municipio}, {sensor.estado}
            </Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: sensor.status === 'ONLINE' ? COLORS.success : sensor.status === 'OFFLINE' ? COLORS.danger : COLORS.warning }]} />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Leitura atual */}
      {sensor.valorAtual !== undefined && sensor.status === 'ONLINE' && (
        <View style={styles.readingRow}>
          <Text style={styles.readingLabel}>Leitura atual</Text>
          <Text style={[styles.readingValue, { color }]}>
            {sensor.valorAtual} <Text style={styles.readingUnit}>{sensor.unidade}</Text>
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.sensorFooter}>
        <View style={styles.footerItem}>
          <Feather name={batteryIcon()} size={13} color={batteryColor()} />
          <Text style={[styles.footerText, { color: batteryColor() }]}>{sensor.bateria}%</Text>
        </View>
        <View style={styles.footerItem}>
          <Feather name="clock" size={13} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>{formatTime(sensor.ultimaLeitura)}</Text>
        </View>
        <View style={styles.footerItem}>
          <View style={[styles.statusPill, {
            backgroundColor: sensor.status === 'ONLINE'
              ? `${COLORS.success}20`
              : sensor.status === 'OFFLINE'
                ? `${COLORS.danger}20`
                : `${COLORS.warning}20`
          }]}>
            <Text style={[styles.statusPillText, {
              color: sensor.status === 'ONLINE' ? COLORS.success : sensor.status === 'OFFLINE' ? COLORS.danger : COLORS.warning
            }]}>
              {sensor.status === 'ONLINE' ? 'Online' : sensor.status === 'OFFLINE' ? 'Offline' : 'Manutenção'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: COLORS.bgPrimary },
  loadingText: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.regular },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  headerIconWrapper: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontFamily: FONTS.bold },
  headerSubtitle: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.regular },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { color: COLORS.textPrimary, fontSize: 24, fontFamily: FONTS.bold, marginBottom: 2 },
  statLabel: { color: COLORS.textSecondary, fontSize: 11, fontFamily: FONTS.medium },
  sectionTitle: {
    color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.semiBold,
    letterSpacing: 0.7, marginBottom: 12,
  },
  sensorCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  sensorHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  sensorIconBox: { width: 42, height: 42, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  sensorInfo: { flex: 1 },
  sensorName: { color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.semiBold, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sensorLocation: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.regular, flex: 1 },
  statusBadge: { alignItems: 'center', justifyContent: 'center', paddingTop: 2 },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  readingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  readingLabel: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.regular },
  readingValue: { fontSize: 20, fontFamily: FONTS.bold },
  readingUnit: { fontSize: 13, fontFamily: FONTS.regular },
  sensorFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { color: COLORS.textSecondary, fontSize: 12, fontFamily: FONTS.medium },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusPillText: { fontSize: 11, fontFamily: FONTS.semiBold },
});
