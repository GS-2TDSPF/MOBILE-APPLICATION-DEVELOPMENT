// Tipos para Alertas de Desastres
export type RiskLevel = 1 | 2 | 3 | 4 | 5;

export interface Alert {
  id: number;
  titulo: string;
  descricao: string;
  nivel: RiskLevel;
  municipio: string;
  estado: string;
  latitude: number;
  longitude: number;
  dataHora: string;
  ativo: boolean;
  tipoDesastre: 'DESLIZAMENTO' | 'ENCHENTE' | 'SECA' | 'OUTROS';
}

export interface AlertFilters {
  nivel?: RiskLevel;
  municipio?: string;
  ativo?: boolean;
}
