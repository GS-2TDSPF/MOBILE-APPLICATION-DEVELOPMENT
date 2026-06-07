import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useAlertContext } from '../contexts/AlertContext';
import { useAuth } from '../contexts/AuthContext';
import { AlertCard } from '../components/AlertCard';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Alert } from '../types/Alert';
import { RISK_COLORS } from '../utils/riskColors';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }: any) {
  const { alerts, isLoading, fetchAtivos } = useAlertContext();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAtivos();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await fetchAtivos();
    setRefreshing(false);
  }

  function handleAlertPress(alert: Alert) {
    navigation.navigate('AlertDetail', { alertId: alert.id });
  }

  // Contagem por nível
  const counts = [1, 2, 3, 4, 5].map((nivel) => ({
    nivel,
    count: alerts.filter((a) => a.nivel === nivel).length,
  }));

  const alertasCriticos = alerts.filter((a) => a.nivel >= 4);

  if (isLoading && alerts.length === 0) {
    return <LoadingOverlay message="Buscando alertas ativos..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.nome?.split(' ')[0] ?? 'Gestor'} 👋</Text>
          <Text style={styles.headerSub}>
            {alerts.length} {alerts.length === 1 ? 'alerta ativo' : 'alertas ativos'}
          </Text>
        </View>
        <View style={styles.satelliteTag}>
          <Text style={styles.satelliteText}>🛰️ Sentinel-1</Text>
        </View>
      </View>

      {/* Cards de contagem por nível */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.countsRow}
      >
        {counts.map(({ nivel, count }) => (
          <View
            key={nivel}
            style={[styles.countCard, { borderColor: RISK_COLORS[nivel as 1 | 2 | 3 | 4 | 5] }]}
          >
            <Text
              style={[styles.countNumber, { color: RISK_COLORS[nivel as 1 | 2 | 3 | 4 | 5] }]}
            >
              {count}
            </Text>
            <Text style={styles.countLabel}>Nível {nivel}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Alertas Críticos */}
      {alertasCriticos.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔴 Alertas Críticos</Text>
            <Text style={styles.sectionCount}>{alertasCriticos.length}</Text>
          </View>
          {alertasCriticos.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onPress={handleAlertPress} />
          ))}
        </View>
      )}

      {/* Todos os alertas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Todos os Alertas</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Alertas')}>
            <Text style={styles.verTodos}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {alerts.slice(0, 5).map((alert) => (
          <AlertCard key={alert.id} alert={alert} onPress={handleAlertPress} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    color: '#F1F5F9',
    fontSize: 22,
    fontWeight: '700',
  },
  headerSub: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  satelliteTag: {
    backgroundColor: '#1A1F2E',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  satelliteText: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '600',
  },
  countsRow: {
    gap: 12,
    paddingBottom: 4,
    marginBottom: 24,
  },
  countCard: {
    backgroundColor: '#1A1F2E',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  countNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  countLabel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionCount: {
    backgroundColor: '#EF4444',
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verTodos: {
    color: '#6366F1',
    fontSize: 13,
    fontWeight: '600',
  },
});
