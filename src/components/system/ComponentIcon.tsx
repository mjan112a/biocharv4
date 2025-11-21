/**
 * Component Icon - Clickable icon with hover tooltip
 * Shows component name, description, and key metric on hover (<50ms)
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { ComponentName } from '@/types';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ComponentIconProps {
  id: ComponentName;
  name: string;
  description: string;
  keyMetric: {
    label: string;
    value: string;
  };
  isActive?: boolean;
}

export function ComponentIcon({ id, name, description, keyMetric, isActive = false }: ComponentIconProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/${id}`);
  };

  // CO2 icon has built-in label, so it needs special handling
  const isCO2 = id === 'co2-input' || id === 'co2';
  const iconSize = isCO2 ? '2xl' : 'xl';
  const showLabel = !isCO2;

  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={handleClick}
            className={`
              group relative p-6 rounded-xl transition-all duration-200
              hover:scale-110 hover:shadow-xl
              focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2
              ${isActive ? 'ring-2 ring-amber-600 shadow-lg' : 'hover:ring-2 hover:ring-amber-400'}
            `}
            style={{
              backgroundColor: 'white',
              border: '2px solid #e5e7eb'
            }}
            aria-label={`View details for ${name}`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="transition-all duration-200 group-hover:text-amber-600">
                <Icon name={id} size={iconSize} />
              </div>
              {showLabel && (
                <span className="text-sm font-semibold text-gray-700 text-center">
                  {name}
                </span>
              )}
            </div>
          </button>
        </Tooltip.Trigger>
        
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 max-w-xs rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-xl"
            sideOffset={5}
          >
            <div className="space-y-2">
              <h4 className="font-bold text-amber-400">{name}</h4>
              <p className="text-gray-300">{description}</p>
              <div className="pt-2 border-t border-gray-700">
                <span className="text-xs text-gray-400">{keyMetric.label}: </span>
                <span className="text-sm font-semibold text-green-400">{keyMetric.value}</span>
              </div>
            </div>
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
