import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, RefreshControl, Share,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlertContext } from '../contexts/AlertContext';
import { AlertCard } from '../components/AlertCard';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { RiskLevel } from '../types/Alert';
import { RISK_COLORS, RISK_LABELS } from '../utils/riskColors';
import { COLORS, FONTS, RADIUS } from '../utils/theme';

type SortMode = 'recente' | 'nivel_asc' | 'nivel_desc';
type TipoFilter = 'TODOS' | 'ENCHENTE' | 'DESLIZAMENTO' | 'SECA' | 'OUTROS';

const NIVEL_FILTERS: { label: string; value: RiskLevel | null }[] = [
  { label: 'Todos', value: null },
  { label: 'N1', value: 1 },
  { label: 'N2', value: 2 },
  { label: 'N3', value: 3 },
  { label: 'N4', value: 4 },
  { label: 'N5', value: 5 },
];

const TIPO_FILTERS: { label: string; value: TipoFilter; icon: string; lib: 'Feather' | 'MCI' }[] = [
  { label: 'Todos', value: 'TODOS', icon: 'list', lib: 'Feather' },
  { label: 'Enchente', value: 'ENCHENTE', icon: 'waves', lib: 'MCI' },
  { label: 'Deslizamento', value: 'DESLIZAMENTO', icon: 'landslide', lib: 'MCI' },
  { label: 'Seca', value: 'SECA', icon: 'weather-sunny-alert', lib: 'MCI' },
  { label: 'Outros', value: 'OUTROS', icon: 'alert-triangle', lib: 'Feather' },
];

const SORT_OPTIONS: { label: string; value: SortMode }[] = [
  { label: 'Mais recente', value: 'recente' },
  { label: 'Maior risco', value: 'nivel_desc' },
  { label: 'Menor risco', value: 'nivel_asc' },
];

