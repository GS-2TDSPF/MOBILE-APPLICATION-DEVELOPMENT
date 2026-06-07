import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { Alert, AlertFilters } from '../types/Alert';

export const alertService = {
  async getAll(filters?: AlertFilters): Promise<Alert[]> {
    const response = await api.get<Alert[]>(ENDPOINTS.ALERTAS, { params: filters });
    return response.data;
  },

  async getAtivos(): Promise<Alert[]> {
    const response = await api.get<Alert[]>(ENDPOINTS.ALERTAS_ATIVOS);
    return response.data;
  },

  async getById(id: number): Promise<Alert> {
    const response = await api.get<Alert>(ENDPOINTS.ALERTA_BY_ID(id));
    return response.data;
  },

  async create(alert: Omit<Alert, 'id'>): Promise<Alert> {
    const response = await api.post<Alert>(ENDPOINTS.ALERTAS, alert);
    return response.data;
  },

  async update(id: number, alert: Partial<Alert>): Promise<Alert> {
    const response = await api.put<Alert>(ENDPOINTS.ALERTA_BY_ID(id), alert);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(ENDPOINTS.ALERTA_BY_ID(id));
  },
};
