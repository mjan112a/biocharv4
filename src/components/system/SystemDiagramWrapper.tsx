/**
 * System Diagram Wrapper
 * Provides tab navigation between Flow View and Material Flow (Sankey)
 */

'use client';

import React, { useState } from 'react';
import { ToggleSwitch } from '@/components/system/ToggleSwitch';
import { SystemDiagramDataDriven } from '@/components/system/SystemDiagramDataDriven';
import { SankeyDiagram } from '@/components/d3/SankeyDiagram';

type ViewTab = 'flow' | 'sankey';

interface SystemDiagramWrapperProps {
  activeFilter?: string | null;
}

export function SystemDiagramWrapper({ activeFilter }: SystemDiagramWrapperProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>('flow');

  return (
    <div className="relative bg-white rounded-2xl shadow-lg p-8" style={{ minHeight: '700px' }}>
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border-2 border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setActiveTab('flow')}
            className={`
              px-6 py-2 rounded-md font-semibold transition-all duration-300
              ${activeTab === 'flow'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            🔄 Flow View
          </button>
          <button
            onClick={() => setActiveTab('sankey')}
            className={`
              px-6 py-2 rounded-md font-semibold transition-all duration-300
              ${activeTab === 'sankey'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            📊 Material Flow
          </button>
        </div>
      </div>

      {/* Toggle Switch - Centered below tabs */}
      <div className="flex justify-center mb-6">
        <ToggleSwitch />
      </div>
      
      <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">
        {activeTab === 'flow' ? 'System Flow Diagram' : 'Quantitative Material Flows'}
      </h2>

      {/* Conditional Content Based on Active Tab */}
      {activeTab === 'flow' ? (
        <SystemDiagramDataDriven />
      ) : (
        <SankeyDiagram />
      )}
    </div>
  );
}