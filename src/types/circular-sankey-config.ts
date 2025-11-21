/**
 * Configuration types for Circular Sankey Diagram
 * All adjustable variables exposed through the control panel
 */

export interface NodePosition {
  x: number; // 0-1 relative position
  y: number; // 0-1 relative position
  radius?: number; // Optional: distance from center
}

export interface CanvasConfig {
  width: number;
  height: number;
  aspectRatio: number;
  backgroundColor: string;
}

export interface NodeSizeConfig {
  componentSize: number;
  standardSize: number;
}

export interface FlowConfig {
  minWidth: number;
  widthMultiplier: number;
  widthFormula: 'sqrt' | 'linear' | 'log';
  opacity: number;
}

export interface LabelConfig {
  linkFontSize: number;
  linkOffset: number;
  nodeLabelOffset: number;
  componentFontSize: number;
  standardFontSize: number;
  showLinkLabels: boolean;
  showNodeLabels: boolean;
}

export interface CurveConfig {
  circularCurvature: number;
  returnArcRadius: number; // 0.0-1.0: controls depth of return connector curves (0=center, 1=outer edge)
}

export interface AnimationConfig {
  particleCount: number;
  particleSize: number;
  particleSpeed: number;
  useIcons: boolean;
  enabled: boolean;
}

export interface ColorConfig {
  // Component colors
  'chicken-house': string;
  'processing-plant': string;
  'anaerobic-digester': string;
  'pyrolysis-unit': string;
  'farm': string;
  'land-applied': string;
  'landfill': string;
  
  // Material type colors
  input: string;
  intermediate: string;
  output: string;
  energy: string;
  biochar: string;
  material: string;
  manure: string;
  gas: string;
  waste: string;
}

export interface CircularSankeyConfig {
  canvas: CanvasConfig;
  nodes: {
    sizes: NodeSizeConfig;
    positions: Record<string, NodePosition>;
  };
  flows: FlowConfig;
  labels: LabelConfig;
  curves: CurveConfig;
  colors: ColorConfig;
  animation: AnimationConfig;
}

/**
 * Default configuration based on current CircularSankeyDiagramV2 implementation
 */
export const DEFAULT_CONFIG: CircularSankeyConfig = {
  canvas: {
    width: 900,
    height: 700,
    aspectRatio: 0.78,
    backgroundColor: '#F9FAFB'
  },
  nodes: {
    sizes: {
      componentSize: 50,
      standardSize: 30
    },
    positions: {
      // Main components
      'chicken-house': { x: 0.15, y: 0.5 },
      'processing-plant': { x: 0.5, y: 0.15 },
      'anaerobic-digester': { x: 0.5, y: 0.5 },
      'pyrolysis-unit': { x: 0.85, y: 0.5 },
      'farm': { x: 0.3, y: 0.85 },
      'land-applied': { x: 0.7, y: 0.85 },
      'landfill': { x: 0.9, y: 0.5 },
      
      // Input nodes
      'fresh-pine-shavings': { x: 0.05, y: 0.4, radius: 0.9 },
      'chicken-feed-input': { x: 0.05, y: 0.55, radius: 0.9 },
      'labor-chicken': { x: 0.05, y: 0.65, radius: 0.9 },
      'fossil-fuels': { x: 0.5, y: 0.05, radius: 0.9 },
      'electricity-input': { x: 0.6, y: 0.05, radius: 0.9 },
      'chemical-fertilizers': { x: 0.15, y: 0.9, radius: 0.9 },
      'diesel': { x: 0.25, y: 0.9, radius: 0.9 },
      'labor-farm': { x: 0.2, y: 0.95, radius: 0.9 },
      
      // Intermediate nodes
      'litter-char': { x: 0.25, y: 0.45 },
      'dead-chickens': { x: 0.25, y: 0.55 },
      'used-litter': { x: 0.4, y: 0.6 },
      'live-chickens': { x: 0.32, y: 0.25 },
      'offal-fog': { x: 0.5, y: 0.32 },
      'fog-waste': { x: 0.65, y: 0.25 },
      'digestate-liquids': { x: 0.6, y: 0.7 },
      'digestate-solids': { x: 0.65, y: 0.5 },
      'bio-methane': { x: 0.5, y: 0.25 },
      'syngas': { x: 0.9, y: 0.4 },
      
      // Output/circular nodes
      'biochar': { x: 0.85, y: 0.35 },
      'crops': { x: 0.35, y: 0.75 },
      'meat': { x: 0.65, y: 0.05 },
      
      // Waste nodes
      'ghg-emissions': { x: 0.7, y: 0.05 },
      'water-pollution': { x: 0.5, y: 0.95 },
      'fertilizer-losses': { x: 0.4, y: 0.95 }
    }
  },
  flows: {
    minWidth: 2,
    widthMultiplier: 1.0,
    widthFormula: 'sqrt',
    opacity: 0.6
  },
  labels: {
    linkFontSize: 10,
    linkOffset: -5,
    nodeLabelOffset: 18,
    componentFontSize: 12,
    standardFontSize: 10,
    showLinkLabels: true,
    showNodeLabels: true
  },
  curves: {
    circularCurvature: 0.3,
    returnArcRadius: 0.75  // Default arc radius for return connectors
  },
  colors: {
    'chicken-house': '#059669',
    'processing-plant': '#3B82F6',
    'anaerobic-digester': '#8B5CF6',
    'pyrolysis-unit': '#F59E0B',
    'farm': '#10B981',
    'land-applied': '#06B6D4',
    'landfill': '#991B1B',
    input: '#9CA3AF',
    intermediate: '#6B7280',
    output: '#10B981',
    energy: '#F59E0B',
    biochar: '#065F46',
    material: '#6B7280',
    manure: '#92400E',
    gas: '#8B5CF6',
    waste: '#DC2626'
  },
  animation: {
    particleCount: 5,
    particleSize: 6,
    particleSpeed: 1.0,
    useIcons: true,
    enabled: true
  }
};

/**
 * Preset configurations for different layouts
 */
export const LAYOUT_PRESETS: Record<string, Partial<CircularSankeyConfig>> = {
  circular: {
    nodes: {
      sizes: { componentSize: 50, standardSize: 30 },
      positions: DEFAULT_CONFIG.nodes.positions
    }
  },
  linear: {
    nodes: {
      sizes: { componentSize: 50, standardSize: 30 },
      positions: {
        'chicken-house': { x: 0.1, y: 0.5 },
        'processing-plant': { x: 0.3, y: 0.5 },
        'anaerobic-digester': { x: 0.5, y: 0.5 },
        'pyrolysis-unit': { x: 0.7, y: 0.5 },
        'farm': { x: 0.9, y: 0.5 },
        'land-applied': { x: 0.9, y: 0.7 }
      }
    }
  },
  compact: {
    canvas: {
      width: 700,
      height: 500,
      aspectRatio: 0.71,
      backgroundColor: '#F9FAFB'
    },
    nodes: {
      sizes: { componentSize: 40, standardSize: 25 },
      positions: DEFAULT_CONFIG.nodes.positions
    }
  }
};