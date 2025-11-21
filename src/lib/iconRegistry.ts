/**
 * Icon Registry - Central configuration for icon management
 * This file controls whether to use placeholder (Lucide) or custom SVG icons
 * Changing icons later requires only updating this config file
 */

export type IconSource = 'placeholder' | 'custom';

export interface IconConfig {
  source: IconSource;
  placeholderMapping: Record<string, string>; // component name -> Lucide icon name
  customMapping: Record<string, string>; // component name -> custom SVG filename
}

export const ICON_CONFIG: IconConfig = {
  // Change this to 'custom' when ready to use custom SVG icons
  source: 'placeholder',
  
  // Mapping for placeholder icons (Lucide React)
  placeholderMapping: {
    'chicken-house': 'Home',
    'processing-plant': 'Factory',
    'anaerobic-digester': 'FlaskConical',
    'pyrolysis-unit': 'Flame',
    'farm-waterways': 'Sprout',
  },
  
  // Mapping for custom SVG icons (future)
  customMapping: {
    'chicken-house': 'chicken-house.svg',
    'processing-plant': 'processing-plant.svg',
    'anaerobic-digester': 'anaerobic-digester.svg',
    'pyrolysis-unit': 'pyrolysis-unit.svg',
    'farm-waterways': 'farm-waterways.svg',
  },
};

/**
 * Get the icon identifier for a component
 * @param componentName - The name of the component
 * @returns The icon identifier (Lucide name or SVG filename)
 */
export function getIconIdentifier(componentName: string): string {
  if (ICON_CONFIG.source === 'placeholder') {
    return ICON_CONFIG.placeholderMapping[componentName] || 'Circle';
  }
  return ICON_CONFIG.customMapping[componentName] || 'default.svg';
}

/**
 * Check if using placeholder icons
 */
export function isUsingPlaceholder(): boolean {
  return ICON_CONFIG.source === 'placeholder';
}
