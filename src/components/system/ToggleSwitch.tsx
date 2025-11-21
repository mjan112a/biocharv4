/**
 * Toggle Switch - Switches between Current Practice and Proposed System
 * State managed globally via SystemViewContext
 */

'use client';

import React from 'react';
import { useSystemView } from '@/hooks/useSystemView';
import { UI_COLORS } from '@/lib/constants';

export function ToggleSwitch() {
  const { systemView, toggleSystemView } = useSystemView();

  return (
    <div className="flex items-center gap-4">
      <span 
        className={`text-sm font-medium transition-colors ${
          systemView === 'current' ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        Current Practice
      </span>
      
      <button
        onClick={toggleSystemView}
        className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600"
        style={{ 
          backgroundColor: systemView === 'proposed' ? UI_COLORS.success : UI_COLORS.warning
        }}
        role="switch"
        aria-checked={systemView === 'proposed'}
        aria-label="Toggle between current practice and proposed system"
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
            systemView === 'proposed' ? 'translate-x-9' : 'translate-x-1'
          }`}
        />
      </button>
      
      <span 
        className={`text-sm font-medium transition-colors ${
          systemView === 'proposed' ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        Proposed System
      </span>
    </div>
  );
}
