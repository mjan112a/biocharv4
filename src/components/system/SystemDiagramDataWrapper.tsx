/**
 * SystemDiagram Data Wrapper
 * Wraps the existing SystemDiagram with data-layer awareness
 * This preserves animations while making component visibility data-driven
 */

'use client';

import React from 'react';
import { SystemDiagram } from './SystemDiagram';
import { useSystemData } from '@/hooks/useSystemData';

export function SystemDiagramDataWrapper({ activeFilter }: { activeFilter?: string | null }) {
  const { getActiveComponents, currentView } = useSystemData();
  
  // Pass active components to SystemDiagram
  // This allows SystemDiagram to conditionally render components
  return (
    <SystemDiagram 
      activeFilter={activeFilter}
      activeComponents={getActiveComponents}
      systemView={currentView}
    />
  );
}