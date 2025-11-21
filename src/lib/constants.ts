/**
 * Constants - Colors, sizes, and configuration values
 */

// Flow Colors (from PRD)
export const FLOW_COLORS = {
  energy: '#E74C3C',      // red
  biochar: '#8E44AD',     // purple
  water: '#3498DB',       // blue
  material: '#27AE60',    // green
  gas: '#F39C12',         // orange
  manure: '#A67C52',      // brown
} as const;

// UI Colors (from PRD)
export const UI_COLORS = {
  primary: '#8B5A3C',     // earth brown
  secondary: '#2D5016',   // forest green
  accent: '#F1C40F',      // highlight yellow
  success: '#2ECC71',     // improvement green
  warning: '#E74C3C',     // problem red
} as const;

// Component names and IDs
export const COMPONENTS = [
  { id: 'chicken-house', name: 'Chicken House' },
  { id: 'processing-plant', name: 'Processing Plant' },
  { id: 'anaerobic-digester', name: 'Anaerobic Digester' },
  { id: 'pyrolysis-unit', name: 'Pyrolysis Unit' },
  { id: 'farm-waterways', name: 'Farm & Waterways' },
] as const;

// Benefit categories
export const BENEFIT_CATEGORIES = [
  { id: 'economic', label: 'Economic', color: '#F1C40F' },
  { id: 'environmental', label: 'Environmental', color: '#2ECC71' },
  { id: 'reuse', label: 'Reuse', color: '#3498DB' },
] as const;

// Performance requirements (from PRD)
export const PERFORMANCE = {
  pageLoadTarget: 2000,        // ms
  hoverResponseTarget: 50,     // ms
  clickResponseTarget: 100,    // ms
  targetFps: 60,
  lighthouseScoreTarget: 90,
} as const;

// Breakpoints (from PRD)
export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1366,
  large: 1920,
} as const;

// Animation durations
export const ANIMATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
} as const;
