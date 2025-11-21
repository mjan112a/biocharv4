/**
 * Tooltip Data Loader
 * 
 * Loads and provides access to tooltip content associated with icons
 */

export interface TooltipContext {
  title: string;
  description?: string;
  performance?: Record<string, any>;
  problems?: string[];
  improvements?: string[];
  benefits?: string[];
  value?: string;
  [key: string]: any;
}

export interface TooltipData {
  title: string;
  short_description?: string;
  contexts?: {
    current?: TooltipContext;
    proposed?: TooltipContext;
    both?: TooltipContext;
    [key: string]: TooltipContext | undefined;
  };
}

export interface TooltipLibrary {
  metadata?: {
    description?: string;
    tooltip_file?: string;
    note?: string;
  };
  tooltips: {
    [iconKey: string]: TooltipData;
  };
}

// Cache for loaded tooltips
let cachedTooltips: TooltipLibrary | null = null;

/**
 * Load tooltip library from JSON
 */
export async function loadTooltipLibrary(): Promise<TooltipLibrary> {
  if (cachedTooltips) {
    return cachedTooltips;
  }

  try {
    const response = await fetch('/data/icon-tooltips.json');
    if (!response.ok) {
      throw new Error('Failed to load tooltip library');
    }
    
    cachedTooltips = await response.json();
    return cachedTooltips!;
  } catch (error) {
    console.error('Error loading tooltip library:', error);
    return { tooltips: {} };
  }
}

/**
 * Get tooltip data for an icon
 * @param iconPath - Full path to icon (e.g., "/images/iconslibrary/biochar-01.svg")
 * @returns Tooltip data or null if not found
 */
export async function getTooltipForIcon(iconPath: string): Promise<TooltipData | null> {
  if (!iconPath) return null;
  
  // Extract filename from path and remove .svg extension
  const filename = iconPath.split('/').pop();
  if (!filename) return null;
  
  const tooltipKey = filename.replace('.svg', '');
  
  const library = await loadTooltipLibrary();
  return library.tooltips[tooltipKey] || null;
}

/**
 * Get tooltip context for a specific system view
 * @param tooltipData - The tooltip data
 * @param context - The context to retrieve (e.g., "current", "proposed")
 * @returns The context data or a default context
 */
export function getTooltipContext(
  tooltipData: TooltipData | null,
  context: 'current' | 'proposed' | 'both' | string = 'proposed'
): TooltipContext | null {
  if (!tooltipData) return null;
  
  // Try to get the specific context
  if (tooltipData.contexts) {
    if (tooltipData.contexts[context]) {
      return tooltipData.contexts[context]!;
    }
    
    // Fallback to 'both' if available
    if (tooltipData.contexts.both) {
      return tooltipData.contexts.both;
    }
    
    // Fallback to any available context
    const firstContext = Object.values(tooltipData.contexts).find(c => c !== undefined);
    if (firstContext) {
      return firstContext;
    }
  }
  
  // Return a minimal context with just the title and description
  return {
    title: tooltipData.title,
    description: tooltipData.short_description,
  };
}