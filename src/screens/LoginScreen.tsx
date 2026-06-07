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
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
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
    } catch (error: any) {
      Alert.alert(
        'Erro de acesso',
        error.response?.data?.message || 'Credenciais inválidas. Tente novamente.'
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>🛰️</Text>
          <Text style={styles.brand}>OrbitAlert</Text>
          <Text style={styles.subtitle}>Plataforma de Alertas por Satélite</Text>
        </View>

        {/* Card de Login */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar na plataforma</Text>
          <Text style={styles.cardSubtitle}>Acesso restrito a gestores municipais</Text>

          {/* Campo Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-mail institucional</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@municipio.gov.br"
                placeholderTextColor="#334155"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Campo Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Senha</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#334155"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showSenha}
              />
              <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
                <Text style={styles.inputIcon}>{showSenha ? '🙈' : '👁️'}</Text>
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
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dados fornecidos por ESA Copernicus · Sentinel-1
          </Text>
          <Text style={styles.footerVersion}>v1.0.0 · FIAP Global Solution 2026</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 60,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  icon: {
    fontSize: 52,
    marginBottom: 12,
  },
  brand: {
    color: '#F1F5F9',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#1A1F2E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  cardTitle: {
    color: '#F1F5F9',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#475569',
    fontSize: 13,
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1420',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 14,
    gap: 10,
  },
  inputIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 15,
    paddingVertical: 14,
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 36,
    gap: 4,
  },
  footerText: {
    color: '#334155',
    fontSize: 11,
  },
  footerVersion: {
    color: '#1E293B',
    fontSize: 10,
  },
});
