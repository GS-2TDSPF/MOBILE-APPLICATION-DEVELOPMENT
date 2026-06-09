import React, {
  createContext, useContext, useState,
  useCallback, useEffect, useRef, ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vibration } from 'react-native';
import { Alert as AlertType } from '../types/Alert';
import { alertService } from '../services/alertService';
import { Sensor, sensorService } from '../services/sensorService';

const NOTIF_SETTINGS_KEY  = '@orbit_notifications';
const ALERT_CACHE_KEY     = '@orbit_alerts_cache';
const LOCAL_ALERTS_KEY    = '@orbit_local_alerts';   // alertas criados/editados localmente
const POLL_INTERVAL_MS    = 30_000;

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
  // CRUD local-first
  createAlert: (payload: Omit<AlertType, 'id'>) => Promise<AlertType>;
  updateAlert: (id: number, payload: Partial<AlertType>) => Promise<AlertType>;
  deleteAlert: (id: number) => Promise<void>;
}

const AlertContext = createContext<AlertContextData>({} as AlertContextData);

// Gera IDs negativos para alertas locais (não conflita com IDs da API)
function localId(): number {
  return -(Date.now());
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts]           = useState<AlertType[]>([]);
  const [sensors, setSensors]         = useState<Sensor[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const prevAlertIdsRef  = useRef<Set<number>>(new Set());
  const pollIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadCache();
    startPolling();
    return () => stopPolling();
  }, []);

  // ─── Cache helpers ────────────────────────────────────────────

  async function loadCache() {
    try {
      const raw = await AsyncStorage.getItem(ALERT_CACHE_KEY);
      if (raw) {
        const { data } = JSON.parse(raw);
        const merged = await mergeWithLocal(data);
        setAlerts(merged);
        prevAlertIdsRef.current = new Set(merged.map((a: AlertType) => a.id));
      }
    } catch {}
  }

  async function saveCache(data: AlertType[]) {
    try {
      await AsyncStorage.setItem(ALERT_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch {}
  }

  /** Lê alertas locais e mescla com os da API, dando prioridade aos locais */
  async function mergeWithLocal(apiAlerts: AlertType[]): Promise<AlertType[]> {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_ALERTS_KEY);
      if (!raw) return apiAlerts;
      const locals: AlertType[] = JSON.parse(raw);

      // IDs locais negativos: adiciona no topo; IDs positivos: substitui o da API
      const overrides = new Map<number, AlertType>(locals.map((a) => [a.id, a]));
      const apiFiltered = apiAlerts.filter((a) => !overrides.has(a.id));
      const localOnly   = locals.filter((a) => a.id < 0);
      return [...localOnly, ...locals.filter((a) => a.id > 0), ...apiFiltered];
    } catch {
      return apiAlerts;
    }
  }

  async function getLocalAlerts(): Promise<AlertType[]> {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_ALERTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  async function saveLocalAlerts(locals: AlertType[]) {
    await AsyncStorage.setItem(LOCAL_ALERTS_KEY, JSON.stringify(locals));
  }

  // ─── Polling ──────────────────────────────────────────────────

  function startPolling() {
    fetchAll();
    pollIntervalRef.current = setInterval(fetchAll, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
  }

  async function checkAndNotifyNewAlerts(newAlerts: AlertType[]) {
    const prevIds = prevAlertIdsRef.current;
    const novos   = newAlerts.filter((a) => !prevIds.has(a.id));
    if (novos.length > 0) {
      try {
        const raw      = await AsyncStorage.getItem(NOTIF_SETTINGS_KEY);
        const settings = raw ? JSON.parse(raw) : { alertasAtivos: true, vibrar: true };
        if (settings.alertasAtivos && settings.vibrar) {
          const hasCritical = novos.some((a) => a.nivel >= 4);
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
        const merged = await mergeWithLocal(alertsData.value);
        await checkAndNotifyNewAlerts(merged);
        setAlerts(merged);
        await saveCache(merged);
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
      const data   = await alertService.getAll();
      const merged = await mergeWithLocal(data);
      await checkAndNotifyNewAlerts(merged);
      setAlerts(merged);
      await saveCache(merged);
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
      let data: AlertType[] = [];
      try { data = await alertService.getAtivos(); }
      catch { data = await alertService.getAll(); }
      const merged = await mergeWithLocal(data);
      await checkAndNotifyNewAlerts(merged);
      setAlerts(merged);
      await saveCache(merged);
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

  // ─── CRUD local-first ─────────────────────────────────────────

  /** CREATE: tenta API → se 403/sem conexão, salva localmente */
  const createAlert = useCallback(async (payload: Omit<AlertType, 'id'>): Promise<AlertType> => {
    try {
      const created = await alertService.create(payload);
      // Sucesso na API: atualiza lista
      setAlerts((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      // Fallback local
      const localAlert: AlertType = { ...payload, id: localId() } as AlertType;
      const locals = await getLocalAlerts();
      await saveLocalAlerts([localAlert, ...locals]);
      setAlerts((prev) => [localAlert, ...prev]);
      return localAlert;
    }
  }, []);

  /** UPDATE: tenta API → se falhar, atualiza localmente */
  const updateAlert = useCallback(async (id: number, payload: Partial<AlertType>): Promise<AlertType> => {
    try {
      const updated = await alertService.update(id, payload);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      // Se era local, atualiza no storage local também
      if (id < 0) {
        const locals = await getLocalAlerts();
        await saveLocalAlerts(locals.map((a) => (a.id === id ? updated : a)));
      }
      return updated;
    } catch {
      // Fallback: atualiza apenas na memória e no storage local
      const locals = await getLocalAlerts();
      const existing = [...alerts, ...locals].find((a) => a.id === id);
      const merged: AlertType = { ...existing, ...payload, id } as AlertType;

      if (id < 0) {
        await saveLocalAlerts(locals.map((a) => (a.id === id ? merged : a)));
      } else {
        // Sobrescreve alerta da API localmente
        const idx = locals.findIndex((a) => a.id === id);
        if (idx >= 0) await saveLocalAlerts(locals.map((a) => (a.id === id ? merged : a)));
        else await saveLocalAlerts([merged, ...locals]);
      }

      setAlerts((prev) => prev.map((a) => (a.id === id ? merged : a)));
      return merged;
    }
  }, [alerts]);

  /** DELETE: tenta API → se falhar, remove localmente */
  const deleteAlert = useCallback(async (id: number): Promise<void> => {
    try {
      if (id > 0) await alertService.delete(id);
    } catch {}
    // Remove da memória e do storage local (em ambos os casos)
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    const locals = await getLocalAlerts();
    await saveLocalAlerts(locals.filter((a) => a.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{
      alerts, sensors,
      isLoading, isRefreshing,
      lastUpdated, error,
      fetchAlerts, fetchAtivos, refresh,
      createAlert, updateAlert, deleteAlert,
    }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}
