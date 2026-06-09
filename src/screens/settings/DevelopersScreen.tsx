import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../../utils/theme';

// ─── EQUIPE DE DESENVOLVIMENTO ─────────────────────────────────────────────────

const DEVELOPERS = [
  {
    id: 1,
    nome: 'Moisés Waidemann',   
    rm: 'RM: 563719',               
    papel: 'Backend Developer', 
    github: 'https://github.com/https://github.com/Waidemannm',  
    linkedin: 'https://www.linkedin.com/in/moises-waidemann/',
    foto: require('../../../assets/images/dev1.jpg'),
  },
  {
    id: 2,
    nome: 'Richard Freitas',
    rm: 'RM: 566127',
    papel: 'Mobile Developer',
    github: 'https://github.com/rickk1stdev',
    linkedin: 'https://www.linkedin.com/in/richard-freitas/',
    foto: require('../../../assets/images/dev2.jpg'),
  },
  {
    id: 3,
    nome: 'Gabriel Sbrana',
    rm: 'RM: 565849',
    papel: 'Full Stack Developer',
    github: 'https://github.com/devsbrana',
    linkedin: 'https://www.linkedin.com/in/gabriel-sbrana-campos/',
    foto: require('../../../assets/images/dev3.jpg'),
  },
  {
    id: 4,
    nome: 'Thiago Mota',
    rm: 'RM: 563650',
    papel: 'Full Stack Developer  ',
    github: 'https://github.com/ThiagoMoota',
    linkedin: 'https://www.linkedin.com/in/thiagomoota/',
    foto: require('../../../assets/images/dev4.jpg'),
  },
];
// ────────────────────────────────────────────────────────────────────────────────

export default function DevelopersScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerIconBox}>
          <Feather name="code" size={30} color={COLORS.primary} />
        </View>
        <Text style={styles.bannerTitle}>Time de Desenvolvimento</Text>
        <Text style={styles.bannerSub}>
          FIAP · Global Solution 2026{'\n'}Turma 2TDSPF
        </Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Feather name="smartphone" size={12} color={COLORS.primaryLight} />
            <Text style={styles.badgeText}>React Native + Expo</Text>
          </View>
          <View style={styles.badge}>
            <Feather name="server" size={12} color={COLORS.primaryLight} />
            <Text style={styles.badgeText}>Spring Boot</Text>
          </View>
        </View>
      </View>

      {/* Cards dos devs */}
      <Text style={styles.sectionLabel}>DESENVOLVEDORES</Text>
      {DEVELOPERS.map((dev) => (
        <View key={dev.id} style={styles.devCard}>
          <View style={styles.devHeader}>
            <Image source={dev.foto} style={styles.avatar} />
            <View style={styles.devInfo}>
              <Text style={styles.devNome}>{dev.nome}</Text>
              <Text style={styles.devRM}>{dev.rm}</Text>
              <View style={styles.papelBadge}>
                <Feather name="terminal" size={11} color={COLORS.primary} />
                <Text style={styles.papelText}>{dev.papel}</Text>
              </View>
            </View>
          </View>

          {/* Links */}
          <View style={styles.divider} />
          <View style={styles.linksRow}>
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => Linking.openURL(dev.github).catch(() => {})}
            >
              <Feather name="github" size={16} color={COLORS.textSecondary} />
              <Text style={styles.linkText}>GitHub</Text>
            </TouchableOpacity>
            <View style={styles.linkSep} />
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => Linking.openURL(dev.linkedin).catch(() => {})}
            >
              <Feather name="linkedin" size={16} color={COLORS.info} />
              <Text style={[styles.linkText, { color: COLORS.info }]}>LinkedIn</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>OrbitAlert © 2026</Text>
        <Text style={styles.footerSub}>
          Dados via ESA Copernicus · Sentinel-1{'\n'}
          Desenvolvido na FIAP — Global Solution
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { padding: 20, paddingBottom: 48 },

  banner: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', padding: 28, marginBottom: 28, gap: 10,
  },
  bannerIconBox: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: {
    color: COLORS.textPrimary, fontSize: 20,
    fontFamily: FONTS.bold, textAlign: 'center',
  },
  bannerSub: {
    color: COLORS.textMuted, fontSize: 13,
    fontFamily: FONTS.regular, textAlign: 'center', lineHeight: 20,
  },
  badgeRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${COLORS.primary}15`, paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: `${COLORS.primary}30`,
  },
  badgeText: { color: COLORS.primaryLight, fontSize: 11, fontFamily: FONTS.semiBold },

  sectionLabel: {
    color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.semiBold,
    letterSpacing: 0.8, marginBottom: 14,
  },

  devCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 16, overflow: 'hidden',
  },
  devHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2, borderColor: COLORS.primary,
  },
  devInfo: { flex: 1, gap: 4 },
  devNome: { color: COLORS.textPrimary, fontSize: 16, fontFamily: FONTS.bold },
  devRM: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.regular },
  papelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${COLORS.primary}12`, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: RADIUS.full, alignSelf: 'flex-start',
    marginTop: 2,
  },
  papelText: { color: COLORS.primary, fontSize: 11, fontFamily: FONTS.semiBold },

  divider: { height: 1, backgroundColor: COLORS.border },
  linksRow: { flexDirection: 'row', alignItems: 'center' },
  linkBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingVertical: 13,
  },
  linkText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: FONTS.semiBold },
  linkSep: { width: 1, height: 20, backgroundColor: COLORS.border },

  footer: {
    alignItems: 'center', marginTop: 8, gap: 6,
    paddingTop: 24, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  footerText: { color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.semiBold },
  footerSub: {
    color: COLORS.textMuted, fontSize: 12,
    fontFamily: FONTS.regular, textAlign: 'center', lineHeight: 20,
  },
});
