import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAlertContext } from '../contexts/AlertContext';
import { RISK_COLORS } from '../utils/riskColors';

// Mock de dados de sensores — substituir pela chamada da API quando disponível
const MOCK_SENSORS = [
  {
    id: 1,
    nome: 'Estação Serra da Cantareira',
    municipio: 'São Paulo, SP',
    temperatura: 22.4,
    umidade: 87,
    chuva: 12.5,
    status: 'ALERTA',
    lastUpdate: '2026-06-07T18:30:00',
  },
  {
    id: 2,
    nome: 'Estação Petrópolis Norte',
    municipio: 'Petrópolis, RJ',
    temperatura: 19.1,
    umidade: 92,
    chuva: 28.3,
    status: 'CRITICO',
    lastUpdate: '2026-06-07T18:25:00',
  },
  {
    id: 3,
    nome: 'Estação Blumenau Centro',
    municipio: 'Blumenau, SC',
    temperatura: 17.8,
    umidade: 76,
    chuva: 5.2,
    status: 'NORMAL',
    lastUpdate: '2026-06-07T18:28:00',
  },
];

const STATUS_COLORS: Record<string, string> = {
  NORMAL: '#22C55E',
  ALERTA: '#F59E0B',
  CRITICO: '#EF4444',
};

export default function SensorsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Estações IoT</Text>
        <View style={styles.espTag}>
          <Text style={styles.espTagText}>⚡ ESP32</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Monitoramento em campo via sensores DHT22 + pluviômetro
      </Text>

      {/* Cards das estações */}
      {MOCK_SENSORS.map((sensor) => {
        const statusColor = STATUS_COLORS[sensor.status] ?? '#64748B';
        return (
          <View key={sensor.id} style={[styles.card, { borderLeftColor: statusColor }]}>
            {/* Header do card */}
            <View style={styles.cardHeader}>
              <Text style={styles.sensorIcon}>📡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.sensorName}>{sensor.nome}</Text>
                <Text style={styles.sensorMunicipio}>{sensor.municipio}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22`, borderColor: statusColor }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{sensor.status}</Text>
              </View>
            </View>

            {/* Métricas */}
            <View style={styles.metricsRow}>
              <MetricBox icon="🌡️" label="Temp." value={`${sensor.temperatura}°C`} />
              <MetricBox icon="💧" label="Umidade" value={`${sensor.umidade}%`} />
              <MetricBox icon="🌧️" label="Chuva" value={`${sensor.chuva}mm`} />
            </View>

            <Text style={styles.lastUpdate}>
              Última atualização: {new Date(sensor.lastUpdate).toLocaleTimeString('pt-BR')}
            </Text>
          </View>
        );
      })}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ Sobre os sensores</Text>
        <Text style={styles.infoText}>
          As estações físicas ESP32 coletam dados de temperatura (DHT22), umidade do ar e
          precipitação pluviométrica a cada 30 segundos, reforçando o monitoramento
          satelital do Sentinel-1.
        </Text>
      </View>
    </ScrollView>
  );
}

function MetricBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F1A' },
  content: { padding: 20, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: { color: '#F1F5F9', fontSize: 22, fontWeight: '800' },
  espTag: {
    backgroundColor: '#1A1F2E',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  espTagText: { color: '#FCD34D', fontSize: 12, fontWeight: '600' },
  subtitle: { color: '#64748B', fontSize: 13, marginBottom: 24, lineHeight: 20 },
  card: {
    backgroundColor: '#1A1F2E',
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  sensorIcon: { fontSize: 28 },
  sensorName: { color: '#F1F5F9', fontSize: 14, fontWeight: '700' },
  sensorMunicipio: { color: '#64748B', fontSize: 12, marginTop: 2 },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#0F1420',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  metricIcon: { fontSize: 18, marginBottom: 4 },
  metricValue: { color: '#E2E8F0', fontSize: 15, fontWeight: '700' },
  metricLabel: { color: '#475569', fontSize: 10, marginTop: 2 },
  lastUpdate: { color: '#334155', fontSize: 11 },
  infoCard: {
    backgroundColor: '#1A1F2E',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: 8,
  },
  infoTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: { color: '#64748B', fontSize: 13, lineHeight: 22 },
});
