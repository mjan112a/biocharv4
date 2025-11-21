// Sankey Flow Builder - Theme System Types

/**
 * Asset types for custom SVG elements
 */
export type AssetType = 'node-icon' | 'flow-particle' | 'connector-icon';

/**
 * Theme asset definition
 */
export interface ThemeAsset {
  id: string;
  name: string;
  type: AssetType;
  path: string;  // URL or data URI
  svgContent?: string;  // Embedded SVG for custom uploads
  category?: string;  // e.g., 'energy', 'material', 'component'
  tags?: string[];
  preview?: string;  // Small preview image
}

/**
 * Node visual shape options
 */
export type NodeShape = 'rectangle' | 'rounded-rect' | 'circle' | 'hexagon' | 'custom-svg';

/**
 * Icon positioning relative to node
 */
export type IconPosition = 'above' | 'inside' | 'left' | 'right' | 'below';

/**
 * Text positioning within node
 */
export type TextPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

/**
 * Gradient configuration
 */
export interface GradientStyle {
  type: 'linear' | 'radial';
  angle?: number;  // For linear gradients (0-360)
  stops: Array<{ offset: number; color: string }>;
}

/**
 * Shadow/glow effect
 */
export interface ShadowStyle {
  enabled: boolean;
  blur: number;
  offset: { x: number; y: number };
  color: string;
  opacity?: number;
}

/**
 * Node styling configuration
 */
export interface NodeThemeStyle {
  // Shape
  shape: NodeShape;
  width?: number;
  height?: number;
  borderRadius?: number;  // For rounded-rect
  
  // Icon
  icon?: string;  // Asset ID or path
  iconPosition: IconPosition;
  iconSize: number;
  iconOpacity?: number;
  
  // Colors & effects
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity?: number;
  gradient?: GradientStyle;
  shadow?: ShadowStyle;
  
  // Typography
  fontSize: number;
  fontFamily: string;
  fontWeight: string | number;
  textColor: string;
  textPosition: TextPosition;
  textShadow?: boolean;
  
  // Hover/interaction
  hoverEffect?: {
    enabled: boolean;
    scale?: number;
    shadowBlur?: number;
  };
}

/**
 * Dash pattern configuration
 */
export interface DashPattern {
  enabled: boolean;
  pattern: number[];  // e.g., [5, 3] for SVG stroke-dasharray
  animated?: boolean;
}

/**
 * Label icon positioning
 */
export type LabelIconPosition = 'above' | 'inline' | 'below' | 'none';

/**
 * Link styling configuration
 */
export interface LinkThemeStyle {
  // Path styling
  color: string;
  thickness: number;
  opacity?: number;
  curvature: number;  // 0-1, affects bezier curve intensity
  dashed?: DashPattern;
  gradient?: {
    enabled: boolean;
    startColor: string;
    endColor: string;
  };
  
  // Label styling
  labelIcon?: string;  // Asset ID or path
  labelIconPosition: LabelIconPosition;
  labelIconSize?: number;
  labelFontSize: number;
  labelFontWeight?: string | number;
  labelColor: string;
  labelBackground?: string;
  labelBackgroundOpacity?: number;
  labelPadding: number;
  labelBorderRadius?: number;
  
  // Animation styling
  particleAsset?: string;  // Asset ID for custom flow particle
  particleSize: number;
  particleOpacity: number;
  particleSpeed: number;
  particleFrequency: number;
  particleGlow?: boolean;
  
  // Hover/interaction
  hoverEffect?: {
    enabled: boolean;
    thicknessMultiplier?: number;
    opacityBoost?: number;
  };
}

/**
 * Canvas/background styling
 */
export interface CanvasStyle {
  backgroundColor: string;
  backgroundImage?: string;  // URL or data URI
  gridEnabled: boolean;
  gridColor: string;
  gridSize: number;
  gridOpacity?: number;
  gridPattern?: 'dots' | 'lines' | 'cross';
}

/**
 * Complete diagram theme
 */
export interface DiagramTheme {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  created: string;
  modified: string;
  tags?: string[];
  
  // Global defaults
  defaults: {
    node: NodeThemeStyle;
    link: LinkThemeStyle;
    canvas: CanvasStyle;
  };
  
  // Per-item overrides (optional)
  nodeStyles: Record<string, Partial<NodeThemeStyle>>;  // nodeId -> style
  linkStyles: Record<string, Partial<LinkThemeStyle>>;  // linkId -> style
  
  // Type-based styling (alternative to per-item)
  nodeTypes?: Record<string, Partial<NodeThemeStyle>>;  // type -> style
  linkTypes?: Record<string, Partial<LinkThemeStyle>>;  // type -> style
  
  // Asset library reference
  assets: ThemeAsset[];
  
  // Metadata
  thumbnail?: string;  // Preview image
  isBuiltIn?: boolean;  // System theme vs user theme
}

/**
 * Extended builder node with theme support
 */
export interface StyledBuilderNode {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;  // Backward compatibility
  width?: number;
  height?: number;
  
  // Theme additions
  type?: string;  // e.g., 'input', 'process', 'output', 'storage'
  styleOverride?: Partial<NodeThemeStyle>;
}

/**
 * Extended builder link with theme support
 */
export interface StyledBuilderLink {
  id: string;
  source: string;
  target: string;
  value: number;
  color: string;  // Backward compatibility
  label?: string;
  
  // Animation (existing)
  animationRate?: number;
  animationFrequency?: number;
  animationSize?: number;
  
  // Theme additions
  type?: string;  // e.g., 'material-flow', 'energy-flow', 'waste', 'data'
  styleOverride?: Partial<LinkThemeStyle>;
}

/**
 * Theme with diagram data
 */
export interface ThemedDiagramData {
  nodes: StyledBuilderNode[];
  links: StyledBuilderLink[];
  theme: DiagramTheme;
  config?: {
    width: number;
    height: number;
  };
}

/**
 * Theme preset metadata
 */
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'general' | 'energy' | 'material' | 'process' | 'custom';
  tags: string[];
  theme: DiagramTheme;
}