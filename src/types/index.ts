/**
 * Type definitions for the Poultry Biochar Circularity System
 */

export type SystemView = 'current' | 'proposed';
export type BenefitCategory = 'environmental' | 'economic' | 'reuse';
export type ComponentName = 'chicken-house' | 'processing-plant' | 'anaerobic-digester' | 'pyrolysis-unit' | 'farm-waterways';
export type FlowType = 'energy' | 'biochar' | 'water' | 'material' | 'gas' | 'manure';

export interface ComponentData {
  id: ComponentName;
  name: string;
  description: string;
  keyMetric: {
    label: string;
    value: string;
  };
  current: {
    description: string;
    inputs: FlowItem[];
    outputs: FlowItem[];
    issues: string[];
  };
  proposed: {
    description: string;
    inputs: FlowItem[];
    outputs: FlowItem[];
    benefits: string[];
  };
}

export interface FlowItem {
  type: FlowType;
  label: string;
  amount?: string;
  icon?: string;
  highlight?: boolean;
  emphasis?: boolean;
  reduction?: boolean;
  description?: string;
}

export interface BenefitData {
  category: BenefitCategory;
  title: string;
  items: {
    title: string;
    description: string;
    metric?: string;
  }[];
}

export interface SystemOverview {
  current: {
    title: string;
    description: string;
    problems: string[];
  };
  proposed: {
    title: string;
    description: string;
    benefits: string[];
  };
}

export interface FlowConnection {
  from: ComponentName;
  to: ComponentName;
  type: FlowType;
  label: string;
}
