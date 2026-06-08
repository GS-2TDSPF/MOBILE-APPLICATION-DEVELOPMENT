import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  LayoutAnimation,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../../utils/theme';

const FAQS = [
  {
    id: '1',
    question: 'Como os alertas são gerados?',
    answer:
      'Os alertas são gerados a partir de dados do satélite Sentinel-1 da ESA (Agência Espacial Europeia), processados por algoritmos de análise de risco. As imagens de radar SAR permitem detectar alterações no terreno, como deslizamentos e inundações, com até 48 horas de antecedência.',
  },
  {
    id: '2',
    question: 'O que significa cada nível de risco?',
    answer:
      'Nível 1 (Verde): Situação normal, apenas monitoramento.\nNível 2 (Limão): Atenção, condições adversas identificadas.\nNível 3 (Âmbar): Moderado — equipes em alerta.\nNível 4 (Vermelho): Alto risco, acionar plano de resposta.\nNível 5 (Roxo): Crítico — emergência ativa, evacuação pode ser necessária.',
  },
  {
    id: '3',
    question: 'Com que frequência os dados são atualizados?',
    answer:
      'Os dados do Sentinel-1 são atualizados a cada 6 a 12 dias por região. Para situações de emergência, imagens extras podem ser requisitadas através do programa Copernicus Emergency Management Service (CEMS).',
  },
  {
    id: '4',
    question: 'Posso exportar os relatórios de alertas?',
    answer:
      'Atualmente, a exportação de relatórios está disponível apenas no painel web do OrbitAlert. A versão mobile exibe os dados em tempo real para consulta rápida em campo.',
  },
  {
    id: '5',
    question: 'Meus dados cadastrais estão seguros?',
    answer:
      'Sim. Os dados são armazenados localmente no dispositivo usando AsyncStorage criptografado. Nenhum dado pessoal é enviado a terceiros sem sua autorização.',
  },
  {
    id: '6',
    question: 'Como adicionar meu município ao sistema?',
    answer:
      'Para cadastrar uma nova região de monitoramento, entre em contato com a equipe técnica através do e-mail suporte@orbitalert.gov.br informando o código IBGE do município e o responsável técnico da Defesa Civil local.',
  },
];

const CONTACTS = [
  { icon: 'mail', label: 'E-mail de suporte', value: 'suporte@orbitalert.gov.br', action: 'mailto:suporte@orbitalert.gov.br' },
  { icon: 'phone', label: 'Central de atendimento', value: '0800 123 4567', action: 'tel:08001234567' },
  { icon: 'globe', label: 'Portal OrbitAlert', value: 'www.orbitalert.gov.br', action: 'https://www.orbitalert.gov.br' },
];

export default function HelpScreen() {
  const [openId, setOpenId] = useState<string | null>(null);

  function toggleFaq(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header visual */}
      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Feather name="help-circle" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.bannerTitle}>Como podemos ajudar?</Text>
        <Text style={styles.bannerSub}>
          Encontre respostas rápidas ou entre em contato com nossa equipe
        </Text>
      </View>

      {/* FAQ */}
      <Text style={styles.sectionLabel}>PERGUNTAS FREQUENTES</Text>
      <View style={styles.card}>
        {FAQS.map((faq, idx) => (
          <React.Fragment key={faq.id}>
            <TouchableOpacity
              style={styles.faqHeader}
              onPress={() => toggleFaq(faq.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Feather
                name={openId === faq.id ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={openId === faq.id ? COLORS.primary : COLORS.textMuted}
              />
            </TouchableOpacity>
            {openId === faq.id && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
            {idx < FAQS.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>

      {/* Contato */}
      <Text style={styles.sectionLabel}>FALAR COM A EQUIPE</Text>
      <View style={styles.card}>
        {CONTACTS.map((c, idx) => (
          <React.Fragment key={c.label}>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL(c.action).catch(() => {})}
              activeOpacity={0.8}
            >
              <View style={[styles.contactIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                <Feather name={c.icon as any} size={18} color={COLORS.primary} />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>{c.label}</Text>
                <Text style={styles.contactValue}>{c.value}</Text>
              </View>
              <Feather name="external-link" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
            {idx < CONTACTS.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>

      {/* Sobre */}
      <Text style={styles.sectionLabel}>SOBRE O SISTEMA</Text>
      <View style={styles.card}>
        <InfoRow label="Versão do app" value="1.0.0 (Build 2026)" />
        <View style={styles.divider} />
        <InfoRow label="SDK Expo" value="56.0.0" />
        <View style={styles.divider} />
        <InfoRow label="Fonte de dados" value="ESA Copernicus · Sentinel-1" />
        <View style={styles.divider} />
        <InfoRow label="Atualização de órbita" value="A cada 6–12 dias" />
        <View style={styles.divider} />
        <InfoRow label="Desenvolvido por" value="FIAP Global Solution 2026" />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { padding: 20, paddingBottom: 48 },
  banner: {
    alignItems: 'center', marginBottom: 28, gap: 10,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: 28, borderWidth: 1, borderColor: COLORS.border,
  },
  bannerIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: { color: COLORS.textPrimary, fontSize: 20, fontFamily: FONTS.bold, textAlign: 'center' },
  bannerSub: {
    color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.regular,
    textAlign: 'center', lineHeight: 20,
  },
  sectionLabel: {
    color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.semiBold,
    letterSpacing: 0.8, marginBottom: 10, paddingHorizontal: 4,
  },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 24,
  },
  faqHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, gap: 12,
  },
  faqQuestion: { color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.medium, flex: 1, lineHeight: 20 },
  faqAnswer: {
    color: COLORS.textSecondary, fontSize: 13, fontFamily: FONTS.regular,
    lineHeight: 20, paddingHorizontal: 16, paddingBottom: 16,
  },
  divider: { height: 1, backgroundColor: COLORS.border },
  contactRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 14,
  },
  contactIcon: { width: 38, height: 38, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  contactText: { flex: 1 },
  contactLabel: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.regular, marginBottom: 2 },
  contactValue: { color: COLORS.primaryLight, fontSize: 14, fontFamily: FONTS.semiBold },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13,
  },
  infoLabel: { color: COLORS.textMuted, fontSize: 13, fontFamily: FONTS.regular },
  infoValue: { color: COLORS.textPrimary, fontSize: 13, fontFamily: FONTS.medium },
});