export default function AlertsScreen({ navigation }: any) {
  const { alerts, isLoading, isRefreshing, refresh, lastUpdated } = useAlertContext();

  const [search, setSearch] = useState('');
  const [nivelFilter, setNivelFilter] = useState<RiskLevel | null>(null);
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('TODOS');
  const [sortMode, setSortMode] = useState<SortMode>('recente');
  const [showSort, setShowSort] = useState(false);
  const [showSoAtivos, setShowSoAtivos] = useState(false);

  const filtered = useMemo(() => {
    let list = [...alerts];

    if (showSoAtivos) list = list.filter((a) => a.ativo);
    if (nivelFilter !== null) list = list.filter((a) => a.nivel === nivelFilter);
    if (tipoFilter !== 'TODOS') list = list.filter((a) => a.tipoDesastre === tipoFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        a.titulo.toLowerCase().includes(q) ||
        a.municipio.toLowerCase().includes(q) ||
        a.estado.toLowerCase().includes(q) ||
        a.descricao.toLowerCase().includes(q)
      );
    }

    switch (sortMode) {
      case 'nivel_desc': list.sort((a, b) => b.nivel - a.nivel); break;
      case 'nivel_asc': list.sort((a, b) => a.nivel - b.nivel); break;
      default: list.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
    }

    return list;
  }, [alerts, search, nivelFilter, tipoFilter, sortMode, showSoAtivos]);

  // Estatísticas
  const ativos = alerts.filter((a) => a.ativo).length;
  const criticos = alerts.filter((a) => a.nivel >= 4).length;
  const hoje = alerts.filter((a) => {
    const d = new Date(a.dataHora);
    const now = new Date();
    return d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
  }).length;

  const hasActiveFilters = nivelFilter !== null || tipoFilter !== 'TODOS' || search.trim() || showSoAtivos;

  function clearFilters() {
    setNivelFilter(null);
    setTipoFilter('TODOS');
    setSearch('');
    setShowSoAtivos(false);
  }

  if (isLoading && alerts.length === 0) return <LoadingOverlay message="Carregando alertas..." />;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
      {/* Barra de busca */}}
      <View style={styles.searchRow}>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título, município..."
            placeholderTextColor={COLORS.textDimmed}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={15} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        {/* Ordenação */}
        <TouchableOpacity
          style={[styles.sortBtn, showSort && { borderColor: COLORS.primary }]}
          onPress={() => setShowSort(!showSort)}
        >
          <Feather name="sliders" size={16} color={showSort ? COLORS.primary : COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Dropdown ordenação */}
      {showSort && (
        <View style={styles.sortDropdown}>
          <Text style={styles.sortDropdownLabel}>ORDENAR POR</Text>
          {SORT_OPTIONS.map((o) => (
            <TouchableOpacity
              key={o.value}
              style={styles.sortOption}
              onPress={() => { setSortMode(o.value); setShowSort(false); }}
            >
              <Feather
                name={sortMode === o.value ? 'check-circle' : 'circle'}
                size={16}
                color={sortMode === o.value ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.sortOptionText, sortMode === o.value && { color: COLORS.primary }]}>
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Filtro por tipo de desastre */}
      <FlatList
        horizontal
        data={TIPO_FILTERS}
        keyExtractor={(i) => i.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tipoRow}
        renderItem={({ item }) => {
          const active = tipoFilter === item.value;
          return (
            <TouchableOpacity
              style={[styles.tipoChip, active && styles.tipoChipActive]}
              onPress={() => setTipoFilter(item.value)}
            >
              {item.lib === 'MCI'
                ? <MaterialCommunityIcons name={item.icon as any} size={14} color={active ? '#FFF' : COLORS.textMuted} />
                : <Feather name={item.icon as any} size={14} color={active ? '#FFF' : COLORS.textMuted} />
              }
              <Text style={[styles.tipoChipText, active && styles.tipoChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Filtro por nível + toggle ativos */}
      <View style={styles.filtersRow}>
        <Feather name="filter" size={13} color={COLORS.textMuted} style={{ marginTop: 1 }} />
        {NIVEL_FILTERS.map((f) => {
          const active = nivelFilter === f.value;
          const dotColor = f.value ? RISK_COLORS[f.value] : COLORS.primary;
          return (
            <TouchableOpacity
              key={String(f.value)}
              style={[styles.filterChip, active && { backgroundColor: dotColor, borderColor: dotColor }]}
              onPress={() => setNivelFilter(f.value)}
            >
              {f.value && !active && (
                <View style={[styles.filterDot, { backgroundColor: RISK_COLORS[f.value] }]} />
              )}
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.filterChip, showSoAtivos && { backgroundColor: COLORS.success, borderColor: COLORS.success }]}
          onPress={() => setShowSoAtivos(!showSoAtivos)}
        >
          <View style={[styles.filterDot, { backgroundColor: showSoAtivos ? '#FFF' : COLORS.success }]} />
          <Text style={[styles.filterChipText, showSoAtivos && styles.filterChipTextActive]}>Ativos</Text>
        </TouchableOpacity>
      </View>

      {/* Estatísticas rápidas */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.danger }]}>{criticos}</Text>
          <Text style={styles.statLabel}>Críticos</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.success }]}>{ativos}</Text>
          <Text style={styles.statLabel}>Ativos</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.info }]}>{hoje}</Text>
          <Text style={styles.statLabel}>Hoje</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.textPrimary }]}>{filtered.length}</Text>
          <Text style={styles.statLabel}>Filtrados</Text>
        </View>
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
            <Feather name="x-circle" size={13} color={COLORS.primary} />
            <Text style={styles.clearBtnText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

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
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={48} color={COLORS.textDimmed} />
            <Text style={styles.emptyTitle}>Nenhum alerta encontrado</Text>
            <Text style={styles.emptySubtitle}>
              {hasActiveFilters
                ? 'Tente remover os filtros aplicados.'
                : 'O sistema está monitorando normalmente.'}
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity style={styles.emptyBtn} onPress={clearFilters}>
                <Text style={styles.emptyBtnText}>Remover filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      </View>

      {/* FAB - Criar novo alerta */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AlertForm', {})}
      >
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary, paddingHorizontal: 16, paddingTop: 16 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'center' },
  searchWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    paddingHorizontal: 14, gap: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.regular, paddingVertical: 12 },
  sortBtn: {
    width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  sortDropdown: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 12, marginBottom: 12,
  },
  sortDropdownLabel: {
    color: COLORS.textMuted, fontSize: 10, fontFamily: FONTS.semiBold,
    letterSpacing: 0.8, marginBottom: 8,
  },
  sortOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  sortOptionText: { color: COLORS.textSecondary, fontSize: 14, fontFamily: FONTS.medium },
  tipoRow: { gap: 8, paddingBottom: 12, paddingRight: 4 },
  tipoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tipoChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tipoChipText: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.semiBold },
  tipoChipTextActive: { color: '#FFF' },
  filtersRow: {
    flexDirection: 'row', gap: 6, marginBottom: 12,
    flexWrap: 'wrap', alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterChipText: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.semiBold },
  filterChipTextActive: { color: '#FFF' },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    paddingVertical: 10, paddingHorizontal: 16,
    marginBottom: 14, borderWidth: 1, borderColor: COLORS.border, gap: 0,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontFamily: FONTS.bold },
  statLabel: { color: COLORS.textMuted, fontSize: 10, fontFamily: FONTS.regular, marginTop: 2 },
  statSep: { width: 1, height: 28, backgroundColor: COLORS.border },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 },
  clearBtnText: { color: COLORS.primary, fontSize: 11, fontFamily: FONTS.semiBold },
  list: { paddingBottom: 40 },
  empty: { alignItems: 'center', marginTop: 60, gap: 10, paddingHorizontal: 20 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 16, fontFamily: FONTS.semiBold },
  emptySubtitle: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.regular, textAlign: 'center' },
  emptyBtn: {
    marginTop: 8, backgroundColor: `${COLORS.primary}15`, borderRadius: RADIUS.md,
    paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: `${COLORS.primary}40`,
  },
  emptyBtnText: { color: COLORS.primary, fontSize: 13, fontFamily: FONTS.semiBold },
  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
  },
});
