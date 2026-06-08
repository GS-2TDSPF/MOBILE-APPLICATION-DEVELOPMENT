import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlertContext } from '../contexts/AlertContext';
import { useAuth } from '../contexts/AuthContext';
import { AlertCard } from '../components/AlertCard';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { RISK_COLORS } from '../utils/riskColors';
import { COLORS, FONTS, RADIUS } from '../utils/theme';

function formatLastUpdated(date: Date | null) {
  if (!date) return 'Nunca';
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s atrás`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}min atrás`;
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function DashboardScreen({ navigation }: any) {
  const { alerts, sensors, isLoading, isRefreshing, lastUpdated, error, refresh } = useAlertContext();
  const { user } = useAuth();

  const counts = useMemo(() =>
    ([1, 2, 3, 4, 5] as const).map((nivel) => ({
      nivel, count: alerts.filter((a) => a.nivel === nivel).length,
    })), [alerts]);

  const alertasCriticos = useMemo(() => alerts.filter((a) => a.nivel >= 4), [alerts]);
  const sensoresOnline = sensors.filter((s) => s.status === 'ONLINE').length;
  const sensoresOffline = sensors.filter((s) => s.status === 'OFFLINE').length;

  if (isLoading && alerts.length === 0) return <LoadingOverlay message="Conectando ao servidor..." />;

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
        <View>
          <Text style={styles.greeting}>Olá, {user?.nome?.split(' ')[0] ?? 'Gestor'}</Text>
          <View style={styles.alertCountRow}>
            <Feather name="alert-circle" size={13} color={COLORS.textMuted} />
            <Text style={styles.headerSub}>
              {alerts.length} {alerts.length === 1 ? 'alerta ativo' : 'alertas ativos'}
            </Text>
          </View>
        </View>
        <View style={styles.satelliteTag}>
          <MaterialCommunityIcons name="satellite-variant" size={14} color={COLORS.primaryLight} />
          <Text style={styles.satelliteText}>Sentinel-1</Text>
        </View>
      </View>

      {/* Última atualização */}
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <View style={[styles.statusDot, { backgroundColor: error ? COLORS.danger : COLORS.success }]} />
          <Text style={styles.statusText}>
            {error ? 'Offline — dados em cache' : 'Ao vivo'}
          </Text>
        </View>
        <View style={styles.statusRight}>
          <Feather name="refresh-cw" size={12} color={COLORS.textMuted} />
          <Text style={styles.statusText}>Atualizado: {formatLastUpdated(lastUpdated)}</Text>
        </View>
      </View>

      {/* Cards de resumo */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: `${COLORS.danger}40` }]}>
          <Feather name="alert-octagon" size={20} color={COLORS.danger} />
          <Text style={[styles.summaryNumber, { color: COLORS.danger }]}>{alertasCriticos.length}</Text>
          <Text style={styles.summaryLabel}>Críticos</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: `${COLORS.success}40` }]}>
          <MaterialCommunityIcons name="broadcast" size={20} color={COLORS.success} />
          <Text style={[styles.summaryNumber, { color: COLORS.success }]}>{sensoresOnline}</Text>
          <Text style={styles.summaryLabel}>Sensores</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: `${COLORS.primary}40` }]}>
          <Feather name="layers" size={20} color={COLORS.primary} />
          <Text style={[styles.summaryNumber, { color: COLORS.primary }]}>{alerts.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>

      {/* Contadores por nível */}
      <Text style={styles.sectionTitle}>Distribuição por Nível</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.countsRow}>
        {counts.map(({ nivel, count }) => (
          <TouchableOpacity
            key={nivel}
            style={[styles.countCard, { borderColor: RISK_COLORS[nivel] }]}
            onPress={() => navigation.navigate('Alertas')}
          >
            <Text style={[styles.countNumber, { color: RISK_COLORS[nivel] }]}>{count}</Text>
            <Text style={styles.countLabel}>Nível {nivel}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Erro */}
      {error && (
        <View style={styles.errorBanner}>
          <Feather name="wifi-off" size={14} color={COLORS.warning} />
          <Text style={styles.errorText}>Usando cache local. Puxe para atualizar.</Text>
        </View>
      )}

      {/* Alertas Críticos */}
      {alertasCriticos.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="alert-octagon" size={15} color={COLORS.danger} />
              <Text style={styles.sectionTitleText}>Alertas Críticos</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{alertasCriticos.length}</Text>
            </View>
          </View>
          {alertasCriticos.map((alert) => (
            <AlertCard
              key={alert.id} alert={alert}
              onPress={(a) => navigation.navigate('AlertDetail', { alertId: a.id })}
            />
          ))}
        </View>
      )}

      {/* Todos os alertas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Feather name="list" size={15} color={COLORS.textPrimary} />
            <Text style={styles.sectionTitleText}>Alertas Recentes</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Alertas')}>
            <Text style={styles.verTodos}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={40} color={COLORS.success} />
            <Text style={styles.emptyTitle}>Nenhum alerta ativo</Text>
            <Text style={styles.emptySubtitle}>O sistema está monitorando normalmente.</Text>
          </View>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <AlertCard
              key={alert.id} alert={alert}
              onPress={(a) => navigation.navigate('AlertDetail', { alertId: a.id })}
            />
          ))
        )}
      </View>

      {/* Resumo de sensores */}
      {sensors.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="broadcast" size={15} color={COLORS.info} />
              <Text style={styles.sectionTitleText}>Sensores IoT</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Sensores')}>
              <Text style={styles.verTodos}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sensorSummaryCard}>
            <View style={styles.sensorStat}>
              <View style={[styles.sensorStatDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.sensorStatNum}>{sensoresOnline}</Text>
              <Text style={styles.sensorStatLabel}>Online</Text>
            </View>
            <View style={styles.sensorSeparator} />
            <View style={styles.sensorStat}>
              <View style={[styles.sensorStatDot, { backgroundColor: COLORS.danger }]} />
              <Text style={styles.sensorStatNum}>{sensoresOffline}</Text>
              <Text style={styles.sensorStatLabel}>Offline</Text>
            </View>
            <View style={styles.sensorSeparator} />
            <View style={styles.sensorStat}>
              <View style={[styles.sensorStatDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.sensorStatNum}>{sensors.filter(s => s.status === 'MANUTENCAO').length}</Text>
              <Text style={styles.sensorStatLabel}>Manutenção</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { color: COLORS.textPrimary, fontSize: 22, fontFamily: FONTS.extraBold },
  alertCountRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  headerSub: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.regular },
  satelliteTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.primary,
  },
  satelliteText: { color: COLORS.primaryLight, fontSize: 12, fontFamily: FONTS.semiBold },
  statusBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, paddingHorizontal: 14,
    paddingVertical: 8, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.medium },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, padding: 14, alignItems: 'center', gap: 6,
  },
  summaryNumber: { fontSize: 26, fontFamily: FONTS.extraBold },
  summaryLabel: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.regular },
  sectionTitle: {
    color: COLORS.textSecondary, fontSize: 11, fontFamily: FONTS.semiBold,
    letterSpacing: 0.8, marginBottom: 10,
  },
  countsRow: { gap: 10, paddingBottom: 4, marginBottom: 24 },
  countCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, padding: 14, alignItems: 'center', minWidth: 72,
  },
  countNumber: { fontSize: 26, fontFamily: FONTS.extraBold },
  countLabel: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.regular, marginTop: 4 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${COLORS.warning}15`, borderRadius: RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
    borderWidth: 1, borderColor: `${COLORS.warning}30`,
  },
  errorText: { color: COLORS.warning, fontSize: 12, fontFamily: FONTS.medium, flex: 1 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitleText: { color: COLORS.textPrimary, fontSize: 15, fontFamily: FONTS.bold },
  countBadge: { backgroundColor: COLORS.danger, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countBadgeText: { color: '#FFF', fontSize: 11, fontFamily: FONTS.bold },
  verTodos: { color: COLORS.primary, fontSize: 13, fontFamily: FONTS.semiBold },
  emptyState: {
    alignItems: 'center', gap: 10, paddingVertical: 40,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 16, fontFamily: FONTS.semiBold },
  emptySubtitle: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.regular },
  sensorSummaryCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center', paddingVertical: 18,
  },
  sensorStat: { flex: 1, alignItems: 'center', gap: 6 },
  sensorStatDot: { width: 8, height: 8, borderRadius: 4 },
  sensorStatNum: { color: COLORS.textPrimary, fontSize: 22, fontFamily: FONTS.bold },
  sensorStatLabel: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.regular },
  sensorSeparator: { width: 1, height: 40, backgroundColor: COLORS.border },
});
