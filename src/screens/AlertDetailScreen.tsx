import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { alertService } from '../services/alertService';
import { Alert } from '../types/Alert';
import { RiskBadge } from '../components/RiskBadge';
import { RISK_COLORS } from '../utils/riskColors';
import { formatDateTime } from '../utils/dateFormatter';

export default function AlertDetailScreen({ route, navigation }: any) {
  const { alertId } = route.params;
  const [alert, setAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await alertService.getById(alertId);
        setAlert(data);
      } catch (err) {
        console.error('Erro ao carregar alerta:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [alertId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!alert) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Alerta não encontrado</Text>
      </View>
    );
  }

  const borderColor = RISK_COLORS[alert.nivel];

  const tipoIcon: Record<string, string> = {
    DESLIZAMENTO: '🏔️',
    ENCHENTE: '🌊',
    SECA: '🌵',
    OUTROS: '⚠️',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Banner de nível */}
      <View style={[styles.banner, { borderColor }]}>
        <Text style={styles.bannerIcon}>{tipoIcon[alert.tipoDesastre] ?? '⚠️'}</Text>
        <View style={{ flex: 1 }}>
          <RiskBadge level={alert.nivel} size="lg" />
          <Text style={[styles.bannerStatus, { color: alert.ativo ? '#22C55E' : '#64748B' }]}>
            {alert.ativo ? '● ALERTA ATIVO' : '○ Encerrado'}
          </Text>
        </View>
      </View>

      {/* Título */}
      <Text style={styles.titulo}>{alert.titulo}</Text>

      {/* Infos */}
      <View style={styles.infoGrid}>
        <InfoRow icon="📍" label="Município" value={`${alert.municipio}, ${alert.estado}`} />
        <InfoRow icon="📅" label="Data / Hora" value={formatDateTime(alert.dataHora)} />
        <InfoRow icon="🗂️" label="Tipo" value={alert.tipoDesastre} />
        <InfoRow
          icon="🌐"
          label="Coordenadas"
          value={`${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`}
        />
      </View>

      {/* Descrição */}
      <View style={styles.descCard}>
        <Text style={styles.descTitle}>📋 Descrição</Text>
        <Text style={styles.descText}>{alert.descricao}</Text>
      </View>

      {/* Botão voltar */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Voltar para alertas</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B0F1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#64748B',
    fontSize: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1A1F2E',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 20,
  },
  bannerIcon: {
    fontSize: 44,
  },
  bannerStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 8,
  },
  titulo: {
    color: '#F1F5F9',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    lineHeight: 30,
  },
  infoGrid: {
    backgroundColor: '#1A1F2E',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoIcon: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  descCard: {
    backgroundColor: '#1A1F2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 24,
  },
  descTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descText: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 24,
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  backBtnText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
});
