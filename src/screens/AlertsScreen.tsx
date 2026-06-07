import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useAlertContext } from '../contexts/AlertContext';
import { AlertCard } from '../components/AlertCard';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Alert, RiskLevel } from '../types/Alert';

const NIVEL_FILTERS: { label: string; value: RiskLevel | null }[] = [
  { label: 'Todos', value: null },
  { label: '🟢 N1', value: 1 },
  { label: '🟡 N2', value: 2 },
  { label: '🟠 N3', value: 3 },
  { label: '🔴 N4', value: 4 },
  { label: '🟣 N5', value: 5 },
];

export default function AlertsScreen({ navigation }: any) {
  const { alerts, isLoading, fetchAlerts } = useAlertContext();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [nivelFilter, setNivelFilter] = useState<RiskLevel | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  }

  const filtered = alerts.filter((a) => {
    const matchSearch =
      !search ||
      a.titulo.toLowerCase().includes(search.toLowerCase()) ||
      a.municipio.toLowerCase().includes(search.toLowerCase());
    const matchNivel = nivelFilter === null || a.nivel === nivelFilter;
    return matchSearch && matchNivel;
  });

  if (isLoading && alerts.length === 0) {
    return <LoadingOverlay message="Carregando alertas..." />;
  }

  return (
    <View style={styles.container}>
      {/* Barra de busca */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por município ou título..."
          placeholderTextColor="#334155"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filtro de nível */}
      <View style={styles.filtersRow}>
        {NIVEL_FILTERS.map((f) => (
          <TouchableOpacity
            key={String(f.value)}
            style={[
              styles.filterChip,
              nivelFilter === f.value && styles.filterChipActive,
            ]}
            onPress={() => setNivelFilter(f.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                nivelFilter === f.value && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contador */}
      <Text style={styles.count}>
        {filtered.length} {filtered.length === 1 ? 'alerta' : 'alertas'} encontrado
        {filtered.length !== 1 ? 's' : ''}
      </Text>

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <AlertCard
            alert={item}
            onPress={(a) => navigation.navigate('AlertDetail', { alertId: a.id })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyText}>Nenhum alerta encontrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F2E',
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 14,
    paddingVertical: 13,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#1A1F2E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterChipText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  count: {
    color: '#475569',
    fontSize: 12,
    marginBottom: 12,
  },
  list: {
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    color: '#475569',
    fontSize: 15,
  },
});
