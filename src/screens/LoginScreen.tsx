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
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, FONTS, RADIUS } from '../utils/theme';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha e-mail e senha para continuar.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email.trim(), senha);
    } catch (apiError: any) {
      Alert.alert(
        'Erro de acesso',
        apiError.response?.data?.message || 'Credenciais inválidas. Tente novamente.'
      );
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
        {/* Logo */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Plataforma de Alertas por Satélite</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar na plataforma</Text>
          <Text style={styles.cardSubtitle}>Acesso restrito a gestores municipais</Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-MAIL INSTITUCIONAL</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={16} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="seu@municipio.gov.br"
                placeholderTextColor={COLORS.textDimmed}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SENHA</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={16} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textDimmed}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showSenha}
              />
              <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
                <Feather name={showSenha ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Acessar plataforma</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Cadastro */}
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Feather name="user-plus" size={16} color={COLORS.primaryLight} />
            <Text style={styles.registerBtnText}>Criar nova conta</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Dados: ESA Copernicus · Sentinel-1</Text>
          <Text style={styles.footerVersion}>v1.0.0 · FIAP Global Solution 2026</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 60,
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: 36, gap: 10 },
  logo: { width: 220, height: 80 },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: 28,
  },
  inputGroup: { marginBottom: 18 },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgTertiary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: FONTS.regular,
    paddingVertical: 14,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: {
    color: COLORS.textDimmed,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgTertiary,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  registerBtnText: {
    color: COLORS.primaryLight,
    fontSize: 15,
    fontFamily: FONTS.semiBold,
  },
  footer: { alignItems: 'center', marginTop: 36, gap: 4 },
  footerText: {
    color: COLORS.textDimmed,
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  footerVersion: {
    color: COLORS.border,
    fontSize: 10,
    fontFamily: FONTS.regular,
  },
});
