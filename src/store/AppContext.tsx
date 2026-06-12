import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { UserRole, FilterOptions } from '@/types';

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
}

const defaultFilters: FilterOptions = {
  distance: '',
  salary: '',
  shift: '',
  hasBoard: false,
  hasLodging: false,
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('jobseeker');
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

  return (
    <AppContext.Provider value={{ role, setRole, filters, setFilters }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
