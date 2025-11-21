'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const COMPONENTS = [
  { id: 'farm', label: 'Farm Operations' },
  { id: 'chicken-house', label: 'Chicken House' },
  { id: 'processing-plant', label: 'Processing Plant' },
  { id: 'anaerobic-digester', label: 'Anaerobic Digester' },
  { id: 'pyrolysis-unit', label: 'Pyrolysis Unit' },
  { id: 'waterways', label: 'Waterways' },
];

export function ComponentNavigation() {
  const pathname = usePathname();
  
  // Check if we are on a detail page
  const isDetailPage = pathname?.startsWith('/details/');
  const currentSlug = isDetailPage ? pathname.split('/').pop() : null;

  if (!isDetailPage) return null;

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-4">
      {/* Vertical Line */}
      <div className="absolute top-0 bottom-0 w-px bg-border -z-10" />

      {COMPONENTS.map((comp, index) => {
        const isActive = currentSlug === comp.id;
        return (
          <Link
            key={comp.id}
            href={`/details/${comp.id}`}
            className="group relative flex items-center justify-center"
            title={comp.label}
          >
            {/* Dot */}
            <div 
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                isActive 
                  ? 'bg-primary border-primary scale-125' 
                  : 'bg-background border-muted-foreground/50 group-hover:border-primary group-hover:bg-primary/20'
              }`} 
            />
            
            {/* Label (Toolip-style on hover) */}
            <div className="absolute right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              <span className="bg-popover text-popover-foreground text-xs font-medium px-2 py-1 rounded shadow-sm border border-border">
                {comp.label}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
