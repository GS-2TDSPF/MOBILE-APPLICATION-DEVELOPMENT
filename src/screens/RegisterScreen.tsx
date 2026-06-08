import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, RADIUS } from '../utils/theme';

interface FormData {
  nome: string;
  email: string;
  municipio: string;
  cargo: string;
  senha: string;
  confirmarSenha: string;
}
interface FormErrors {
  nome?: string;
  email?: string;
  municipio?: string;
  cargo?: string;
  senha?: string;
  confirmarSenha?: string;
}

export default function RegisterScreen({ navigation }: any) {
  const [form, setForm] = useState<FormData>({
    nome: '', email: '', municipio: '', cargo: '', senha: '', confirmarSenha: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.nome.trim() || form.nome.trim().length < 3) e.nome = 'Nome deve ter ao menos 3 caracteres';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'E-mail inválido';
    if (!form.municipio.trim()) e.municipio = 'Informe o município';
    if (!form.cargo.trim()) e.cargo = 'Informe o cargo';
    if (form.senha.length < 6) e.senha = 'Senha deve ter ao menos 6 caracteres';
    if (form.senha !== form.confirmarSenha) e.confirmarSenha = 'As senhas não coincidem';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    try {
      setIsLoading(true);
      const existingRaw = await AsyncStorage.getItem('@orbit_users');
      const existingUsers: any[] = existingRaw ? JSON.parse(existingRaw) : [];
      if (existingUsers.some((u) => u.email.toLowerCase() === form.email.trim().toLowerCase())) {
        setErrors({ email: 'Este e-mail já está cadastrado' });
        return;
      }
      const novoUsuario = {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        municipio: form.municipio.trim(),
        cargo: form.cargo.trim(),
        senha: form.senha,
        criadoEm: new Date().toISOString(),
      };
      await AsyncStorage.setItem('@orbit_users', JSON.stringify([...existingUsers, novoUsuario]));
      Alert.alert(
        'Cadastro realizado!',
        `Bem-vindo(a), ${novoUsuario.nome}! Faça login para acessar.`,
        [{ text: 'Ir para Login', onPress: () => navigation.navigate('Login') }]
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível realizar o cadastro.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={18} color={COLORS.primary} />
            <Text style={styles.backBtnText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Acesso para gestores municipais</Text>
        </View>

        <View style={styles.card}>
          <Field label="NOME COMPLETO" icon="user" placeholder="Ex: João da Silva"
            value={form.nome} onChangeText={(v) => updateField('nome', v)} error={errors.nome} />
          <Field label="E-MAIL INSTITUCIONAL" icon="mail" placeholder="seu@municipio.gov.br"
            value={form.email} onChangeText={(v) => updateField('email', v)} error={errors.email}
            keyboardType="email-address" autoCapitalize="none" />
          <Field label="MUNICÍPIO" icon="map-pin" placeholder="Ex: São Paulo, SP"
            value={form.municipio} onChangeText={(v) => updateField('municipio', v)} error={errors.municipio} />
          <Field label="CARGO / FUNÇÃO" icon="briefcase" placeholder="Ex: Secretário de Defesa Civil"
            value={form.cargo} onChangeText={(v) => updateField('cargo', v)} error={errors.cargo} />

          {/* Senha */}
          <PasswordField
            label="SENHA" placeholder="Mínimo 6 caracteres"
            value={form.senha} onChangeText={(v) => updateField('senha', v)}
            show={showSenha} onToggle={() => setShowSenha(!showSenha)} error={errors.senha}
          />

          {/* Confirmar Senha */}
          <PasswordField
            label="CONFIRMAR SENHA" placeholder="Repita a senha"
            value={form.confirmarSenha} onChangeText={(v) => updateField('confirmarSenha', v)}
            show={showConfirmar} onToggle={() => setShowConfirmar(!showConfirmar)} error={errors.confirmarSenha}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister} disabled={isLoading} activeOpacity={0.85}
          >
            {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : (
              <Text style={styles.buttonText}>Criar conta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkText}>
              Já tem conta? <Text style={styles.loginHighlight}>Fazer login</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>OrbitAlert · FIAP Global Solution 2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, icon, placeholder, value, onChangeText, error, keyboardType = 'default', autoCapitalize = 'words' }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Feather name={icon} size={15} color={error ? COLORS.danger : COLORS.textMuted} />
        <TextInput
          style={styles.input} placeholder={placeholder}
          placeholderTextColor={COLORS.textDimmed} value={value}
          onChangeText={onChangeText} keyboardType={keyboardType}
          autoCapitalize={autoCapitalize} autoCorrect={false}
        />
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={11} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

function PasswordField({ label, placeholder, value, onChangeText, show, onToggle, error }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Feather name="lock" size={15} color={error ? COLORS.danger : COLORS.textMuted} />
        <TextInput
          style={styles.input} placeholder={placeholder}
          placeholderTextColor={COLORS.textDimmed} value={value}
          onChangeText={onChangeText} secureTextEntry={!show}
        />
        <TouchableOpacity onPress={onToggle}>
          <Feather name={show ? 'eye-off' : 'eye'} size={15} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={11} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 48 },
  header: { marginBottom: 28 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24, alignSelf: 'flex-start' },
  backBtnText: { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.semiBold },
  title: { color: COLORS.textPrimary, fontSize: 26, fontFamily: FONTS.extraBold, marginBottom: 4 },
  subtitle: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.regular },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 24,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: COLORS.textSecondary, fontSize: 10, fontFamily: FONTS.semiBold, letterSpacing: 0.8, marginBottom: 7 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgTertiary,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, gap: 12,
  },
  inputError: { borderColor: COLORS.danger },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.regular, paddingVertical: 13 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5, marginLeft: 2 },
  errorText: { color: COLORS.danger, fontSize: 11, fontFamily: FONTS.regular },
  button: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 15, fontFamily: FONTS.semiBold, letterSpacing: 0.3 },
  loginLink: { alignItems: 'center', marginTop: 20, paddingVertical: 6 },
  loginLinkText: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.regular },
  loginHighlight: { color: COLORS.primary, fontFamily: FONTS.semiBold },
  footer: { color: COLORS.border, fontSize: 11, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 28 },
});
