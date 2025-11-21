/**
 * SubsystemFlowView - Visual Sankey-style flow diagram for component comparison
 * Phase 3: Replaces text-heavy ComparisonView with engaging visual flow
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { useSystemData } from '@/hooks/useSystemData';
import { ComponentName } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { getIconPath } from '@/lib/iconMapping';

interface SubsystemFlowViewProps {
  componentId: ComponentName;
}

interface FlowItem {
  name: string;
  iconPath: string;
}

interface SystemFlowData {
  actions: string[];
  inputs: FlowItem[];
  outputs: FlowItem[];
  benefits: string[];
  detriments: string[];
  financialImplications: string;
}

/**
 * Helper: Convert string array to FlowItem array with icons
 */
function prepareFlowItems(items: string[]): FlowItem[] {
  return items.map(item => ({
    name: item,
    iconPath: getIconPath(item)
  }));
}

/**
 * FlowNode: Renders a single flow item (input or output) with icon
 */
function FlowNode({ item, type }: { item: FlowItem; type: 'input' | 'output' }) {
  // CO2 icons have built-in labels, so they need special handling
  const isCO2 = item.name.toLowerCase().includes('co2') || item.name.toLowerCase().includes('gas');
  const iconSize = isCO2 ? 'w-32 h-32' : 'w-12 h-12';
  const showLabel = !isCO2;
  
  // CO2 icons don't need the box styling since they have built-in labels
  const containerClasses = isCO2
    ? 'flex flex-col items-center gap-2 p-2'
    : 'flex flex-col items-center gap-2 p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200';
  
  return (
    <div className={containerClasses}>
      <div className={`${iconSize} relative flex-shrink-0`}>
        <Image
          src={item.iconPath}
          alt={item.name}
          fill
          className="object-contain"
          sizes={isCO2 ? "128px" : "48px"}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-center text-gray-700 font-medium leading-tight max-w-[100px]">
          {item.name}
        </span>
      )}
    </div>
  );
}

/**
 * ComponentNode: Central component visualization
 */
