import React, {
  createContext, useContext, useState,
  useCallback, useEffect, useRef, ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vibration } from 'react-native';
import { Alert as AlertType } from '../types/Alert';
import { alertService } from '../services/alertService';
import { Sensor, sensorService } from '../services/sensorService';

const NOTIF_SETTINGS_KEY = '@orbit_notifications';
const ALERT_CACHE_KEY = '@orbit_alerts_cache';
const POLL_INTERVAL_MS = 30_000; // 30 segundos

interface AlertContextData {
  alerts: AlertType[];
  sensors: Sensor[];
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  error: string | null;
  fetchAlerts: () => Promise<void>;
  fetchAtivos: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AlertContext = createContext<AlertContextData>({} as AlertContextData);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prevAlertIdsRef = useRef<Set<number>>(new Set());
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Carrega cache do AsyncStorage para exibição imediata
  useEffect(() => {
    loadCache();
    startPolling();
    return () => stopPolling();
  }, []);

  async function loadCache() {
    try {
      const raw = await AsyncStorage.getItem(ALERT_CACHE_KEY);
      if (raw) {
        const { data } = JSON.parse(raw);
        setAlerts(data);
        // ✅ Inicializa os IDs conhecidos com os do cache para evitar vibração falsa no primeiro fetch
        prevAlertIdsRef.current = new Set(data.map((a: AlertType) => a.id));
      }
    } catch {}
  }

  async function saveCache(data: AlertType[]) {
    try {
      await AsyncStorage.setItem(ALERT_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch {}
  }

  function startPolling() {
    fetchAll(); // busca imediata
    pollIntervalRef.current = setInterval(fetchAll, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
  }

  async function checkAndNotifyNewAlerts(newAlerts: AlertType[]) {
    const prevIds = prevAlertIdsRef.current;
    const novoAlertas = newAlerts.filter((a) => !prevIds.has(a.id));

    if (novoAlertas.length > 0) {
      try {
        const raw = await AsyncStorage.getItem(NOTIF_SETTINGS_KEY);
        const settings = raw ? JSON.parse(raw) : { alertasAtivos: true, vibrar: true };

        if (settings.alertasAtivos && settings.vibrar) {
          const hasCritical = novoAlertas.some((a) => a.nivel >= 4);
          Vibration.vibrate(hasCritical ? [0, 400, 200, 400, 200, 800] : [0, 300, 150, 300]);
        }
      } catch {}
      prevAlertIdsRef.current = new Set(newAlerts.map((a) => a.id));
    }
  }

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const [alertsData, sensorsData] = await Promise.allSettled([
        alertService.getAll(),
        sensorService.getAll(),
      ]);

      if (alertsData.status === 'fulfilled') {
        const newAlerts = alertsData.value;
        await checkAndNotifyNewAlerts(newAlerts);
        setAlerts(newAlerts);
        await saveCache(newAlerts);
      }

      if (sensorsData.status === 'fulfilled') {
        setSensors(sensorsData.value);
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar dados');
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await alertService.getAll();
      await checkAndNotifyNewAlerts(data);
      setAlerts(data);
      await saveCache(data);
      setLastUpdated(new Date());
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
      // Tenta alertas ativos, fallback para todos
      let data: AlertType[] = [];
      try {
        data = await alertService.getAtivos();
      } catch {
        data = await alertService.getAll();
      }
      await checkAndNotifyNewAlerts(data);
      setAlerts(data);
      await saveCache(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar alertas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAll();
    setIsRefreshing(false);
  }, [fetchAll]);

  return (
    <AlertContext.Provider value={{
      alerts, sensors,
      isLoading, isRefreshing,
      lastUpdated, error,
      fetchAlerts, fetchAtivos, refresh,
    }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}
