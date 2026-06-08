import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import { API_BASE_URL } from '../api/endpoints';

export interface Sensor {
  id: number;
  nome: string;
  tipo: string;
  localizacao: string;
  municipio: string;
  estado: string;
  latitude: number;
  longitude: number;
  status: 'ONLINE' | 'OFFLINE' | 'MANUTENCAO';
  bateria: number;
  ultimaLeitura: string;
  // leituras
  valorAtual?: number;
  unidade?: string;
}

export interface SensorLeitura {
  id: number;
  sensorId: number;
  valor: number;
  unidade: string;
  dataHora: string;
}

const SENSOR_CACHE_KEY = '@orbit_sensors_cache';
const CACHE_TTL_MS = 60_000; // 1 minuto

export const sensorService = {
  async getAll(): Promise<Sensor[]> {
    try {
      const response = await api.get<Sensor[]>(`${API_BASE_URL}/sensores`);
      const sensors = response.data;
      // cache
      await AsyncStorage.setItem(
        SENSOR_CACHE_KEY,
        JSON.stringify({ ts: Date.now(), data: sensors })
      );
      return sensors;
    } catch {
      // tenta cache
      const raw = await AsyncStorage.getItem(SENSOR_CACHE_KEY);
      if (raw) {
        const { data } = JSON.parse(raw);
        return data as Sensor[];
      }
      // fallback de demonstração se o endpoint não existir
      return sensorService.getMockSensors();
    }
  },

  async getLeituras(sensorId: number): Promise<SensorLeitura[]> {
    try {
      const response = await api.get<SensorLeitura[]>(
        `${API_BASE_URL}/sensores/${sensorId}/leituras`
      );
      return response.data;
    } catch {
      return [];
    }
  },

  getMockSensors(): Sensor[] {
    return [
      {
        id: 1, nome: 'Pluviômetro P-001', tipo: 'PLUVIOMETRO',
        localizacao: 'Bairro Centro', municipio: 'São Paulo', estado: 'SP',
        latitude: -23.5505, longitude: -46.6333,
        status: 'ONLINE', bateria: 92,
        ultimaLeitura: new Date(Date.now() - 5 * 60000).toISOString(),
        valorAtual: 48.2, unidade: 'mm/h',
      },
      {
        id: 2, nome: 'Nível Rio TNT-12', tipo: 'NIVEL_RIO',
        localizacao: 'Margem Tietê', municipio: 'Osasco', estado: 'SP',
        latitude: -23.5329, longitude: -46.7917,
        status: 'ONLINE', bateria: 77,
        ultimaLeitura: new Date(Date.now() - 12 * 60000).toISOString(),
        valorAtual: 3.8, unidade: 'm',
      },
      {
        id: 3, nome: 'Estação Met. ZN-03', tipo: 'METEOROLOGICA',
        localizacao: 'Zona Norte', municipio: 'São Paulo', estado: 'SP',
        latitude: -23.4811, longitude: -46.6259,
        status: 'OFFLINE', bateria: 8,
        ultimaLeitura: new Date(Date.now() - 4 * 3600000).toISOString(),
        valorAtual: 0, unidade: '—',
      },
      {
        id: 4, nome: 'Inclinômetro SL-07', tipo: 'INCLINOMETRO',
        localizacao: 'Serra da Cantareira', municipio: 'Mairiporã', estado: 'SP',
        latitude: -23.3171, longitude: -46.5564,
        status: 'ONLINE', bateria: 55,
        ultimaLeitura: new Date(Date.now() - 2 * 60000).toISOString(),
        valorAtual: 2.1, unidade: '°',
      },
      {
        id: 5, nome: 'Barômetro BR-02', tipo: 'BAROMETRO',
        localizacao: 'Guarulhos Centro', municipio: 'Guarulhos', estado: 'SP',
        latitude: -23.4543, longitude: -46.5338,
        status: 'MANUTENCAO', bateria: 34,
        ultimaLeitura: new Date(Date.now() - 24 * 3600000).toISOString(),
        valorAtual: 1013, unidade: 'hPa',
      },
    ];
  },
};
