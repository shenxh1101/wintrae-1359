import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import type { AppState, Volunteer, Task, VisitRecord, Supply, SupplyRecord } from '@/types';
import { mockTasks } from '@/data/tasks';
import { mockRecords } from '@/data/records';
import { mockSupplies, mockSupplyRecords } from '@/data/supplies';
import { mockCurrentVolunteer, mockPendingVolunteers } from '@/data/volunteers';

const AppContext = createContext<AppState | undefined>(undefined);

const STORAGE_KEY = 'volunteer_app_state_v1';

interface PersistedState {
  currentVolunteer: Volunteer;
  tasks: Task[];
  records: VisitRecord[];
  supplies: Supply[];
  supplyRecords: SupplyRecord[];
  pendingVolunteers: Volunteer[];
  savedAt: string;
}

const loadFromStorage = (): PersistedState | null => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    if (data) {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsed && parsed.tasks && parsed.tasks.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Storage] load failed:', e);
  }
  return null;
};

const saveToStorage = (state: PersistedState) => {
  try {
    const toSave = { ...state, savedAt: new Date().toISOString() };
    Taro.setStorageSync(STORAGE_KEY, toSave);
  } catch (e) {
    console.warn('[Storage] save failed:', e);
  }
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const persisted = loadFromStorage();

  const [currentVolunteer, setCurrentVolunteer] = useState<Volunteer>(
    persisted?.currentVolunteer || mockCurrentVolunteer
  );
  const [tasks, setTasks] = useState<Task[]>(
    persisted?.tasks || mockTasks
  );
  const [records, setRecords] = useState<VisitRecord[]>(
    persisted?.records || mockRecords
  );
  const [supplies, setSupplies] = useState<Supply[]>(
    persisted?.supplies || mockSupplies
  );
  const [supplyRecords, setSupplyRecords] = useState<SupplyRecord[]>(
    persisted?.supplyRecords || mockSupplyRecords
  );
  const [pendingVolunteers, setPendingVolunteers] = useState<Volunteer[]>(
    persisted?.pendingVolunteers || mockPendingVolunteers
  );

  useEffect(() => {
    saveToStorage({
      currentVolunteer,
      tasks,
      records,
      supplies,
      supplyRecords,
      pendingVolunteers,
      savedAt: new Date().toISOString(),
    });
  }, [currentVolunteer, tasks, records, supplies, supplyRecords, pendingVolunteers]);

  const value: AppState = {
    currentVolunteer,
    setCurrentVolunteer,
    tasks,
    setTasks,
    records,
    setRecords,
    supplies,
    setSupplies,
    supplyRecords,
    setSupplyRecords,
    pendingVolunteers,
    setPendingVolunteers,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
