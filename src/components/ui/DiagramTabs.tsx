'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabConfig {
  label: string;
  href: string;
  icon: string;
  description: string;
}

const TABS: TabConfig[] = [
  {
    label: 'Circular Flow',
    href: '/',
    icon: '🔄',
    description: 'Circular layout showing system connections'
  },
  {
    label: 'Hybrid Flow',
    href: '/sankey-hybrid',
    icon: '📊',
    description: 'Column-based layout with curved flows'
  },
  {
    label: 'Experimental',
    href: '/sankey-experimental',
    icon: '🧪',
    description: 'Experimental version for testing new ideas'
  }
];

export function DiagramTabs() {
  const pathname = usePathname();

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname === '/sankey-hybrid') return '/sankey-hybrid';
    if (pathname === '/sankey-experimental') return '/sankey-experimental';
    return '/';
  };

  const activeHref = getActiveTab();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1" aria-label="Diagram Views">
          {TABS.map((tab) => {
            const isActive = activeHref === tab.href;
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  group relative px-6 py-4 font-medium text-sm transition-all duration-200
                  ${isActive
                    ? 'text-green-700 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
                
                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                  {tab.description}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}