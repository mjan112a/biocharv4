// Sankey Flow Builder - Default Theme Presets

import { DiagramTheme, ThemePreset } from '@/types/builder-theme';

/**
 * Default/Neutral Theme
 */
export const defaultTheme: DiagramTheme = {
  id: 'default-theme',
  name: 'Default',
  version: '1.0.0',
  description: 'Clean, neutral theme suitable for any diagram type',
  author: 'System',
  created: new Date().toISOString(),
  modified: new Date().toISOString(),
  tags: ['default', 'neutral', 'basic'],
  isBuiltIn: true,
  
  defaults: {
    node: {
      shape: 'rounded-rect',
      borderRadius: 8,
      iconPosition: 'above',
      iconSize: 32,
      iconOpacity: 1,
      fillColor: '#ffffff',
      strokeColor: '#94a3b8',
      strokeWidth: 2,
      opacity: 1,
      fontSize: 14,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '500',
      textColor: '#1e293b',
      textPosition: 'center',
      shadow: {
        enabled: true,
        blur: 4,
        offset: { x: 0, y: 2 },
        color: '#000000',
        opacity: 0.1
      },
      hoverEffect: {
        enabled: true,
        scale: 1.05,
        shadowBlur: 8
      }
    },
    link: {
      color: '#64748b',
      thickness: 4,
      opacity: 0.6,
      curvature: 0.5,
      labelIconPosition: 'none',
      labelFontSize: 11,
      labelFontWeight: '500',
      labelColor: '#475569',
      labelBackground: '#ffffff',
      labelBackgroundOpacity: 0.9,
      labelPadding: 6,
      labelBorderRadius: 4,
      particleSize: 4,
      particleOpacity: 0.8,
      particleSpeed: 5,
      particleFrequency: 5,
      hoverEffect: {
        enabled: true,
        thicknessMultiplier: 1.5,
        opacityBoost: 0.3
      }
    },
    canvas: {
      backgroundColor: '#f8fafc',
      gridEnabled: true,
      gridColor: '#e2e8f0',
      gridSize: 20,
      gridOpacity: 0.5,
      gridPattern: 'lines'
    }
  },
  
  nodeStyles: {},
  linkStyles: {},
  assets: [],
  
  thumbnail: '/themes/default-preview.png'
};

/**
 * Biochar Energy Flow Theme
 */
export const biocharEnergyTheme: DiagramTheme = {
  id: 'biochar-energy-theme',
  name: 'Biochar Energy Flow',
  version: '1.0.0',
  description: 'Optimized for biochar production and energy system diagrams',
  author: 'System',
  created: new Date().toISOString(),
  modified: new Date().toISOString(),
  tags: ['biochar', 'energy', 'sustainability'],
  isBuiltIn: true,
  
  defaults: {
    node: {
      shape: 'rounded-rect',
      borderRadius: 12,
      iconPosition: 'above',
      iconSize: 48,
      iconOpacity: 1,
      fillColor: '#ffffff',
      strokeColor: '#334155',
      strokeWidth: 2,
      opacity: 1,
      fontSize: 13,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '600',
      textColor: '#1e293b',
      textPosition: 'center',
      shadow: {
        enabled: true,
        blur: 6,
        offset: { x: 0, y: 3 },
        color: '#000000',
        opacity: 0.15
      },
      hoverEffect: {
        enabled: true,
        scale: 1.08,
        shadowBlur: 12
      }
    },
    link: {
      color: '#64748b',
      thickness: 5,
      opacity: 0.7,
      curvature: 0.5,
      labelIconPosition: 'above',
      labelIconSize: 20,
      labelFontSize: 11,
      labelFontWeight: '600',
      labelColor: '#475569',
      labelBackground: '#ffffff',
      labelBackgroundOpacity: 0.95,
      labelPadding: 8,
      labelBorderRadius: 6,
      particleSize: 4,
      particleOpacity: 0.85,
      particleSpeed: 5,
      particleFrequency: 3,
      particleGlow: true,
      hoverEffect: {
        enabled: true,
        thicknessMultiplier: 1.4,
        opacityBoost: 0.2
      }
    },
    canvas: {
      backgroundColor: '#f8fafc',
      gridEnabled: true,
      gridColor: '#cbd5e1',
      gridSize: 25,
      gridOpacity: 0.4,
      gridPattern: 'dots'
    }
  },
  
  nodeTypes: {
    'input': {
      fillColor: '#dbeafe',
      strokeColor: '#3b82f6',
      strokeWidth: 3,
      icon: '/images/system-icons/inputs/fresh-pine-shavings.png'
    },
    'process': {
      fillColor: '#fef3c7',
      strokeColor: '#f59e0b',
      strokeWidth: 3,
      icon: '/images/system-icons/components/pyrolysis-unit.png'
    },
    'output': {
      fillColor: '#dcfce7',
      strokeColor: '#22c55e',
      strokeWidth: 3,
      icon: '/images/system-icons/outputs/biochar.svg'
    },
    'component': {
      fillColor: '#f3e8ff',
      strokeColor: '#a855f7',
      strokeWidth: 3,
      shape: 'hexagon'
    },
    'storage': {
      fillColor: '#e0f2fe',
      strokeColor: '#0ea5e9',
      strokeWidth: 2,
      shape: 'circle'
    }
  },
  
  linkTypes: {
    'material-flow': {
      color: '#8b5cf6',
      thickness: 6,
      particleAsset: '/images/flow-icons/litter.svg',
      gradient: {
        enabled: true,
        startColor: '#8b5cf6',
        endColor: '#a78bfa'
      }
    },
    'energy-flow': {
      color: '#f59e0b',
      thickness: 5,
      particleAsset: '/images/flow-icons/syngas.svg',
      dashed: {
        enabled: true,
        pattern: [8, 4],
        animated: true
      }
    },
    'waste-flow': {
      color: '#ef4444',
      thickness: 4,
      opacity: 0.6,
      particleAsset: '/images/flow-icons/waste.svg'
    },
    'water-flow': {
      color: '#06b6d4',
      thickness: 4,
      particleAsset: '/images/system-icons/inputs/water.png'
    }
  },
  
  nodeStyles: {},
  linkStyles: {},
  assets: [],
  
  thumbnail: '/themes/biochar-preview.png'
};

