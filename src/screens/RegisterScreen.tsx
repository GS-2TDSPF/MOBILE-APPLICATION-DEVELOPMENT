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
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    nome: '',
    email: '',
    municipio: '',
    cargo: '',
    senha: '',
    confirmarSenha: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Limpa o erro do campo ao digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.nome.trim() || form.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter ao menos 3 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      newErrors.email = 'E-mail inválido';
    }

    if (!form.municipio.trim()) {
      newErrors.municipio = 'Informe o município';
    }

    if (!form.cargo.trim()) {
      newErrors.cargo = 'Informe o cargo';
    }

    if (form.senha.length < 6) {
      newErrors.senha = 'Senha deve ter ao menos 6 caracteres';
    }

    if (form.senha !== form.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;

    try {
      setIsLoading(true);

      // Verifica se e-mail já está cadastrado
      const existingRaw = await AsyncStorage.getItem('@orbit_users');
      const existingUsers: Omit<FormData, 'confirmarSenha'>[] = existingRaw
        ? JSON.parse(existingRaw)
        : [];

      const emailJaCadastrado = existingUsers.some(
        (u) => u.email.toLowerCase() === form.email.trim().toLowerCase()
      );

      if (emailJaCadastrado) {
        setErrors({ email: 'Este e-mail já está cadastrado' });
        return;
      }

      // Salva novo usuário (sem o campo confirmarSenha)
      const novoUsuario = {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        municipio: form.municipio.trim(),
        cargo: form.cargo.trim(),
        senha: form.senha,
        criadoEm: new Date().toISOString(),
      };

      const updatedUsers = [...existingUsers, novoUsuario];
      await AsyncStorage.setItem('@orbit_users', JSON.stringify(updatedUsers));

      Alert.alert(
        '✅ Cadastro realizado!',
        `Bem-vindo(a), ${novoUsuario.nome}! Faça login para acessar a plataforma.`,
        [{ text: 'Ir para Login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar o cadastro. Tente novamente.');
      console.error('Erro ao cadastrar:', error);
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
            <Text style={styles.backBtnText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.icon}>🛰️</Text>
          <Text style={styles.brand}>Criar conta</Text>
          <Text style={styles.subtitle}>Acesso para gestores municipais</Text>
        </View>

        {/* Card de Cadastro */}
        <View style={styles.card}>
          <InputField
            label="Nome completo"
            icon="👤"
            placeholder="Ex: João da Silva"
            value={form.nome}
            onChangeText={(v) => updateField('nome', v)}
            error={errors.nome}
          />

          <InputField
            label="E-mail institucional"
            icon="✉️"
            placeholder="seu@municipio.gov.br"
            value={form.email}
            onChangeText={(v) => updateField('email', v)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            label="Município"
            icon="📍"
            placeholder="Ex: São Paulo, SP"
            value={form.municipio}
            onChangeText={(v) => updateField('municipio', v)}
            error={errors.municipio}
          />

          <InputField
            label="Cargo / Função"
            icon="🏛️"
            placeholder="Ex: Secretário de Defesa Civil"
            value={form.cargo}
            onChangeText={(v) => updateField('cargo', v)}
            error={errors.cargo}
          />

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Senha</Text>
            <View style={[styles.inputWrapper, errors.senha ? styles.inputError : null]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#334155"
                value={form.senha}
                onChangeText={(v) => updateField('senha', v)}
                secureTextEntry={!showSenha}
              />
              <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
                <Text style={styles.inputIcon}>{showSenha ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
          </View>

          {/* Confirmar Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirmar senha</Text>
            <View style={[styles.inputWrapper, errors.confirmarSenha ? styles.inputError : null]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Repita a senha"
                placeholderTextColor="#334155"
                value={form.confirmarSenha}
                onChangeText={(v) => updateField('confirmarSenha', v)}
                secureTextEntry={!showConfirmar}
              />
              <TouchableOpacity onPress={() => setShowConfirmar(!showConfirmar)}>
                <Text style={styles.inputIcon}>{showConfirmar ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.confirmarSenha && (
              <Text style={styles.errorText}>{errors.confirmarSenha}</Text>
            )}
          </View>

          {/* Botão Cadastrar */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Criar conta</Text>
            )}
          </TouchableOpacity>

          {/* Link Login */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Já tem conta?{' '}
              <Text style={styles.loginLinkHighlight}>Fazer login</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>OrbitAlert · FIAP Global Solution 2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Componente reutilizável de campo
interface InputFieldProps {
  label: string;
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  keyboardType?: any;
  autoCapitalize?: any;
}

function InputField({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  error,
  keyboardType = 'default',
  autoCapitalize = 'words',
}: InputFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#334155"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
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
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 4,
  },
  backBtnText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  icon: {
    fontSize: 44,
    marginBottom: 10,
  },
  brand: {
    color: '#F1F5F9',
    fontSize: 28,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 7,
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
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 14,
    paddingVertical: 13,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 5,
    marginLeft: 4,
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
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 6,
  },
  loginLinkText: {
    color: '#64748B',
    fontSize: 13,
  },
  loginLinkHighlight: {
    color: '#6366F1',
    fontWeight: '700',
  },
  footer: {
    color: '#1E293B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 28,
  },
});
