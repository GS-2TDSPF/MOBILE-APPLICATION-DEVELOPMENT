import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, RADIUS } from '../../utils/theme';

const STORAGE_KEY = '@orbit_notifications';

interface NotifSettings {
  alertasAtivos: boolean;
  nivel1: boolean;
  nivel2: boolean;
  nivel3: boolean;
  nivel4: boolean;
  nivel5: boolean;
  sons: boolean;
  vibrar: boolean;
  resumoDiario: boolean;
}

const DEFAULT_SETTINGS: NotifSettings = {
  alertasAtivos: true,
  nivel1: false,
  nivel2: false,
  nivel3: true,
  nivel4: true,
  nivel5: true,
  sons: true,
  vibrar: true,
  resumoDiario: true,
};

const NIVEL_COLORS = ['#22C55E', '#84CC16', '#F59E0B', '#EF4444', '#7C3AED'];

export default function NotificationsScreen({ navigation }: any) {
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      }
    } catch {
      // usa defaults
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSettings(updated: NotifSettings) {
    setSettings(updated);
    setIsSaving(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as configurações.');
    } finally {
      setIsSaving(false);
    }
  }

  function toggle(key: keyof NotifSettings) {
    saveSettings({ ...settings, [key]: !settings[key] });
  }

  async function testAlert() {
    if (!settings.alertasAtivos) {
      Alert.alert('Aviso', 'Os alertas estão totalmente desativados.');
      return;
    }

    if (settings.vibrar) {
      // Padrão de emergência: 3 pulsos curtos + 1 longo
      Vibration.vibrate([0, 300, 150, 300, 150, 800]);
    }

    Alert.alert(
      '🔔 Simulação de Alerta',
      `Configurações aplicadas:\n\n${settings.vibrar ? '✓' : '✗'} Vibração\n${settings.sons ? '✓ Som (requer app nativo)' : '✗ Som desativado'}\n\nTodos os alertas dos níveis ativos dispararão com essas configurações.`
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Alerta principal */}
      <View style={styles.section}>
        <View style={styles.card}>
          <SettingRow
            icon="bell"
            iconColor={COLORS.primary}
            title="Alertas ativos"
            subtitle="Receber notificações do sistema"
            value={settings.alertasAtivos}
            onToggle={() => toggle('alertasAtivos')}
          />
        </View>
      </View>

      {/* Som e vibração */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SOM E VIBRAÇÃO</Text>
        <View style={styles.card}>
          <SettingRow
            icon="volume-2"
            iconColor={COLORS.info}
            title="Sons de alerta"
            subtitle="Tocar som ao receber notificações"
            value={settings.sons}
            onToggle={() => toggle('sons')}
            disabled={!settings.alertasAtivos}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="smartphone"
            iconColor={COLORS.info}
            title="Vibração"
            subtitle="Vibrar ao receber alertas críticos"
            value={settings.vibrar}
            onToggle={() => toggle('vibrar')}
            disabled={!settings.alertasAtivos}
          />
        </View>
        
        {/* Botão Testar */}
        <TouchableOpacity
          style={[styles.testButton, !settings.alertasAtivos && { opacity: 0.5 }]}
          onPress={testAlert}
          disabled={!settings.alertasAtivos}
        >
          <Feather name="play-circle" size={16} color={COLORS.primaryLight} />
          <Text style={styles.testButtonText}>Testar Simulação de Alerta</Text>
        </TouchableOpacity>
      </View>

      {/* Filtro por nível */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>FILTRAR POR NÍVEL DE RISCO</Text>
        <Text style={styles.sectionHint}>
          Receba alertas apenas dos níveis selecionados
        </Text>
        <View style={styles.card}>
          {([1, 2, 3, 4, 5] as const).map((nivel, idx) => {
            const key = `nivel${nivel}` as keyof NotifSettings;
            const labels = ['Muito Baixo', 'Baixo', 'Moderado', 'Alto', 'Crítico'];
            return (
              <React.Fragment key={nivel}>
                <SettingRow
                  dot={NIVEL_COLORS[idx]}
                  title={`Nível ${nivel} — ${labels[idx]}`}
                  subtitle={idx < 2 ? 'Situação de atenção' : idx === 2 ? 'Monitoramento ativo' : 'Risco elevado'}
                  value={settings[key] as boolean}
                  onToggle={() => toggle(key)}
                  disabled={!settings.alertasAtivos}
                />
                {idx < 4 && <View style={styles.divider} />}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      {/* Resumo diário */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>RELATÓRIOS</Text>
        <View style={styles.card}>
          <SettingRow
            icon="bar-chart-2"
            iconColor={COLORS.success}
            title="Resumo diário"
            subtitle="Receber resumo dos alertas do dia"
            value={settings.resumoDiario}
            onToggle={() => toggle('resumoDiario')}
            disabled={!settings.alertasAtivos}
          />
        </View>
      </View>

      {isSaving && (
        <View style={styles.savingRow}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.savingText}>Salvando...</Text>
        </View>
      )}
    </ScrollView>
  );
}

interface SettingRowProps {
  icon?: string;
  dot?: string;
  iconColor?: string;
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function SettingRow({ icon, dot, iconColor, title, subtitle, value, onToggle, disabled }: SettingRowProps) {
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={styles.rowLeft}>
        {dot ? (
          <View style={[styles.dot, { backgroundColor: dot }]} />
        ) : (
          <View style={[styles.iconBox, { backgroundColor: `${iconColor}15` }]}>
            <Feather name={icon as any} size={16} color={iconColor} />
          </View>
        )}
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, disabled && styles.textDisabled]}>{title}</Text>
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: COLORS.border, true: `${COLORS.primary}80` }}
        thumbColor={value ? COLORS.primary : COLORS.textMuted}
        ios_backgroundColor={COLORS.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { padding: 20, paddingBottom: 48 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgPrimary },
  section: { marginBottom: 24 },
  sectionLabel: {
    color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.semiBold,
    letterSpacing: 0.8, marginBottom: 6, paddingHorizontal: 4,
  },
  sectionHint: {
    color: COLORS.textDimmed, fontSize: 12, fontFamily: FONTS.regular,
    marginBottom: 10, paddingHorizontal: 4,
  },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowDisabled: { opacity: 0.45 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: { width: 34, height: 34, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 12 },
  rowText: { flex: 1 },
  rowTitle: { color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.medium },
  textDisabled: { color: COLORS.textMuted },
  rowSubtitle: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.regular, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
  savingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  savingText: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.regular },
  testButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: `${COLORS.primary}20`, paddingVertical: 12, borderRadius: RADIUS.md,
    marginTop: 12, borderWidth: 1, borderColor: `${COLORS.primary}40`,
  },
  testButtonText: { color: COLORS.primaryLight, fontSize: 13, fontFamily: FONTS.semiBold },
});