/**
 * Material Cycle Theme
 */
export const materialCycleTheme: DiagramTheme = {
  id: 'material-cycle-theme',
  name: 'Material Cycle',
  version: '1.0.0',
  description: 'Circular economy and material flow diagrams',
  author: 'System',
  created: new Date().toISOString(),
  modified: new Date().toISOString(),
  tags: ['circular-economy', 'recycling', 'sustainability'],
  isBuiltIn: true,
  
  defaults: {
    node: {
      shape: 'circle',
      iconPosition: 'inside',
      iconSize: 40,
      fillColor: '#ffffff',
      strokeColor: '#059669',
      strokeWidth: 3,
      fontSize: 12,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '600',
      textColor: '#064e3b',
      textPosition: 'center',
      shadow: {
        enabled: true,
        blur: 8,
        offset: { x: 0, y: 2 },
        color: '#059669',
        opacity: 0.2
      }
    },
    link: {
      color: '#10b981',
      thickness: 6,
      opacity: 0.7,
      curvature: 0.6,
      labelIconPosition: 'inline',
      labelFontSize: 10,
      labelColor: '#065f46',
      labelBackground: '#d1fae5',
      labelPadding: 6,
      labelBorderRadius: 8,
      particleSize: 5,
      particleOpacity: 0.8,
      particleSpeed: 4,
      particleFrequency: 4,
      dashed: {
        enabled: true,
        pattern: [10, 5],
        animated: true
      }
    },
    canvas: {
      backgroundColor: '#f0fdf4',
      gridEnabled: false,
      gridColor: '#bbf7d0',
      gridSize: 30,
      gridPattern: 'cross'
    }
  },
  
  nodeTypes: {
    'source': {
      fillColor: '#dcfce7',
      strokeColor: '#16a34a'
    },
    'process': {
      fillColor: '#fef3c7',
      strokeColor: '#ca8a04'
    },
    'destination': {
      fillColor: '#dbeafe',
      strokeColor: '#2563eb'
    }
  },
  
  linkTypes: {
    'forward': {
      color: '#10b981'
    },
    'recycle': {
      color: '#f59e0b',
      dashed: { enabled: false, pattern: [] }
    }
  },
  
  nodeStyles: {},
  linkStyles: {},
  assets: [],
  
  thumbnail: '/themes/material-cycle-preview.png'
};

/**
 * Process Flow Theme
 */