function ComponentNode({ 
  componentId, 
  componentName,
  actions 
}: { 
  componentId: ComponentName;
  componentName: string;
  actions: string[];
}) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 shadow-lg min-w-[180px]">
      <Icon name={componentId} size="xl" className="text-blue-600 mb-2" />
      <h4 className="font-bold text-blue-900 text-center mb-2">{componentName}</h4>
      {actions && actions.length > 0 && (
        <div className="space-y-1 mt-2">
          {actions.slice(0, 2).map((action, idx) => (
            <div key={idx} className="text-xs text-blue-700 text-center">
              • {action}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * FlowConnection: Visual connection line between nodes
 */
function FlowConnection({ 
  fromSide, 
  benefits = [], 
  detriments = [] 
}: { 
  fromSide: 'left' | 'right';
  benefits?: string[];
  detriments?: string[];
}) {
  const hasBadges = benefits.length > 0 || detriments.length > 0;
  
  return (
    <div className="flex items-center justify-center relative min-w-[60px]">
      {/* Horizontal line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-gray-300 to-gray-400 relative">
        {/* Arrow */}
        <div 
          className={`absolute top-1/2 -translate-y-1/2 ${fromSide === 'left' ? 'right-0' : 'left-0'}`}
        >
          <div className={`w-0 h-0 border-t-4 border-b-4 border-transparent ${
            fromSide === 'left' ? 'border-l-4 border-l-gray-400' : 'border-r-4 border-r-gray-400'
          }`} />
        </div>
      </div>
      
      {/* Impact badges on flow */}
      {hasBadges && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col gap-1 min-w-max">
          {benefits.slice(0, 2).map((benefit, idx) => (
            <span 
              key={`b-${idx}`}
              className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-300 whitespace-nowrap"
              title={benefit}
            >
              ✓ {benefit.length > 20 ? benefit.substring(0, 18) + '...' : benefit}
            </span>
          ))}
          {detriments.slice(0, 2).map((detriment, idx) => (
            <span 
              key={`d-${idx}`}
              className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-300 whitespace-nowrap"
              title={detriment}
            >
              ⚠ {detriment.length > 20 ? detriment.substring(0, 18) + '...' : detriment}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * FlowDiagram: Main flow visualization (Inputs → Component → Outputs)
 */
function FlowDiagram({ 
  data, 
  componentId,
  componentName,
  type 
}: { 
  data: SystemFlowData;
  componentId: ComponentName;
  componentName: string;
  type: 'current' | 'proposed';
}) {
  const isEmpty = !data || data.actions[0]?.includes('Does not exist');
  
  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
          <span className="text-4xl">🚫</span>
        </div>
        <p className="text-gray-600 font-medium">
          {componentName} does not exist in current practice
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Flow Diagram */}
      <div className="flex items-start justify-center gap-2 pb-12">
        {/* Inputs Column */}
        <div className="flex flex-col items-end gap-2 min-w-[120px]">
          <span className="text-xs font-semibold text-gray-500 uppercase mb-1">Inputs</span>
          {data.inputs.slice(0, 5).map((item, idx) => (
            <FlowNode key={idx} item={item} type="input" />
          ))}
          {data.inputs.length > 5 && (
            <span className="text-xs text-gray-400 italic">+{data.inputs.length - 5} more</span>
          )}
        </div>

        {/* Connection to Component */}
        <FlowConnection fromSide="left" />

        {/* Central Component */}
        <ComponentNode 
          componentId={componentId}
          componentName={componentName}
          actions={data.actions}
        />

        {/* Connection from Component */}
        <FlowConnection 
          fromSide="right" 
          benefits={data.benefits}
          detriments={data.detriments}
        />

        {/* Outputs Column */}
        <div className="flex flex-col items-start gap-2 min-w-[120px]">
          <span className="text-xs font-semibold text-gray-500 uppercase mb-1">Outputs</span>
          {data.outputs.slice(0, 5).map((item, idx) => (
            <FlowNode key={idx} item={item} type="output" />
          ))}
          {data.outputs.length > 5 && (
            <span className="text-xs text-gray-400 italic">+{data.outputs.length - 5} more</span>
          )}
        </div>
      </div>

      {/* Impact Summary (below flow) */}
      {(data.benefits.length > 2 || data.detriments.length > 2) && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {data.benefits.length > 0 && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <h5 className="text-xs font-bold text-green-800 mb-2">✓ All Benefits</h5>
              <ul className="space-y-1">
                {data.benefits.map((benefit, idx) => (
                  <li key={idx} className="text-[10px] text-green-700 leading-tight">• {benefit}</li>
                ))}
              </ul>
            </div>
          )}
          {data.detriments.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <h5 className="text-xs font-bold text-red-800 mb-2">⚠ Detriments</h5>
              <ul className="space-y-1">
                {data.detriments.map((detriment, idx) => (
                  <li key={idx} className="text-[10px] text-red-700 leading-tight">• {detriment}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Financial Implications */}
      {data.financialImplications && (
        <div className={`p-3 rounded-lg border-l-4 ${
          type === 'proposed' 
            ? 'bg-green-50 border-green-500' 
            : 'bg-amber-50 border-amber-500'
        }`}>
          <h5 className={`text-xs font-bold mb-1 ${
            type === 'proposed' ? 'text-green-900' : 'text-amber-900'
          }`}>
            💰 Financial Impact
          </h5>
          <p className={`text-xs ${
            type === 'proposed' ? 'text-green-800' : 'text-amber-800'
          }`}>
            {data.financialImplications}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Main SubsystemFlowView Component
 */
export function SubsystemFlowView({ componentId }: SubsystemFlowViewProps) {
  const { getComponent } = useSystemData();
  const component = getComponent(componentId);

  if (!component) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-red-600 font-semibold">Component data not found</p>
      </div>
    );
  }

  // Prepare flow data
  const currentData: SystemFlowData | null = component.current ? {
    actions: component.current.actions || [],
    inputs: prepareFlowItems(component.current.inputs || []),
    outputs: prepareFlowItems(component.current.outputs || []),
    benefits: component.current.impacts?.benefits || [],
    detriments: component.current.impacts?.detriments || [],
    financialImplications: component.current.financialImplications || ''
  } : null;

  const proposedData: SystemFlowData | null = component.proposed ? {
    actions: component.proposed.actions || [],
    inputs: prepareFlowItems(component.proposed.inputs || []),
    outputs: prepareFlowItems(component.proposed.outputs || []),
    benefits: component.proposed.impacts?.benefits || [],
    detriments: component.proposed.impacts?.detriments || [],
    financialImplications: component.proposed.financialImplications || ''
  } : null;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <Icon name={componentId} size="lg" className="text-gray-700" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{component.name}</h2>
          <p className="text-sm text-gray-600">Visual System Flow Comparison</p>
        </div>
      </div>

      {/* Side-by-side Flow Diagrams */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current System */}
        <div className="border-l-4 border-red-500 p-6 rounded-lg bg-white">
          <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
            <span>📊</span> Current Practice
          </h3>
          {currentData && (
            <FlowDiagram 
              data={currentData}
              componentId={componentId}
              componentName={component.name}
              type="current"
            />
          )}
        </div>

        {/* Proposed System */}
        <div className="border-l-4 border-green-600 p-6 rounded-lg bg-white">
          <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
            <span>🌱</span> Proposed System
          </h3>
          {proposedData && (
            <FlowDiagram 
              data={proposedData}
              componentId={componentId}
              componentName={component.name}
              type="proposed"
            />
          )}
        </div>
      </div>

      {/* Key Transformation Insight */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-500 rounded">
        <p className="text-sm text-gray-800">
          <span className="font-semibold">🔄 Transformation:</span> The proposed system{' '}
          {componentId === 'anaerobic-digester' || componentId === 'pyrolysis-unit' 
            ? 'creates new value streams by converting waste into renewable energy and valuable products'
            : 'improves efficiency and sustainability through circular economy integration'
          }.
        </p>
      </div>
    </div>
  );
}