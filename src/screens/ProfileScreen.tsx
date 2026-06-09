import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, FONTS, RADIUS } from '../utils/theme';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair do sistema?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const getInitials = (name: string) => {
    if (!name) return 'GP';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header do Perfil */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.nome || '')}</Text>
        </View>
        <Text style={styles.name}>{user?.nome || 'Gestor Público'}</Text>
        <Text style={styles.role}>{user?.cargo || 'Defesa Civil'}</Text>
        <View style={styles.badgeRow}>
          <Feather name="map-pin" size={12} color={COLORS.primaryLight} />
          <Text style={styles.badgeText}>{user?.municipio || 'Município não informado'}</Text>
        </View>
      </View>

      {/* Informações da Conta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações da Conta</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Feather name="mail" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Feather name="shield" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText}>Permissão: Acesso Total</Text>
          </View>
        </View>
      </View>

      {/* Configurações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Notifications')}>
            <View style={styles.actionLeft}>
              <Feather name="bell" size={18} color={COLORS.textPrimary} />
              <Text style={styles.actionText}>Notificações e Alertas</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Security')}>
            <View style={styles.actionLeft}>
              <Feather name="lock" size={18} color={COLORS.textPrimary} />
              <Text style={styles.actionText}>Segurança e Senha</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Help')}>
            <View style={styles.actionLeft}>
              <Feather name="help-circle" size={18} color={COLORS.textPrimary} />
              <Text style={styles.actionText}>Central de Ajuda</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Developers')}>
            <View style={styles.actionLeft}>
              <Feather name="code" size={18} color={COLORS.textPrimary} />
              <Text style={styles.actionText}>Desenvolvedores</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Botão Sair */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Feather name="log-out" size={18} color={COLORS.danger} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
      
      <Text style={styles.version}>Versão 1.0.0 (Build 2026)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { padding: 20, paddingBottom: 40 },
  profileCard: {
    alignItems: 'center', backgroundColor: COLORS.bgCard,
    padding: 24, borderRadius: RADIUS.xl, marginBottom: 24,
    borderWidth: 1, borderColor: COLORS.border,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, borderWidth: 4, borderColor: COLORS.bgSecondary,
  },
  avatarText: { color: '#FFF', fontSize: 28, fontFamily: FONTS.bold },
  name: { color: COLORS.textPrimary, fontSize: 20, fontFamily: FONTS.bold, marginBottom: 4 },
  role: { color: COLORS.textSecondary, fontSize: 14, fontFamily: FONTS.regular, marginBottom: 12 },
  badgeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${COLORS.primary}15`, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  badgeText: { color: COLORS.primaryLight, fontSize: 13, fontFamily: FONTS.medium },
  section: { marginBottom: 24 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 16, fontFamily: FONTS.semiBold, marginBottom: 12, paddingHorizontal: 4 },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  infoText: { color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.medium },
  divider: { height: 1, backgroundColor: COLORS.border },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionText: { color: COLORS.textPrimary, fontSize: 15, fontFamily: FONTS.medium },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: `${COLORS.danger}15`, borderWidth: 1, borderColor: COLORS.danger,
    paddingVertical: 16, borderRadius: RADIUS.md, marginTop: 12,
  },
  logoutText: { color: COLORS.danger, fontSize: 15, fontFamily: FONTS.semiBold },
  version: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 32 },
});