export const processFlowTheme: DiagramTheme = {
  id: 'process-flow-theme',
  name: 'Process Flow',
  version: '1.0.0',
  description: 'Clean theme for business process and workflow diagrams',
  author: 'System',
  created: new Date().toISOString(),
  modified: new Date().toISOString(),
  tags: ['process', 'workflow', 'business'],
  isBuiltIn: true,
  
  defaults: {
    node: {
      shape: 'rectangle',
      iconPosition: 'left',
      iconSize: 28,
      fillColor: '#f1f5f9',
      strokeColor: '#475569',
      strokeWidth: 2,
      fontSize: 13,
      fontFamily: 'system-ui, sans-serif',
      fontWeight: '500',
      textColor: '#0f172a',
      textPosition: 'center',
      shadow: {
        enabled: false,
        blur: 0,
        offset: { x: 0, y: 0 },
        color: '#000000'
      }
    },
    link: {
      color: '#64748b',
      thickness: 3,
      opacity: 0.8,
      curvature: 0.3,
      labelIconPosition: 'none',
      labelFontSize: 11,
      labelColor: '#334155',
      labelBackground: '#ffffff',
      labelPadding: 5,
      labelBorderRadius: 3,
      particleSize: 3,
      particleOpacity: 0.7,
      particleSpeed: 6,
      particleFrequency: 2
    },
    canvas: {
      backgroundColor: '#ffffff',
      gridEnabled: true,
      gridColor: '#e2e8f0',
      gridSize: 20,
      gridOpacity: 0.3,
      gridPattern: 'lines'
    }
  },
  
  nodeTypes: {
    'start': {
      shape: 'rounded-rect',
      fillColor: '#dcfce7',
      strokeColor: '#16a34a',
      borderRadius: 20
    },
    'process': {
      fillColor: '#dbeafe',
      strokeColor: '#2563eb'
    },
    'decision': {
      shape: 'hexagon',
      fillColor: '#fef3c7',
      strokeColor: '#ca8a04'
    },
    'end': {
      shape: 'rounded-rect',
      fillColor: '#fee2e2',
      strokeColor: '#dc2626',
      borderRadius: 20
    }
  },
  
  linkTypes: {
    'normal': {
      color: '#64748b'
    },
    'yes': {
      color: '#22c55e'
    },
    'no': {
      color: '#ef4444'
    }
  },
  
  nodeStyles: {},
  linkStyles: {},
  assets: [],
  
  thumbnail: '/themes/process-flow-preview.png'
};

/**
 * All built-in theme presets
 */
export const themePresets: ThemePreset[] = [
  {
    id: 'default-theme',
    name: 'Default',
    description: 'Clean, neutral theme suitable for any diagram type',
    thumbnail: '/themes/default-preview.png',
    category: 'general',
    tags: ['default', 'neutral', 'basic'],
    theme: defaultTheme
  },
  {
    id: 'biochar-energy-theme',
    name: 'Biochar Energy Flow',
    description: 'Optimized for biochar production and energy system diagrams',
    thumbnail: '/themes/biochar-preview.png',
    category: 'energy',
    tags: ['biochar', 'energy', 'sustainability'],
    theme: biocharEnergyTheme
  },
  {
    id: 'material-cycle-theme',
    name: 'Material Cycle',
    description: 'Circular economy and material flow diagrams',
    thumbnail: '/themes/material-cycle-preview.png',
    category: 'material',
    tags: ['circular-economy', 'recycling', 'sustainability'],
    theme: materialCycleTheme
  },
  {
    id: 'process-flow-theme',
    name: 'Process Flow',
    description: 'Clean theme for business process and workflow diagrams',
    thumbnail: '/themes/process-flow-preview.png',
    category: 'process',
    tags: ['process', 'workflow', 'business'],
    theme: processFlowTheme
  }
];

/**
 * Get theme by ID
 */
export function getThemeById(id: string): DiagramTheme | undefined {
  const preset = themePresets.find(p => p.id === id);
  return preset?.theme;
}

/**
 * Get theme presets by category
 */
export function getThemesByCategory(category: ThemePreset['category']): ThemePreset[] {
  return themePresets.filter(p => p.category === category);
}

/**
 * Search themes by tag
 */
export function searchThemesByTag(tag: string): ThemePreset[] {
  return themePresets.filter(p => p.tags.includes(tag.toLowerCase()));
}