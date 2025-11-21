/**
 * useSystemData Hook
 * Loads and provides access to system-comparison.json data
 */

'use client';

import { useMemo } from 'react';
import { useSystemView } from './useSystemView';
import type { 
  SystemComparison, 
  SystemComponent, 
  SystemView 
} from '@/types/system-comparison';

// Import the JSON data directly (Next.js handles this)
import systemComparisonData from '@/data/system/system-comparison.json';

export function useSystemData() {
  const { systemView } = useSystemView();
  
  // Type-safe access to the data
  const data = useMemo(() => systemComparisonData as SystemComparison, []);

  /**
   * Get all component IDs for the current or proposed system
   */
  const getActiveComponents = useMemo(() => {
    if (systemView === 'current') {
      return data.summary.current.activeComponents;
    }
    return data.summary.proposed.activeComponents;
  }, [systemView, data]);

  /**
   * Get component data by ID
   */
  const getComponent = (componentId: string): SystemComponent | null => {
    return data.components[componentId] || null;
  };

  /**
   * Get component view (current or proposed) by ID
   */
  const getComponentView = (componentId: string): SystemView | null => {
    const component = getComponent(componentId);
    if (!component) return null;
    
    return systemView === 'current' ? component.current : component.proposed;
  };

  /**
   * Get all components sorted by order
   */
  const getAllComponentsSorted = useMemo(() => {
    return Object.entries(data.components)
      .map(([id, component]) => ({ id, ...component }))
      .sort((a, b) => a.order - b.order);
  }, [data]);

  /**
   * Get active components with their data
   */
  const getActiveComponentsWithData = useMemo(() => {
    return getActiveComponents
      .map(id => {
        const component = getComponent(id);
        if (!component) return null;
        return {
          id,
          ...component,
          view: systemView === 'current' ? component.current : component.proposed
        };
      })
      .filter(Boolean);
  }, [getActiveComponents, systemView]);

  /**
   * Check if a component exists in current view
   */
  const isComponentActive = (componentId: string): boolean => {
    return getActiveComponents.includes(componentId);
  };

  /**
   * Get inputs for a component in current view
   */
  const getComponentInputs = (componentId: string): string[] => {
    const view = getComponentView(componentId);
    return view?.inputs || [];
  };

  /**
   * Get outputs for a component in current view
   */
  const getComponentOutputs = (componentId: string): string[] => {
    const view = getComponentView(componentId);
    return view?.outputs || [];
  };

  /**
   * Get actions for a component in current view
   */
  const getComponentActions = (componentId: string): string[] => {
    const view = getComponentView(componentId);
    return view?.actions || [];
  };

  /**
   * Get impacts (benefits/detriments) for a component in current view
   */
  const getComponentImpacts = (componentId: string) => {
    const view = getComponentView(componentId);
    return view?.impacts || { benefits: [], detriments: [] };
  };

  /**
   * Get financial implications for a component in current view
   */
  const getFinancialImplications = (componentId: string): string => {
    const view = getComponentView(componentId);
    return view?.financialImplications || '';
  };

  /**
   * Get summary for current view
   */
  const getSummary = useMemo(() => {
    return systemView === 'current' ? data.summary.current : data.summary.proposed;
  }, [systemView, data]);

  /**
   * Get overall comparison data
   */
  const getOverallComparison = useMemo(() => {
    return data.summary.overallComparison;
  }, [data]);

  /**
   * Get metadata
   */
  const getMetadata = useMemo(() => {
    return data.metadata;
  }, [data]);

  /**
   * Find connections between components
   * Returns array of [source, target] pairs based on outputs matching inputs
   */
  const findConnections = useMemo(() => {
    const connections: Array<{ source: string; target: string; material: string }> = [];
    
    getActiveComponents.forEach(sourceId => {
      const sourceOutputs = getComponentOutputs(sourceId);
      
      getActiveComponents.forEach(targetId => {
        if (sourceId === targetId) return;
        
        const targetInputs = getComponentInputs(targetId);
        
        // Check for matching materials
        sourceOutputs.forEach(output => {
          targetInputs.forEach(input => {
            // Fuzzy match between output and input
            const outputNorm = output.toLowerCase().trim();
            const inputNorm = input.toLowerCase().trim();
            
            if (
              outputNorm.includes(inputNorm) || 
              inputNorm.includes(outputNorm) ||
              outputNorm === inputNorm
            ) {
              connections.push({
                source: sourceId,
                target: targetId,
                material: output
              });
            }
          });
        });
      });
    });
    
    return connections;
  }, [getActiveComponents, systemView]);

  return {
    // Data access
    data,
    metadata: getMetadata,
    summary: getSummary,
    overallComparison: getOverallComparison,
    
    // Component queries
    getComponent,
    getComponentView,
    getAllComponentsSorted,
    getActiveComponents,
    getActiveComponentsWithData,
    isComponentActive,
    
    // Component details
    getComponentInputs,
    getComponentOutputs,
    getComponentActions,
    getComponentImpacts,
    getFinancialImplications,
    
    // Relationships
    findConnections,
    
    // Current state
    currentView: systemView,
  };
}