// Sankey Flow Builder Types

export interface BuilderNode {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  width?: number;
  height?: number;
  depth?: number;  // Auto-calculated by sankey layout
  value?: number;  // Auto-calculated from links
  type?: string;   // Node type for theming (input, component, output, energy, waste, etc.)
  icon?: string;   // Optional icon/image path
  iconOnly?: boolean;  // If true, shows only icon without background/border
  showLabel?: boolean; // If false, hides the text label (default: true)
  fontSize?: number;   // Label font size in pixels (default: 12)
}

export interface BuilderLink {
  id: string;
  source: string;  // node id
  target: string;  // node id
  value: number;   // thickness/flow amount
  color: string;
  label?: string;
  // Animation properties
  animationRate?: number;      // Speed: 1-20 (default: 5)
  animationFrequency?: number; // Flow rate/frequency: 1-50 (default: 5)
  animationSize?: number;      // Dot/icon size: 2-20 (default: 4)
  arcRadius?: number;          // For return connectors: 0.0-1.0 controls curve depth (default: 0.5)
  returnY?: number;            // Vertical position of return connector bottom line (default: 150)
  // Icon particle animation properties
  particleType?: 'dot' | 'icon';  // Type of particle to animate (default: 'dot')
  particleIcon?: string;          // Custom icon path/URL for icon particles
  particleIconSource?: 'dot' | 'source' | 'target' | 'custom';  // Where to get icon from (default: 'dot')
  // Curve control for draggable links
  curveOffset?: number;        // Offset for curve control point (-200 to 200, default: 0 = straight)
  // These will be added by d3-sankey
  width?: number;
  circular?: boolean;
}

export interface BoundaryCircle {
  id: string;
  name: string;  // Label for the boundary
  centerX: number;  // Center X coordinate
  centerY: number;  // Center Y coordinate
  radius: number;   // Radius of the circle
  color?: string;   // Stroke color (default: gray)
  strokeWidth?: number;  // Line width (default: 2)
  strokeDasharray?: string;  // Dash pattern (default: "5,5" for dotted)
  opacity?: number;  // Opacity (default: 0.5)
  showLabel?: boolean;  // Show label (default: true)
}

export interface DiagramConfig {
  width: number;
  height: number;
  nodePadding: number;
  nodeWidth: number;
  circularLinkGap: number;
  boundaryCircles?: BoundaryCircle[];  // Optional boundary circles
}

export interface DiagramData {
  nodes: BuilderNode[];
  links: BuilderLink[];
  config: DiagramConfig;
}

export type EditorMode = 'edit' | 'preview';

export interface SelectedItem {
  type: 'node' | 'link';
  id: string;
}