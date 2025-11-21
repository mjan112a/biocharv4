'use client';

import React from 'react';
import { getIconPath } from '@/lib/iconMapping';
import Image from 'next/image';

interface CircularNode {
  id: string;
  name: string;
  type: 'component' | 'input' | 'intermediate' | 'output' | 'energy' | 'waste';
  icon?: string;
  color: string;
}

interface CircularLink {
  source: CircularNode;
  target: CircularNode;
  value: number;
  type: string;
  label: string;
  circular?: boolean;
  color: string;
}

interface EnhancedTooltipProps {
  x: number;
  y: number;
  node: CircularNode;
  incomingFlows: CircularLink[];
  outgoingFlows: CircularLink[];
  systemView: 'current' | 'proposed';
}

// Benefits data for proposed system
const NODE_BENEFITS: Record<string, string[]> = {
  'biochar': [
    'Carbon sequestration in soil',
    'Improved water retention',
    'Enhanced nutrient availability',
    'Reduced fertilizer needs'
  ],
  'bio-methane': [
    'Renewable energy source',
    'Displaces fossil fuels',
    'Reduces greenhouse gas emissions',
    'Local energy production'
  ],
  'syngas': [
    'Clean renewable energy',
    'Reduces fossil fuel dependency',
    'Energy self-sufficiency',
    'Lower operating costs'
  ],
  'digestate-liquids': [
    'Natural liquid fertilizer',
    'Nutrient recycling',
    'Reduced chemical fertilizer use',
    'Improved soil health'
  ],
  'digestate-solids': [
    'Organic soil amendment',
    'Reduced waste volume',
    'Nutrient-rich compost',
    'Enhanced soil structure'
  ],
  'anaerobic-digester': [
    'Converts waste to energy',
    'Reduces methane emissions',
    'Produces renewable fertilizer',
    'Waste volume reduction'
  ],
  'pyrolysis-unit': [
    'Produces biochar for carbon capture',
    'Generates renewable energy',
    'Reduces waste to landfill',
    'Creates valuable bio-oils'
  ]
};

export function EnhancedTooltip({
  x,
  y,
  node,
  incomingFlows,
  outgoingFlows,
  systemView
}: EnhancedTooltipProps) {
  const iconId = node.icon || node.id;
  const iconPath = getIconPath(iconId);
  const benefits = systemView === 'proposed' ? NODE_BENEFITS[node.id] : null;

  // Position tooltip to avoid going off screen
  const tooltipWidth = 450;
  const tooltipX = x + tooltipWidth > window.innerWidth ? x - tooltipWidth - 20 : x + 20;
  const tooltipY = Math.max(20, Math.min(y - 100, window.innerHeight - 400));

  return (
    <div
      className="fixed pointer-events-none bg-white border-2 border-gray-300 rounded-lg shadow-2xl z-50 overflow-hidden flex"
      style={{
        left: tooltipX,
        top: tooltipY,
        width: tooltipWidth
      }}
    >
      {/* Left Side: Large Icon */}
      <div className="flex-shrink-0 bg-gradient-to-br from-emerald-600 to-teal-600 p-6 flex items-center justify-center" style={{ width: '160px' }}>
        {iconPath && iconPath !== '/images/flow-icons/placeholder.svg' ? (
          <div className="relative bg-white rounded-lg shadow-md" style={{ width: '140px', height: '140px' }}>
            <Image
              src={iconPath}
              alt={node.name}
              fill
              className="object-contain p-2"
            />
          </div>
        ) : (
          <div 
            className="rounded-full"
            style={{ 
              backgroundColor: node.color,
              width: '120px',
              height: '120px'
            }}
          />
        )}
      </div>
      
      {/* Right Side: Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Name and Type */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3">
          <h3 className="text-lg font-bold">{node.name}</h3>
          <p className="text-sm text-emerald-100 capitalize">{node.type}</p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 bg-gray-50 flex-1">
          {/* Incoming Flows */}
          {incomingFlows.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">
                Inputs From:
              </h4>
              <div className="space-y-1">
                {incomingFlows.map((flow, i) => (
                  <div key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-emerald-600">→</span>
                    <span>
                      <span className="font-medium">{flow.source.name}</span>
                      {flow.label && <span className="text-gray-500 text-xs ml-1">({flow.label})</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outgoing Flows */}
          {outgoingFlows.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">
                Outputs To:
              </h4>
              <div className="space-y-1">
                {outgoingFlows.map((flow, i) => (
                  <div key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-teal-600">→</span>
                    <span>
                      <span className="font-medium">{flow.target.name}</span>
                      {flow.label && <span className="text-gray-500 text-xs ml-1">({flow.label})</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benefits (Proposed System Only) */}
          {benefits && benefits.length > 0 && (
            <div className="border-t border-gray-300 pt-3">
              <h4 className="text-xs font-semibold text-emerald-700 uppercase mb-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Benefits
              </h4>
              <ul className="space-y-1">
                {benefits.map((benefit, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}