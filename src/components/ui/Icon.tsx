/**
 * Icon Component - Single reusable icon component
 * Uses the new organized icon system from /images/system-icons/
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import { getIconPath } from '@/lib/iconMapping';

export interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
  '2xl': 96,
  '3xl': 128,
};

export function Icon({ name, size = 'md', className = '' }: IconProps) {
  const pixelSize = sizeMap[size];
  
  // Get icon path from the new icon mapping system
  const iconPath = getIconPath(name);
  
  // Check if we got a real icon path (not the fallback)
  if (iconPath && !iconPath.includes('placeholder.svg')) {
    return (
      <div className={`relative ${className}`} style={{ width: pixelSize, height: pixelSize }}>
        <Image
          src={iconPath}
          alt={name}
          fill
          className="object-contain"
          sizes={`${pixelSize}px`}
        />
      </div>
    );
  }
  
  // Fallback to Lucide icons if no PNG found
  const lucideIconName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  const LucideIcon = (LucideIcons as unknown as Record<string, LucideIcon>)[lucideIconName];
  
  if (LucideIcon) {
    return <LucideIcon size={pixelSize} className={className} />;
  }
  
  // Final fallback
  return <LucideIcons.Circle size={pixelSize} className={className} />;
}
