import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert as RNAlert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { alertService } from '../services/alertService';
import { useAlertContext } from '../contexts/AlertContext';
import { Alert, RiskLevel } from '../types/Alert';
import { RISK_COLORS, RISK_LABELS } from '../utils/riskColors';
import { COLORS, FONTS, RADIUS } from '../utils/theme';

type TipoDesastre = 'ENCHENTE' | 'DESLIZAMENTO' | 'SECA' | 'OUTROS';

const TIPOS: { value: TipoDesastre; label: string; icon: string; lib: 'F' | 'M' }[] = [
  { value: 'ENCHENTE',     label: 'Enchente',     icon: 'waves',               lib: 'M' },
  { value: 'DESLIZAMENTO', label: 'Deslizamento', icon: 'landslide',           lib: 'M' },
  { value: 'SECA',         label: 'Seca',         icon: 'weather-sunny-alert', lib: 'M' },
  { value: 'OUTROS',       label: 'Outros',       icon: 'alert-triangle',      lib: 'F' },
];

const NIVEIS: { value: RiskLevel; label: string }[] = [
  { value: 1, label: 'N1 — Baixo' },
  { value: 2, label: 'N2 — Atenção' },
  { value: 3, label: 'N3 — Moderado' },
  { value: 4, label: 'N4 — Alto' },
  { value: 5, label: 'N5 — Crítico' },
];

interface Props {
  navigation: any;
  route: any;
}

