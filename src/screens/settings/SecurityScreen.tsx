import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, FONTS, RADIUS } from '../../utils/theme';

type Section = 'none' | 'email' | 'password';

export default function SecurityScreen({ navigation }: any) {
  const { user } = useAuth();
  const [section, setSection] = useState<Section>('none');

  // Email change
  const [novoEmail, setNovoEmail] = useState('');
  const [senhaConfirmEmail, setSenhaConfirmEmail] = useState('');
  const [showSenhaEmail, setShowSenhaEmail] = useState(false);

  // Password change
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [showAtual, setShowAtual] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  function toggleSection(s: Section) {
    setSection((prev) => (prev === s ? 'none' : s));
  }

  async function handleChangeEmail() {
    if (!novoEmail.trim()) {
      Alert.alert('Atenção', 'Informe o novo e-mail.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail.trim())) {
      Alert.alert('Atenção', 'E-mail inválido.');
      return;
    }
    if (!senhaConfirmEmail) {
      Alert.alert('Atenção', 'Confirme sua senha para alterar o e-mail.');
      return;
    }

    setIsLoading(true);
    try {
      const raw = await AsyncStorage.getItem('@orbit_users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      const idx = users.findIndex(
        (u) => u.email.toLowerCase() === user?.email?.toLowerCase()
      );

      // Verifica senha — usuário local
      if (idx !== -1) {
        if (users[idx].senha !== senhaConfirmEmail) {
          Alert.alert('Senha incorreta', 'A senha informada não confere.');
          return;
        }
        if (users.some((u, i) => i !== idx && u.email.toLowerCase() === novoEmail.trim().toLowerCase())) {
          Alert.alert('E-mail em uso', 'Este e-mail já está cadastrado.');
          return;
        }
        users[idx].email = novoEmail.trim().toLowerCase();
        await AsyncStorage.setItem('@orbit_users', JSON.stringify(users));
      }
      // Usuário veio da API — atualiza somente o registro logado
      // (senha não pode ser verificada localmente, confia no campo preenchido)

      // Atualiza dados do usuário logado no storage
      const storedUser = await AsyncStorage.getItem('@orbit_user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        u.email = novoEmail.trim().toLowerCase();
        await AsyncStorage.setItem('@orbit_user', JSON.stringify(u));
        await AsyncStorage.setItem('@orbit_token', 'local_token_' + u.email);
      }

      Alert.alert('Sucesso!', 'E-mail atualizado. Faça login novamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      setNovoEmail('');
      setSenhaConfirmEmail('');
      setSection('none');
    } catch {
      Alert.alert('Erro', 'Não foi possível alterar o e-mail.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleChangePassword() {
    if (!senhaAtual) {
      Alert.alert('Atenção', 'Informe a senha atual.');
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert('Atenção', 'A nova senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      const raw = await AsyncStorage.getItem('@orbit_users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      const idx = users.findIndex(
        (u) => u.email.toLowerCase() === user?.email?.toLowerCase()
      );

      if (idx !== -1) {
        // Usuário local: verifica senha atual
        if (users[idx].senha !== senhaAtual) {
          Alert.alert('Senha incorreta', 'A senha atual informada não confere.');
          return;
        }
        users[idx].senha = novaSenha;
        await AsyncStorage.setItem('@orbit_users', JSON.stringify(users));
      }
      // Usuário da API: não pode verificar senha localmente
      // Salva/atualiza entrada local para funcionar com o fallback
      else {
        const apiUser = {
          nome: user?.nome ?? '',
          email: user?.email ?? '',
          municipio: user?.municipio ?? '',
          cargo: (user as any)?.cargo ?? '',
          senha: novaSenha,
          criadoEm: new Date().toISOString(),
        };
        await AsyncStorage.setItem('@orbit_users', JSON.stringify([...users, apiUser]));
      }

      Alert.alert('Sucesso!', 'Senha alterada com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
      setSection('none');
    } catch {
      Alert.alert('Erro', 'Não foi possível alterar a senha.');
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
        {/* Info atual */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Feather name="user" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{user?.nome || '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Feather name="mail" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{user?.email || '—'}</Text>
          </View>
        </View>

        {/* ─── ALTERAR E-MAIL ─────────────────────────── */}
        <AccordionCard
          icon="mail"
          title="Alterar e-mail"
          subtitle="Atualize seu e-mail de acesso"
          open={section === 'email'}
          onPress={() => toggleSection('email')}
        >
          <View style={styles.form}>
            <InputField
              label="NOVO E-MAIL"
              icon="mail"
              placeholder="novo@municipio.gov.br"
              value={novoEmail}
              onChangeText={setNovoEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              label="CONFIRMAR COM SENHA ATUAL"
              icon="lock"
              placeholder="Sua senha atual"
              value={senhaConfirmEmail}
              onChangeText={setSenhaConfirmEmail}
              secureTextEntry={!showSenhaEmail}
              toggleSecure={() => setShowSenhaEmail(!showSenhaEmail)}
              showSecure={showSenhaEmail}
            />
            <SaveButton
              label="Salvar novo e-mail"
              onPress={handleChangeEmail}
              isLoading={isLoading}
            />
          </View>
        </AccordionCard>

        {/* ─── ALTERAR SENHA ───────────────────────────── */}
        <AccordionCard
          icon="lock"
          title="Alterar senha"
          subtitle="Atualize sua senha de acesso"
          open={section === 'password'}
          onPress={() => toggleSection('password')}
        >
          <View style={styles.form}>
            <InputField
              label="SENHA ATUAL"
              icon="lock"
              placeholder="Sua senha atual"
              value={senhaAtual}
              onChangeText={setSenhaAtual}
              secureTextEntry={!showAtual}
              toggleSecure={() => setShowAtual(!showAtual)}
              showSecure={showAtual}
            />
            <InputField
              label="NOVA SENHA"
              icon="lock"
              placeholder="Mínimo 6 caracteres"
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry={!showNova}
              toggleSecure={() => setShowNova(!showNova)}
              showSecure={showNova}
            />
            <InputField
              label="CONFIRMAR NOVA SENHA"
              icon="lock"
              placeholder="Repita a nova senha"
              value={confirmarNovaSenha}
              onChangeText={setConfirmarNovaSenha}
              secureTextEntry={!showConfirmar}
              toggleSecure={() => setShowConfirmar(!showConfirmar)}
              showSecure={showConfirmar}
            />
            <SaveButton
              label="Salvar nova senha"
              onPress={handleChangePassword}
              isLoading={isLoading}
            />
          </View>
        </AccordionCard>

        {/* Aviso */}
        <View style={styles.noticeCard}>
          <Feather name="info" size={14} color={COLORS.info} />
          <Text style={styles.noticeText}>
            Alterações de e-mail e senha são salvas localmente no dispositivo. Para sincronizar com o servidor, contate o administrador do sistema.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Sub-components ────────────────────────────────

function AccordionCard({ icon, title, subtitle, open, onPress, children }: any) {
  return (
    <View style={styles.accordionCard}>
      <TouchableOpacity style={styles.accordionHeader} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.accordionLeft}>
          <View style={[styles.iconBox, { backgroundColor: `${COLORS.primary}15` }]}>
            <Feather name={icon} size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.accordionTitle}>{title}</Text>
            <Text style={styles.accordionSub}>{subtitle}</Text>
          </View>
        </View>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
      {open && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
}

function InputField({ label, icon, placeholder, value, onChangeText, keyboardType, autoCapitalize, secureTextEntry, toggleSecure, showSecure }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Feather name={icon} size={15} color={COLORS.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDimmed}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'none'}
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
        />
        {toggleSecure && (
          <TouchableOpacity onPress={toggleSecure}>
            <Feather name={showSecure ? 'eye-off' : 'eye'} size={15} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function SaveButton({ label, onPress, isLoading }: any) {
  return (
    <TouchableOpacity
      style={[styles.saveBtn, isLoading && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.85}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFF" />
      ) : (
        <>
          <Feather name="check" size={16} color="#FFF" />
          <Text style={styles.saveBtnText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 16 },
  infoCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  infoText: { color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.medium },
  divider: { height: 1, backgroundColor: COLORS.border },
  accordionCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
  },
  accordionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  accordionTitle: { color: COLORS.textPrimary, fontSize: 15, fontFamily: FONTS.semiBold },
  accordionSub: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.regular, marginTop: 2 },
  accordionBody: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 12 },
  form: { gap: 14 },
  inputGroup: { gap: 6 },
  inputLabel: { color: COLORS.textSecondary, fontSize: 10, fontFamily: FONTS.semiBold, letterSpacing: 0.8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgTertiary, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, gap: 10,
  },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.regular, paddingVertical: 12 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 14, marginTop: 4,
  },
  saveBtnText: { color: '#FFF', fontSize: 14, fontFamily: FONTS.semiBold },
  noticeCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: `${COLORS.info}10`, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: `${COLORS.info}30`, padding: 14,
  },
  noticeText: { color: COLORS.textSecondary, fontSize: 12, fontFamily: FONTS.regular, lineHeight: 18, flex: 1 },
});
