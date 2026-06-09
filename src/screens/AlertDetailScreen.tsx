import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Platform, Share, Alert as RNAlert, ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlertContext } from '../contexts/AlertContext';
import { alertService } from '../services/alertService';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { timeAgo, formatFullDate } from '../utils/dateFormatter';
import { RISK_COLORS, RISK_LABELS } from '../utils/riskColors';
import { COLORS, FONTS, RADIUS } from '../utils/theme';
import { Alert } from '../types/Alert';

const TIPO_INFO: Record<string, { label: string; icon: string; lib: 'Feather' | 'MCI'; desc: string }> = {
  ENCHENTE: {
    label: 'Enchente / Inundação',
    icon: 'waves', lib: 'MCI',
    desc: 'Transbordamento de rios ou acúmulo de água em áreas urbanas devido a chuvas intensas.',
  },
  DESLIZAMENTO: {
    label: 'Deslizamento de Terra',
    icon: 'landslide', lib: 'MCI',
    desc: 'Movimentação de massa de solo ou rocha em encostas, frequentemente associada a chuvas.',
  },
  SECA: {
    label: 'Seca / Estiagem',
    icon: 'weather-sunny-alert', lib: 'MCI',
    desc: 'Período prolongado sem chuvas causando déficit hídrico em reservatórios e lavouras.',
  },
  OUTROS: {
    label: 'Ocorrência Diversa',
    icon: 'alert-triangle', lib: 'Feather',
    desc: 'Evento climático ou geológico não classificado nas categorias principais.',
  },
};

const RISK_ACTIONS: Record<number, string[]> = {
  1: ['Monitoramento preventivo', 'Sem ação imediata necessária'],
  2: ['Alertar equipes de campo', 'Verificar pluviômetros locais'],
  3: ['Acionar Defesa Civil municipal', 'Verificar abrigos disponíveis', 'Emitir comunicado à população'],
  4: ['Evacuar áreas de risco', 'Acionar plano de resposta de emergência', 'Bloquear vias de acesso', 'Contatar CEMADEN'],
  5: ['EMERGÊNCIA ATIVA — Evacuar imediatamente', 'Acionar todas as equipes', 'Solicitar apoio estadual/federal', 'Interditar região afetada'],
};

