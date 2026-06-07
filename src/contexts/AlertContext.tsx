import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert } from '../types/Alert';
import { alertService } from '../services/alertService';

interface AlertContextData {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  fetchAlerts: () => Promise<void>;
  fetchAtivos: () => Promise<void>;
}

const AlertContext = createContext<AlertContextData>({} as AlertContextData);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await alertService.getAll();
      setAlerts(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar alertas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAtivos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await alertService.getAtivos();
      setAlerts(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar alertas ativos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, isLoading, error, fetchAlerts, fetchAtivos }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}
