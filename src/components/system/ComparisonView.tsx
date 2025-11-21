/**
 * ComparisonView - Side-by-side comparison of Current vs Proposed systems
 * Uses data layer from system-comparison.json via useSystemData hook
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { useSystemData } from '@/hooks/useSystemData';
import { ComponentName } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { getIconPath } from '@/lib/iconMapping';

interface ComparisonViewProps {
  componentId: ComponentName;
}

interface SystemViewData {
  actions: string[];
  inputs: string[];
  outputs: string[];
  impacts: {
    benefits: string[];
    detriments: string[];
  };
  financialImplications: string;
}

/**
 * Helper: Renders a grid of input/output items with icons
 */
function ItemsGrid({ 
  items, 
  title, 
  type = 'input',
  emptyMessage = 'None'
}: { 
  items: string[]; 
  title: string; 
  type?: 'input' | 'output';
  emptyMessage?: string;
}) {
  if (!items || items.length === 0) {
    return (
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">{title}</h4>
        <p className="text-sm text-gray-500 italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h4 className="font-semibold text-gray-700 mb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, idx) => {
          const iconPath = getIconPath(item);
          return (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition-colors"
            >
              {iconPath ? (
                <div className="w-8 h-8 relative flex-shrink-0">
                  <Image
                    src={iconPath}
                    alt={item}
                    fill
                    className="object-contain"
                    sizes="32px"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded flex-shrink-0">
                  <span className="text-xs">{type === 'input' ? '📥' : '📤'}</span>
                </div>
              )}
              <span className="text-sm text-gray-800">{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Helper: Renders actions list
 */
function ActionsList({ actions }: { actions: string[] }) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="font-semibold text-gray-700 mb-2">Actions</h4>
      <ul className="space-y-1">
        {actions.map((action, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-500 mt-0.5">▸</span>
            <span>{action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Helper: Renders impacts list (benefits and detriments)
 */
function ImpactsList({ impacts }: { impacts: SystemViewData['impacts'] }) {
  const hasBenefits = impacts.benefits && impacts.benefits.length > 0;
  const hasDetriments = impacts.detriments && impacts.detriments.length > 0;

  if (!hasBenefits && !hasDetriments) return null;

  return (
    <div className="mb-4">
      <h4 className="font-semibold text-gray-700 mb-2">Impacts</h4>
      
      {hasBenefits && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-green-700 mb-1">Benefits:</p>
          <ul className="space-y-1">
            {impacts.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {hasDetriments && (
        <div>
          <p className="text-xs font-semibold text-red-700 mb-1">Detriments:</p>
          <ul className="space-y-1">
            {impacts.detriments.map((detriment, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-red-500 mt-0.5">⚠</span>
                <span>{detriment}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Helper: Renders financial implications summary
 */
function FinancialSummary({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
      <h4 className="font-semibold text-amber-900 mb-1 text-sm">Financial Implications</h4>
      <p className="text-sm text-amber-800">{text}</p>
    </div>
  );
}

/**
 * Helper: Renders a single system view column
 */
function SystemColumn({ 
  view, 
  type,
  componentName
}: { 
  view: SystemViewData | null; 
  type: 'current' | 'proposed';
  componentName: string;
}) {
  const isCurrentEmpty = type === 'current' && (!view || view.actions[0]?.includes('Does not exist'));
  
  return (
    <div className={`
      border-l-4 p-6 rounded-lg bg-white
      ${type === 'current' ? 'border-red-500' : 'border-green-600'}
    `}>
      <div className="flex items-center gap-3 mb-4">
        <h3 className={`
          text-xl font-bold
          ${type === 'current' ? 'text-red-700' : 'text-green-700'}
        `}>
          {type === 'current' ? 'Current Practice' : 'Proposed System'}
        </h3>
      </div>

      {isCurrentEmpty ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
            <span className="text-3xl">🚫</span>
          </div>
          <p className="text-gray-600 text-sm">
            {componentName} does not exist in current practice
          </p>
        </div>
      ) : view ? (
        <>
          <ActionsList actions={view.actions} />
          <ItemsGrid items={view.inputs} title="Inputs" type="input" />
          <ItemsGrid items={view.outputs} title="Outputs" type="output" />
          <ImpactsList impacts={view.impacts} />
          <FinancialSummary text={view.financialImplications} />
        </>
      ) : (
        <p className="text-gray-500 italic">No data available</p>
      )}
    </div>
  );
}

/**
 * Main ComparisonView Component
 */
export function ComparisonView({ componentId }: ComparisonViewProps) {
  const { getComponent } = useSystemData();
  const component = getComponent(componentId);

  if (!component) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-red-600 font-semibold">Component data not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg p-6">
      {/* Header with component icon and name */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <Icon name={componentId} size="lg" className="text-gray-700" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{component.name}</h2>
          <p className="text-sm text-gray-600">System Comparison</p>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <SystemColumn 
          view={component.current as SystemViewData}
          type="current"
          componentName={component.name}
        />
        <SystemColumn 
          view={component.proposed as SystemViewData}
          type="proposed"
          componentName={component.name}
        />
      </div>

      {/* Key Insight */}
      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 Key Insight:</span> The proposed system transforms 
          {componentId === 'anaerobic-digester' || componentId === 'pyrolysis-unit' 
            ? ' waste into valuable resources through ' + component.name
            : ' traditional operations by integrating circular economy principles'
          }.
        </p>
      </div>
    </div>
  );
}