export default function AlertDetailScreen({ route, navigation }: any) {
  const { alertId } = route.params;
  const { alerts, isLoading, refresh } = useAlertContext();
  const alert = alerts.find((a) => a.id === alertId);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function handleDelete() {
    RNAlert.alert(
      'Excluir Alerta',
      `Tem certeza que deseja excluir "${alert?.titulo}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await alertService.delete(alertId);
              await refresh();
              RNAlert.alert('✅ Excluído', 'Alerta removido com sucesso.');
              navigation.goBack();
            } catch (err: any) {
              RNAlert.alert('❌ Erro', err?.response?.data?.message ?? 'Não foi possível excluir.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }

  if (isLoading && !alert) return <LoadingOverlay message="Carregando detalhes..." />;
  if (!alert) {
    return (
      <View style={styles.notFound}>
        <Feather name="alert-circle" size={48} color={COLORS.textMuted} />
        <Text style={styles.notFoundText}>Alerta não encontrado</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const riskColor = RISK_COLORS[alert.nivel];
  const tipoInfo = TIPO_INFO[alert.tipoDesastre] ?? TIPO_INFO.OUTROS;
  const acoes = RISK_ACTIONS[alert.nivel] ?? [];

  function handleOpenMap() {
    const label = encodeURIComponent(`${alert.municipio}, ${alert.estado}`);
    const lat = alert.latitude;
    const lng = alert.longitude;
    const url = Platform.select({
      ios: `maps://?q=${label}&ll=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${label}`,
    }) ?? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`)
    );
  }

  async function handleShare() {
    try {
      const nivelLabel = RISK_LABELS[alert.nivel] ?? `Nível ${alert.nivel}`;
      await Share.share({
        title: `OrbitAlert — ${alert.titulo}`,
        message:
          `🚨 *${alert.titulo}*\n\n` +
          `📍 ${alert.municipio}, ${alert.estado}\n` +
          `⚠️ Risco: ${nivelLabel} (Nível ${alert.nivel}/5)\n` +
          `🌊 Tipo: ${tipoInfo.label}\n` +
          `📅 ${formatFullDate(alert.dataHora)}\n\n` +
          `${alert.descricao}\n\n` +
          `— Plataforma OrbitAlert | ESA Copernicus Sentinel-1`,
      });
    } catch {}
  }

  function handleOpenCEMADEN() {
    Linking.openURL('https://www.cemaden.gov.br').catch(() => {});
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ─── Banner de risco ────────────────────── */}
      <View style={[styles.riskBanner, { borderColor: `${riskColor}40`, backgroundColor: `${riskColor}10` }]}>
        <View style={styles.riskBannerLeft}>
          <RiskBadge level={alert.nivel} size="lg" />
          <View>
            <Text style={[styles.riskLabel, { color: riskColor }]}>
              {RISK_LABELS[alert.nivel] ?? 'Risco'}
            </Text>
            <Text style={styles.riskSub}>Nível {alert.nivel} de 5</Text>
          </View>
        </View>
        {alert.ativo && (
          <View style={styles.activeTag}>
            <View style={styles.activePulse} />
            <Text style={styles.activeText}>Ativo</Text>
          </View>
        )}
      </View>

      {/* ─── Informações principais ─────────────── */}
      <View style={styles.card}>
        <Text style={styles.title}>{alert.titulo}</Text>

        <View style={styles.infoRow}>
          <Feather name="map-pin" size={15} color={COLORS.primaryLight} />
          <Text style={styles.infoText}>{alert.municipio}, {alert.estado}</Text>
        </View>

        <View style={styles.infoRow}>
          <Feather name="clock" size={15} color={COLORS.textMuted} />
          <Text style={styles.infoText}>{formatFullDate(alert.dataHora)}</Text>
          <Text style={styles.infoMuted}>· {timeAgo(alert.dataHora)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Feather name="navigation" size={15} color={COLORS.textMuted} />
          <Text style={styles.coordText}>
            {alert.latitude?.toFixed(5)}, {alert.longitude?.toFixed(5)}
          </Text>
        </View>
      </View>

      {/* ─── Tipo de desastre ───────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>TIPO DE OCORRÊNCIA</Text>
        <View style={styles.card}>
          <View style={styles.tipoHeader}>
            <View style={[styles.tipoIconBox, { backgroundColor: `${riskColor}15` }]}>
              {tipoInfo.lib === 'MCI'
                ? <MaterialCommunityIcons name={tipoInfo.icon as any} size={28} color={riskColor} />
                : <Feather name={tipoInfo.icon as any} size={24} color={riskColor} />
              }
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipoLabel}>{tipoInfo.label}</Text>
              <Text style={styles.tipoDesc}>{tipoInfo.desc}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ─── Descrição ──────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>DESCRIÇÃO DA OCORRÊNCIA</Text>
        <View style={styles.card}>
          <Text style={styles.description}>{alert.descricao}</Text>
        </View>
      </View>

      {/* ─── Ações recomendadas ─────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>AÇÕES RECOMENDADAS</Text>
        <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: riskColor }]}>
          {acoes.map((acao, idx) => (
            <View key={idx} style={styles.acaoRow}>
              <View style={[styles.acaoDot, { backgroundColor: riskColor }]} />
              <Text style={[styles.acaoText, alert.nivel >= 5 && { color: COLORS.danger, fontFamily: FONTS.semiBold }]}>
                {acao}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ─── Detalhes técnicos ──────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>DADOS TÉCNICOS</Text>
        <View style={styles.card}>
          <DetailRow label="ID do alerta" value={`#${alert.id}`} />
          <View style={styles.divider} />
          <DetailRow label="Tipo de desastre" value={alert.tipoDesastre} />
          <View style={styles.divider} />
          <DetailRow label="Status" value={alert.ativo ? 'Ativo' : 'Encerrado'} valueColor={alert.ativo ? COLORS.success : COLORS.textMuted} />
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fonte de dados</Text>
            <TouchableOpacity style={styles.sourceTag} onPress={handleOpenCEMADEN}>
              <MaterialCommunityIcons name="satellite-variant" size={13} color={COLORS.primary} />
              <Text style={styles.sourceText}>ESA Sentinel-1 / CEMADEN</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <DetailRow
            label="Coordenadas"
            value={`${alert.latitude?.toFixed(6)}° / ${alert.longitude?.toFixed(6)}°`}
          />
        </View>
      </View>

      {/* ─── Ações ──────────────────────────────── */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: riskColor }]} onPress={handleOpenMap}>
          <Feather name="map-pin" size={18} color="#FFF" />
          <Text style={styles.btnPrimaryText}>Abrir no Mapa</Text>
        </TouchableOpacity>
        <View style={styles.rowActions}>
          <TouchableOpacity style={styles.btnEdit} onPress={() => navigation.navigate('AlertForm', { alert })}>
            <Feather name="edit-2" size={16} color={COLORS.primary} />
            <Text style={styles.btnEditText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnDelete, isDeleting && { opacity: 0.6 }]}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting
              ? <ActivityIndicator size="small" color={COLORS.danger} />
              : <Feather name="trash-2" size={16} color={COLORS.danger} />
            }
            <Text style={styles.btnDeleteText}>Excluir</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleShare}>
          <Feather name="share-2" size={18} color={COLORS.primary} />
          <Text style={styles.btnSecondaryText}>Compartilhar Alerta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnGhost} onPress={handleOpenCEMADEN}>
          <Feather name="external-link" size={16} color={COLORS.textMuted} />
          <Text style={styles.btnGhostText}>Portal CEMADEN</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { padding: 20, paddingBottom: 48 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: COLORS.bgPrimary },
  notFoundText: { color: COLORS.textMuted, fontSize: 16, fontFamily: FONTS.medium },
  backBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10 },
  backBtnText: { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.semiBold },

  riskBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: RADIUS.lg, borderWidth: 1, padding: 16, marginBottom: 16,
  },
  riskBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  riskLabel: { fontSize: 16, fontFamily: FONTS.bold },
  riskSub: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.regular },
  activeTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${COLORS.success}20`, paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: `${COLORS.success}40`,
  },
  activePulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success },
  activeText: { color: COLORS.success, fontSize: 12, fontFamily: FONTS.semiBold },

  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: 18, borderWidth: 1, borderColor: COLORS.border,
  },
  title: { color: COLORS.textPrimary, fontSize: 20, fontFamily: FONTS.bold, marginBottom: 14, lineHeight: 28 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  infoText: { color: COLORS.textSecondary, fontSize: 14, fontFamily: FONTS.medium, flex: 1 },
  infoMuted: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.regular },
  coordText: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.regular },

  section: { marginTop: 20 },
  sectionLabel: {
    color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.semiBold,
    letterSpacing: 0.8, marginBottom: 10,
  },

  tipoHeader: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  tipoIconBox: {
    width: 50, height: 50, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  tipoLabel: { color: COLORS.textPrimary, fontSize: 15, fontFamily: FONTS.semiBold, marginBottom: 4 },
  tipoDesc: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.regular, lineHeight: 18 },

  description: { color: COLORS.textSecondary, fontSize: 14, fontFamily: FONTS.regular, lineHeight: 22 },

  acaoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  acaoDot: { width: 7, height: 7, borderRadius: 4, marginTop: 5 },
  acaoText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: FONTS.regular, flex: 1, lineHeight: 20 },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  detailLabel: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.regular },
  detailValue: { color: COLORS.textPrimary, fontSize: 13, fontFamily: FONTS.medium, maxWidth: '60%', textAlign: 'right' },
  sourceTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${COLORS.primary}15`, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  sourceText: { color: COLORS.primary, fontSize: 11, fontFamily: FONTS.semiBold },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },

  actions: { marginTop: 24, gap: 10 },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: RADIUS.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  btnPrimaryText: { color: '#FFF', fontSize: 15, fontFamily: FONTS.semiBold },
  btnSecondary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  btnSecondaryText: { color: COLORS.primary, fontSize: 15, fontFamily: FONTS.semiBold },
  btnGhost: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  btnGhostText: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.medium },
  rowActions: { flexDirection: 'row', gap: 10 },
  btnEdit: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}10`,
  },
  btnEditText: { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.semiBold },
  btnDelete: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.danger, backgroundColor: `${COLORS.danger}10`,
  },
  btnDeleteText: { color: COLORS.danger, fontSize: 14, fontFamily: FONTS.semiBold },
});
