import { RiskLevel } from '../types/Alert';

export const RISK_COLORS: Record<RiskLevel, string> = {
  1: '#22C55E', // Verde — Baixo
  2: '#84CC16', // Verde-amarelo — Atenção
  3: '#F59E0B', // Amarelo — Moderado
  4: '#EF4444', // Laranja-vermelho — Alto
  5: '#7C3AED', // Roxo — Crítico
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  1: 'Baixo',
  2: 'Atenção',
  3: 'Moderado',
  4: 'Alto',
  5: 'Crítico',
};

export const RISK_BG_COLORS: Record<RiskLevel, string> = {
  1: 'rgba(34, 197, 94, 0.15)',
  2: 'rgba(132, 204, 22, 0.15)',
  3: 'rgba(245, 158, 11, 0.15)',
  4: 'rgba(239, 68, 68, 0.15)',
  5: 'rgba(124, 58, 237, 0.15)',
};
