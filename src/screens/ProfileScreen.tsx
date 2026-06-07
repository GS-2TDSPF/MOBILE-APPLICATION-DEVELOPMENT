import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAlertContext } from '../contexts/AlertContext';
import { RISK_COLORS, RISK_LABELS } from '../utils/riskColors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { alerts } = useAlertContext();

  const totalAlertas = alerts.length;
  const alertasCriticos = alerts.filter((a) => a.nivel >= 4).length;
  const alertasAtivos = alerts.filter((a) => a.ativo).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.nome ? user.nome.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.nome ?? '—'}</Text>
        <Text style={styles.email}>{user?.email ?? '—'}</Text>
        {user?.municipio && (
          <View style={styles.municipioTag}>
            <Text style={styles.municipioText}>📍 {user.municipio}</Text>
          </View>
        )}
      </View>

      {/* Estatísticas */}
      <View style={styles.statsRow}>
        <StatCard label="Total" value={totalAlertas} icon="📋" />
        <StatCard label="Ativos" value={alertasAtivos} icon="🟢" />
        <StatCard label="Críticos" value={alertasCriticos} icon="🔴" />
      </View>

      {/* Seção: Legenda de risco */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Tabela de Riscos</Text>
        {([1, 2, 3, 4, 5] as const).map((nivel) => (
          <View key={nivel} style={styles.riskRow}>
            <View
              style={[
                styles.riskDot,
                { backgroundColor: RISK_COLORS[nivel] },
              ]}
            />
            <Text style={styles.riskLabel}>
              Nível {nivel} — {RISK_LABELS[nivel]}
            </Text>
          </View>
        ))}
      </View>

      {/* Seção: Sobre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Sobre o OrbitAlert</Text>
        <Text style={styles.aboutText}>
          Plataforma de alertas de desastres naturais baseada em dados de satélite
          Sentinel-1 (ESA/Copernicus) e Inteligência Artificial.
        </Text>
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => Linking.openURL('https://java-advanced-2-7tix.onrender.com')}
        >
          <Text style={styles.linkBtnText}>🌐 API Documentation</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      <Text style={styles.version}>OrbitAlert v1.0.0 · FIAP GS 2026</Text>
    </ScrollView>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F1A' },
  content: { padding: 20, paddingBottom: 60, alignItems: 'center' },
  avatarContainer: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarText: { color: '#FFF', fontSize: 38, fontWeight: '800' },
  name: { color: '#F1F5F9', fontSize: 22, fontWeight: '700' },
  email: { color: '#64748B', fontSize: 13, marginTop: 4 },
  municipioTag: {
    backgroundColor: '#1A1F2E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  municipioText: { color: '#94A3B8', fontSize: 13 },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1F2E',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { color: '#F1F5F9', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#64748B', fontSize: 11, marginTop: 2 },
  section: {
    backgroundColor: '#1A1F2E',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  riskRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  riskDot: { width: 12, height: 12, borderRadius: 6 },
  riskLabel: { color: '#CBD5E1', fontSize: 14 },
  aboutText: { color: '#94A3B8', fontSize: 14, lineHeight: 22, marginBottom: 14 },
  linkBtn: {
    backgroundColor: '#0F1420',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#6366F1',
    alignSelf: 'flex-start',
  },
  linkBtnText: { color: '#A5B4FC', fontSize: 13, fontWeight: '600' },
  logoutBtn: {
    backgroundColor: '#1A1F2E',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
  version: { color: '#1E293B', fontSize: 11 },
});
