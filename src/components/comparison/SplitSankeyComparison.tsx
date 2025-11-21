'use client';

import React, { useState } from 'react';
import { CircularSankeyHomepage } from '@/components/d3/CircularSankeyHomepage';
import { ComponentSelector } from '@/components/ui/ComponentSelector';

interface DiagramData {
  metadata?: {
    title: string;
    description: string;
    type: string;
    system: string;
  };
  nodes: any[];
  links: any[];
  config: {
    width: number;
    height: number;
  };
}

interface SplitSankeyComparisonProps {
  currentDiagram: DiagramData | null;
  proposedDiagram: DiagramData;
  componentName: string;
  className?: string;
}

/**
 * SplitSankeyComparison - Displays toggleable comparison of current and proposed systems
 *
 * Features:
 * - Toggle switch to alternate between current and proposed views
 * - Smooth transition animations
 * - Handles cases where current system doesn't exist (new components)
 * - Full-width diagrams for maximum visibility
 * - Color-coded visual indicators
 */
export function SplitSankeyComparison({
  currentDiagram,
  proposedDiagram,
  componentName,
  className = ''
}: SplitSankeyComparisonProps) {
  // Default to showing proposed system
  const [showProposed, setShowProposed] = useState(true);
  
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header with Toggle */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        {/* Top Row: Title and Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{componentName}</h2>
            <div className="md:hidden mt-2">
              <ComponentSelector />
            </div>
          </div>
          <div className="hidden md:block">
            <ComponentSelector />
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">
              {showProposed
                ? 'Biochar-integrated circular economy approach'
                : 'Traditional approach with known challenges'
              }
            </p>
          </div>

          {/* Toggle Buttons - Only show if current diagram exists */}
          {currentDiagram && (
            <div className="inline-flex rounded-lg border-2 border-gray-300 bg-white p-1 shadow-sm">
              <button
                onClick={() => setShowProposed(false)}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  !showProposed
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                ⚠️ Current
              </button>
              <button
                onClick={() => setShowProposed(true)}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  showProposed
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                ✅ Proposed
              </button>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 italic">
          {currentDiagram
            ? '💡 Use the toggle above to switch between current and proposed systems'
            : '💡 This component is new in the proposed system'}
        </p>
      </div>

      {/* Animated View Container */}
      <div className="relative min-h-[800px]">
        
        {/* Current System View */}
        {currentDiagram && (
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              !showProposed
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
          >
            <div className="border-4 border-red-500 bg-red-50 rounded-lg overflow-hidden h-full">
              {/* Header */}
              <div className="bg-red-100 border-b-2 border-red-300 px-4 py-3">
                <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                  <span>⚠️</span>
                  Current Practice
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Traditional approach with known challenges and inefficiencies
                </p>
              </div>

              {/* Content */}
              <div className="p-2 bg-white min-h-[750px] flex items-center justify-center">
                <CircularSankeyHomepage
                  diagramData={currentDiagram}
                  width={1200}
                  height={700}
                />
              </div>
            </div>
          </div>
        )}

        {/* Proposed System View */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            showProposed
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="border-4 border-green-500 bg-green-50 rounded-lg overflow-hidden h-full">
            {/* Header */}
            <div className="bg-green-100 border-b-2 border-green-300 px-4 py-3">
              <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                <span>✅</span>
                Proposed System
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Biochar-integrated circular economy with multiple environmental and economic benefits
              </p>
            </div>

            {/* Content */}
            <div className="p-2 bg-white min-h-[750px] flex items-center justify-center">
              {currentDiagram ? (
                <CircularSankeyHomepage
                  diagramData={proposedDiagram}
                  width={1200}
                  height={700}
                />
              ) : (
                <NonExistentCurrentView componentName={componentName} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className={`mt-6 p-4 rounded border-l-4 transition-colors duration-300 ${
        showProposed
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-600'
          : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-600'
      }`}>
        <p className="text-sm text-gray-800">
          <span className="font-semibold">
            {showProposed ? '✨ Benefits:' : '⚠️ Current Challenges:'}
          </span>{' '}
          {showProposed
            ? `The proposed system transforms ${componentName.toLowerCase()} operations through circular economy integration, converting waste into valuable resources while reducing environmental impact.`
            : currentDiagram
              ? `The current system faces challenges with waste disposal, environmental emissions, and missed opportunities for resource recovery.`
              : `${componentName} is a new innovation that addresses gaps in traditional poultry farming, creating value from materials that were previously wasted.`
          }
        </p>
      </div>
    </div>
  );
}

/**
 * NonExistentCurrentView - Shows educational message for components that don't exist in current practice
 */
function NonExistentCurrentView({ componentName }: { componentName: string }) {
  // Component-specific messages
  const messages: Record<string, { problems: string[]; opportunity: string }> = {
    'Anaerobic Digester': {
      problems: [
        'Organic waste (dead chickens, FOG) sent to landfills or rendering',
        'Valuable biogas energy potential completely wasted',
        'Greenhouse gas emissions from decomposition',
        'High waste disposal costs',
        'Missed opportunity for renewable energy generation'
      ],
      opportunity: 'The Anaerobic Digester converts organic waste into renewable biogas and valuable digestate, transforming a disposal problem into an energy solution.'
    },
    'Pyrolysis Unit': {
      problems: [
        'Used poultry litter has limited reuse options',
        'Direct land application can cause nutrient runoff',
        'Storage and handling challenges',
        'Environmental concerns with traditional disposal',
        'Ammonia and odor issues'
      ],
      opportunity: 'The Pyrolysis Unit transforms used litter into high-value biochar, bio-oils, and syngas, creating multiple revenue streams while solving a waste problem.'
    }
  };

  const info = messages[componentName] || {
    problems: ['Traditional system lacks this capability'],
    opportunity: 'This component adds significant value to the proposed system.'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto">
      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 border-4 border-gray-300">
        <span className="text-5xl opacity-40">🚫</span>
      </div>

      {/* Title */}
      <h4 className="text-xl font-bold text-gray-800 mb-3 text-center">
        Innovation in Proposed System
      </h4>

      {/* Description */}
      <p className="text-sm text-gray-700 text-center mb-6 leading-relaxed">
        The <strong>{componentName}</strong> does not exist in current poultry farming practice.
        This represents a significant opportunity for improvement.
      </p>

      {/* Problems Without This Component */}
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h5 className="font-semibold text-red-900 mb-2 text-sm flex items-center gap-2">
          <span>⚠️</span>
          Problems Without This Component:
        </h5>
        <ul className="space-y-1.5">
          {info.problems.map((problem, idx) => (
            <li key={idx} className="text-xs text-red-800 leading-tight flex items-start">
              <span className="mr-2 mt-0.5">•</span>
              <span>{problem}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Opportunity */}
      <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4">
        <h5 className="font-semibold text-green-900 mb-2 text-sm flex items-center gap-2">
          <span>💡</span>
          The Opportunity:
        </h5>
        <p className="text-xs text-green-800 leading-relaxed">
          {info.opportunity}
        </p>
      </div>
    </div>
  );
}
