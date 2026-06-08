// Tema central do OrbitAlert
// Paleta dark premium + tipografia Inter

export const COLORS = {
  // Backgrounds
  bgPrimary: '#0B0F1A',
  bgSecondary: '#1A1F2E',
  bgTertiary: '#0F1420',
  bgCard: '#1A1F2E',

  // Bordas
  border: '#1E293B',
  borderActive: '#6366F1',

  // Brand
  primary: '#6366F1',
  primaryLight: '#A5B4FC',
  primaryGlow: 'rgba(99, 102, 241, 0.15)',

  // Texto
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDimmed: '#334155',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#38BDF8',

  // Risco (1-5)
  risk1: '#22C55E',
  risk2: '#84CC16',
  risk3: '#F59E0B',
  risk4: '#EF4444',
  risk5: '#7C3AED',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  }),
};
