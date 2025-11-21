/**
 * TypeScript types for system-comparison.json data structure
 */

export interface SystemImpacts {
  benefits: string[];
  detriments: string[];
}

export interface SystemView {
  actions: string[];
  inputs: string[];
  outputs: string[];
  impacts: SystemImpacts;
  financialImplications: string;
}

export interface SystemComponent {
  name: string;
  order: number;
  current: SystemView;
  proposed: SystemView;
}

export interface SystemSummary {
  totalComponents: number;
  activeComponents: string[];
  keyCharacteristics: string[];
}

export interface SystemComparison {
  metadata: {
    title: string;
    description: string;
    lastUpdated: string;
  };
  components: {
    [key: string]: SystemComponent;
  };
  summary: {
    current: SystemSummary;
    proposed: SystemSummary;
    overallComparison: {
      environmentalImpact: string;
      economicImpact: string;
      operationalImpact: string;
    };
  };
}

// Flow types for diagram generation
export interface FlowPath {
  id: string;
  source: string;
  target: string;
  material: string;
  iconPath?: string;
  color: string;
  label?: string;
  description?: string;
}

export interface ComponentPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  order: number;
}

export interface GeneratedDiagram {
  components: ComponentPosition[];
  flows: FlowPath[];
  view: 'current' | 'proposed';
}

// Icon mapping types
export type IconCategory = 
  | 'component'
  | 'input'
  | 'output'
  | 'intermediate'
  | 'energy';

export interface IconInfo {
  name: string;
  filename: string;
  path: string;
  category: IconCategory;
  description?: string;
}

export interface IconMapping {
  [key: string]: IconInfo;
}