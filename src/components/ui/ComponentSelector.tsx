'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const COMPONENTS = [
  { id: 'farm', label: 'Farm Operations', icon: '🏡' },
  { id: 'chicken-house', label: 'Chicken House', icon: '🏠' },
  { id: 'processing-plant', label: 'Processing Plant', icon: '🏭' },
  { id: 'waterways', label: 'Waterways', icon: '💧' },
  { id: 'anaerobic-digester', label: 'Anaerobic Digester', icon: '🧪' },
  { id: 'pyrolysis-unit', label: 'Pyrolysis Unit', icon: '🔥' },
];

export function ComponentSelector() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract current component from pathname
  const currentComponent = pathname?.split('/').pop();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const componentId = e.target.value;
    router.push(`/details/${componentId}`);
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 font-medium hidden sm:inline-block">Jump to:</span>
        <select
          value={currentComponent || ''}
          onChange={handleChange}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm bg-white text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <option value="" disabled>Select Component...</option>
          {COMPONENTS.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.icon} {comp.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}