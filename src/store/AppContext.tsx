import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { AppState, Volunteer, Task, VisitRecord, Supply, SupplyRecord } from '@/types';
import { mockTasks } from '@/data/tasks';
import { mockRecords } from '@/data/records';
import { mockSupplies, mockSupplyRecords } from '@/data/supplies';
import { mockCurrentVolunteer, mockPendingVolunteers } from '@/data/volunteers';

const AppContext = createContext<AppState | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentVolunteer, setCurrentVolunteer] = useState<Volunteer>(mockCurrentVolunteer);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [records, setRecords] = useState<VisitRecord[]>(mockRecords);
  const [supplies, setSupplies] = useState<Supply[]>(mockSupplies);
  const [supplyRecords, setSupplyRecords] = useState<SupplyRecord[]>(mockSupplyRecords);
  const [pendingVolunteers, setPendingVolunteers] = useState<Volunteer[]>(mockPendingVolunteers);

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