export default function AlertFormScreen({ navigation, route }: Props) {
  const alertToEdit: Alert | undefined = route.params?.alert;
  const isEditing = !!alertToEdit;

  const { refresh } = useAlertContext();

  const [titulo, setTitulo] = useState(alertToEdit?.titulo ?? '');
  const [descricao, setDescricao] = useState(alertToEdit?.descricao ?? '');
  const [municipio, setMunicipio] = useState(alertToEdit?.municipio ?? '');
  const [estado, setEstado] = useState(alertToEdit?.estado ?? '');
  const [latitude, setLatitude] = useState(String(alertToEdit?.latitude ?? ''));
  const [longitude, setLongitude] = useState(String(alertToEdit?.longitude ?? ''));
  const [nivel, setNivel] = useState<RiskLevel>(alertToEdit?.nivel ?? 3);
  const [tipo, setTipo] = useState<TipoDesastre>(alertToEdit?.tipoDesastre ?? 'ENCHENTE');
  const [ativo, setAtivo] = useState(alertToEdit?.ativo ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Editar Alerta' : 'Novo Alerta' });
  }, []);

  function normalize(val: string): string {
    // aceita vírgula (padrão BR) e converte para ponto (padrão JS)
    return val.trim().replace(',', '.');
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!titulo.trim()) e.titulo = 'Título é obrigatório';
    if (!descricao.trim()) e.descricao = 'Descrição é obrigatória';
    if (!municipio.trim()) e.municipio = 'Município é obrigatório';
    if (!estado.trim() || estado.length !== 2) e.estado = 'Informe a UF (ex: SP)';
    const latNum = Number(normalize(latitude));
    const lonNum = Number(normalize(longitude));
    if (!latitude.trim() || isNaN(latNum) || latNum < -90  || latNum > 90)  e.latitude  = 'Inválida. Ex: -23.5505';
    if (!longitude.trim() || isNaN(lonNum) || lonNum < -180 || lonNum > 180) e.longitude = 'Inválida. Ex: -46.6333';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        municipio: municipio.trim(),
        estado: estado.trim().toUpperCase(),
        latitude: Number(normalize(latitude)),
        longitude: Number(normalize(longitude)),
        nivel,
        tipoDesastre: tipo,
        ativo,
        dataHora: alertToEdit?.dataHora ?? new Date().toISOString(),
      };

      if (isEditing) {
        await alertService.update(alertToEdit!.id, payload);
        RNAlert.alert('✅ Alerta atualizado', 'As informações foram salvas com sucesso.');
      } else {
        await alertService.create(payload);
        RNAlert.alert('✅ Alerta criado', 'O novo alerta foi registrado com sucesso.');
      }

      await refresh();
      navigation.goBack();
    } catch (err: any) {
      const status = err?.response?.status;
      let msg = err?.response?.data?.message ?? err?.message ?? 'Erro desconhecido';

      if (status === 403 || status === 401) {
        msg = 'Sem autorização. Faça logout e login novamente para obter um token válido da API.';
      } else if (status === 400) {
        msg = 'Dados inválidos. Verifique os campos e tente novamente.';
      } else if (!status) {
        msg = 'Sem conexão com o servidor. Verifique sua internet.';
      }

      RNAlert.alert('❌ Erro ao salvar', msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Nível de risco */}
        <Text style={styles.label}>NÍVEL DE RISCO</Text>
        <View style={styles.nivelRow}>
          {NIVEIS.map((n) => {
            const active = nivel === n.value;
            const c = RISK_COLORS[n.value];
            return (
              <TouchableOpacity
                key={n.value}
                style={[styles.nivelChip, { borderColor: c }, active && { backgroundColor: c }]}
                onPress={() => setNivel(n.value)}
              >
                <Text style={[styles.nivelChipText, { color: active ? '#FFF' : c }]}>{n.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tipo */}
        <Text style={styles.label}>TIPO DE DESASTRE</Text>
        <View style={styles.tipoRow}>
          {TIPOS.map((t) => {
            const active = tipo === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                style={[styles.tipoChip, active && styles.tipoChipActive]}
                onPress={() => setTipo(t.value)}
              >
                {t.lib === 'M'
                  ? <MaterialCommunityIcons name={t.icon as any} size={16} color={active ? '#FFF' : COLORS.textMuted} />
                  : <Feather name={t.icon as any} size={15} color={active ? '#FFF' : COLORS.textMuted} />
                }
                <Text style={[styles.tipoChipText, active && { color: '#FFF' }]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Título */}
        <Field label="TÍTULO DO ALERTA *" error={errors.titulo}>
          <Input
            placeholder="Ex: Enchente no rio Tietê — Zona Norte"
            value={titulo}
            onChangeText={setTitulo}
            icon="type"
          />
        </Field>

        {/* Descrição */}
        <Field label="DESCRIÇÃO *" error={errors.descricao}>
          <TextInput
            style={[styles.textarea, errors.descricao && styles.inputError]}
            placeholder="Descreva a ocorrência com detalhes..."
            placeholderTextColor={COLORS.textDimmed}
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Field>

        {/* Localização */}
        <Text style={styles.label}>LOCALIZAÇÃO *</Text>
        <View style={styles.row2}>
          <View style={{ flex: 2 }}>
            <Field label="MUNICÍPIO" error={errors.municipio}>
              <Input
                placeholder="Ex: São Paulo"
                value={municipio}
                onChangeText={setMunicipio}
                icon="map-pin"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="UF" error={errors.estado}>
              <Input
                placeholder="SP"
                value={estado}
                onChangeText={(v: string) => setEstado(v.toUpperCase())}
                icon="flag"
                maxLength={2}
              />
            </Field>
          </View>
        </View>

        {/* Coordenadas */}
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Field label="LATITUDE" error={errors.latitude}>
              <Input
                placeholder="Ex: -23.5505"
                value={latitude}
                onChangeText={setLatitude}
                icon="navigation"
                keyboardType="default"
                hint="Use ponto ou vírgula"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="LONGITUDE" error={errors.longitude}>
              <Input
                placeholder="Ex: -46.6333"
                value={longitude}
                onChangeText={setLongitude}
                icon="navigation"
                keyboardType="default"
                hint="Use ponto ou vírgula"
              />
            </Field>
          </View>
        </View>

        {/* Status */}
        <Text style={styles.label}>STATUS</Text>
        <View style={styles.statusRow}>
          <TouchableOpacity
            style={[styles.statusBtn, ativo && styles.statusBtnActive]}
            onPress={() => setAtivo(true)}
          >
            <View style={[styles.statusDot, { backgroundColor: ativo ? COLORS.success : COLORS.textMuted }]} />
            <Text style={[styles.statusBtnText, ativo && { color: COLORS.success }]}>Ativo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusBtn, !ativo && { borderColor: COLORS.textMuted, backgroundColor: `${COLORS.textMuted}10` }]}
            onPress={() => setAtivo(false)}
          >
            <View style={[styles.statusDot, { backgroundColor: !ativo ? COLORS.textMuted : COLORS.border }]} />
            <Text style={[styles.statusBtnText, !ativo && { color: COLORS.textMuted }]}>Encerrado</Text>
          </TouchableOpacity>
        </View>

        {/* Botão salvar */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: RISK_COLORS[nivel] }, isLoading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading
            ? <ActivityIndicator size="small" color="#FFF" />
            : <>
                <Feather name={isEditing ? 'save' : 'plus-circle'} size={18} color="#FFF" />
                <Text style={styles.submitBtnText}>{isEditing ? 'Salvar Alterações' : 'Registrar Alerta'}</Text>
              </>
          }
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Sub-components ──────────────────────────────────────

function Field({ label, error, children }: { label?: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      {children}
      {error && (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={12} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

function Input({ placeholder, value, onChangeText, icon, keyboardType, maxLength }: any) {
  return (
    <View style={styles.inputWrapper}>
      <Feather name={icon} size={15} color={COLORS.textMuted} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textDimmed}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={maxLength}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 0 },
  label: {
    color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.semiBold,
    letterSpacing: 0.8, marginBottom: 10, marginTop: 20,
  },
  nivelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  nivelChip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: RADIUS.full, borderWidth: 1.5,
  },
  nivelChipText: { fontSize: 12, fontFamily: FONTS.semiBold },
  tipoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tipoChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tipoChipText: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.semiBold },
  field: { marginTop: 16 },
  fieldLabel: {
    color: COLORS.textMuted, fontSize: 10, fontFamily: FONTS.semiBold,
    letterSpacing: 0.8, marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14,
  },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.regular, paddingVertical: 13 },
  inputError: { borderColor: COLORS.danger },
  textarea: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.regular,
    padding: 14, minHeight: 100,
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  errorText: { color: COLORS.danger, fontSize: 11, fontFamily: FONTS.regular },
  row2: { flexDirection: 'row', gap: 12 },
  statusRow: { flexDirection: 'row', gap: 12 },
  statusBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: `${COLORS.success}10`, borderRadius: RADIUS.md,
    paddingVertical: 12, borderWidth: 1, borderColor: COLORS.success,
  },
  statusBtnActive: { backgroundColor: `${COLORS.success}15` },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusBtnText: { fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.textMuted },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16, borderRadius: RADIUS.md, marginTop: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  submitBtnText: { color: '#FFF', fontSize: 15, fontFamily: FONTS.bold },
  cancelBtn: { alignItems: 'center', paddingVertical: 16 },
  cancelBtnText: { color: COLORS.textMuted, fontSize: 14, fontFamily: FONTS.regular },
});
