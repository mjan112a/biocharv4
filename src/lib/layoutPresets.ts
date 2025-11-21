/**
 * Layout Presets for Hybrid Sankey
 * Predefined node positions for different layout styles
 */

import { HybridLayoutConfig } from './hybridSankeyLayout';
import { PathConfig } from './hybridPathGenerator';

export interface LayoutPreset {
  name: string;
  description: string;
  config: Partial<HybridLayoutConfig>;
  pathConfig?: Partial<PathConfig>;
  nodePositions?: Record<string, { column: number; row: number }>;
}

export const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
  default: {
    name: 'Default',
    description: 'Standard column-based layout with optimal spacing',
    config: {
      columnSpacing: 200,
      rowSpacing: 80,
      padding: {
        top: 80,
        right: 100,
        bottom: 100,
        left: 100
      }
    }
  },
  
  compact: {
    name: 'Compact',
    description: 'Tighter spacing for smaller displays',
    config: {
      columnSpacing: 140,
      rowSpacing: 60,
      padding: {
        top: 60,
        right: 80,
        bottom: 80,
        left: 80
      },
      nodeWidth: 70,
      nodeHeight: 45
    }
  },
  
  wide: {
    name: 'Wide',
    description: 'More horizontal space between columns',
    config: {
      width: 1200,
      columnSpacing: 250,
      rowSpacing: 80,
      padding: {
        top: 80,
        right: 120,
        bottom: 100,
        left: 120
      }
    }
  },
  
  vertical: {
    name: 'Vertical',
    description: 'Taller layout with more vertical spacing',
    config: {
      height: 900,
      columnSpacing: 180,
      rowSpacing: 100,
      padding: {
        top: 100,
        right: 100,
        bottom: 120,
        left: 100
      }
    }
  },
  
  custom: {
    name: 'Custom',
    description: 'User-defined layout saved from previous session',
    config: {}
  }
};

/**
 * Get preset configuration by name
 */
export function getPreset(presetName: string): LayoutPreset {
  return LAYOUT_PRESETS[presetName] || LAYOUT_PRESETS.default;
}

/**
 * Merge preset config with base config
 */
export function applyPreset(
  baseConfig: HybridLayoutConfig,
  presetName: string
): HybridLayoutConfig {
  const preset = getPreset(presetName);
  return {
    ...baseConfig,
    ...preset.config,
    padding: {
      ...baseConfig.padding,
      ...preset.config.padding
    }
  };
}

/**
 * Save custom preset to localStorage
 */
export function saveCustomPreset(
  positions: Record<string, { x: number; y: number; column: number; row: number }>,
  config: Partial<HybridLayoutConfig>
): void {
  const customPreset: LayoutPreset = {
    name: 'Custom',
    description: `Saved on ${new Date().toLocaleDateString()}`,
    config,
    nodePositions: Object.fromEntries(
      Object.entries(positions).map(([id, pos]) => [
        id,
        { column: pos.column, row: pos.row }
      ])
    )
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('hybridSankeyCustomPreset', JSON.stringify(customPreset));
  }
}

/**
 * Load custom preset from localStorage
 */
export function loadCustomPreset(): LayoutPreset | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('hybridSankeyCustomPreset');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse custom preset:', error);
    return null;
  }
}

/**
 * Export layout as JSON file
 */
export function exportLayoutToJSON(
  nodes: any[],
  layoutConfig?: Partial<HybridLayoutConfig>,
  pathConfig?: Partial<PathConfig>
): string {
  const layout = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    layoutConfig,
    pathConfig,
    nodes: nodes.map(n => ({
      id: n.id,
      x: n.x,
      y: n.y,
      column: n.column,
      row: n.row
    }))
  };
  
  return JSON.stringify(layout, null, 2);
}

/**
 * Import layout from JSON
 */
export function importLayoutFromJSON(json: string): {
  nodes: Record<string, { x: number; y: number; column: number; row: number }>;
  layoutConfig?: Partial<HybridLayoutConfig>;
  pathConfig?: Partial<PathConfig>;
} | null {
  try {
    const layout = JSON.parse(json);
    
    if (!layout.nodes || !Array.isArray(layout.nodes)) {
      throw new Error('Invalid layout format');
    }
    
    const nodes: Record<string, { x: number; y: number; column: number; row: number }> = {};
    layout.nodes.forEach((n: any) => {
      nodes[n.id] = {
        x: n.x,
        y: n.y,
        column: n.column || 0,
        row: n.row || 0
      };
    });
    
    return {
      nodes,
      layoutConfig: layout.layoutConfig || layout.config, // Support old format
      pathConfig: layout.pathConfig
    };
  } catch (error) {
    console.error('Failed to import layout:', error);
    return null;
  }
}