/**
 * System View Context - Manages Current/Proposed toggle state globally
 * State persists across navigation between main page and component detail pages
 */

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SystemView } from '@/types';

interface SystemViewContextType {
  systemView: SystemView;
  setSystemView: (view: SystemView) => void;
  toggleSystemView: () => void;
}

const SystemViewContext = createContext<SystemViewContextType | undefined>(undefined);

export function SystemViewProvider({ children }: { children: ReactNode }) {
  const [systemView, setSystemView] = useState<SystemView>('current');

  const toggleSystemView = () => {
    setSystemView(prev => prev === 'current' ? 'proposed' : 'current');
  };

  return (
    <SystemViewContext.Provider value={{ systemView, setSystemView, toggleSystemView }}>
      {children}
    </SystemViewContext.Provider>
  );
}

export function useSystemView() {
  const context = useContext(SystemViewContext);
  if (context === undefined) {
    throw new Error('useSystemView must be used within a SystemViewProvider');
  }
  return context;
}
