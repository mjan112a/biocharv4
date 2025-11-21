/**
 * Flow Generation Logic
 * Auto-generates diagram flows from system-comparison.json data
 */

import type { 
  FlowPath, 
  ComponentPosition, 
  GeneratedDiagram 
} from '@/types/system-comparison';
import { getIconPath, normalizeIconKey } from './iconMapping';

// Color palette for different flow types
const FLOW_COLORS = {
  input: '#8B7355',        // Brown for inputs
  intermediate: '#059669',  // Green for intermediate products
  waste: '#DC2626',        // Red for waste
  energy: '#F59E0B',       // Orange for energy
  nutrient: '#8B5CF6',     // Purple for nutrients
  product: '#10B981',      // Bright green for final products
  circular: '#065F46',     // Dark green for circular flows
};

/**
 * Determine flow color based on material type
 */
function getFlowColor(material: string): string {
  const normalized = material.toLowerCase();
  
  if (normalized.includes('waste') || normalized.includes('emission') || 
      normalized.includes('runoff') || normalized.includes('fog')) {
    return FLOW_COLORS.waste;
  }
  
  if (normalized.includes('energy') || normalized.includes('syngas') || 
      normalized.includes('methane') || normalized.includes('fuel')) {
    return FLOW_COLORS.energy;
  }
  
  if (normalized.includes('digestate') || normalized.includes('fertilizer') || 
      normalized.includes('nutrient')) {
    return FLOW_COLORS.nutrient;
  }
  
  if (normalized.includes('biochar')) {
    return FLOW_COLORS.circular;
  }
  
  if (normalized.includes('meat') || normalized.includes('crops')) {
    return FLOW_COLORS.product;
  }
  
  if (normalized.includes('chicken') || normalized.includes('litter')) {
    return FLOW_COLORS.intermediate;
  }
  
  return FLOW_COLORS.input;
}

/**
 * Calculate component positions for diagram layout
 */
export function generateComponentPositions(
  componentIds: string[],
  components: Record<string, { name: string; order: number }>,
  width: number = 1000,
  height: number = 600
): ComponentPosition[] {
  const positions: ComponentPosition[] = [];
  const margin = { top: 100, right: 150, bottom: 100, left: 150 };
  
  // Sort by order
  const sorted = componentIds
    .map(id => ({ id, ...components[id] }))
    .sort((a, b) => a.order - b.order);
  
  // Layout strategy based on number of components
  if (sorted.length === 3) {
    // Current system: Vertical layout
    // Chicken House (left), Processing Plant (center), Farm (bottom)
    positions.push(
      {
        id: sorted[0].id,
        name: sorted[0].name,
        x: margin.left,
        y: height / 2,
        order: sorted[0].order
      },
      {
        id: sorted[1].id,
        name: sorted[1].name,
        x: width / 2,
        y: margin.top + 100,
        order: sorted[1].order
      },
      {
        id: sorted[2].id,
        name: sorted[2].name,
        x: width / 2,
        y: height - margin.bottom,
        order: sorted[2].order
      }
    );
  } else if (sorted.length === 5) {
    // Proposed system: Circular layout
    // Positions components in a flow diagram pattern
    positions.push(
      // Chicken House - Left
      {
        id: sorted[0].id,
        name: sorted[0].name,
        x: margin.left,
        y: height / 2,
        order: sorted[0].order
      },
      // Processing Plant - Top Center
      {
        id: sorted[1].id,
        name: sorted[1].name,
        x: width / 2,
        y: margin.top,
        order: sorted[1].order
      },
      // Anaerobic Digester - Center
      {
        id: sorted[2].id,
        name: sorted[2].name,
        x: width / 2,
        y: height / 2,
        order: sorted[2].order
      },
      // Pyrolysis Unit - Right
      {
        id: sorted[3].id,
        name: sorted[3].name,
        x: width - margin.right,
        y: height / 2 - 50,
        order: sorted[3].order
      },
      // Farm & Waterways - Bottom
      {
        id: sorted[4].id,
        name: sorted[4].name,
        x: width / 2,
        y: height - margin.bottom,
        order: sorted[4].order
      }
    );
  } else {
    // Generic grid layout
    const cols = Math.ceil(Math.sqrt(sorted.length));
    const rows = Math.ceil(sorted.length / cols);
    const cellWidth = (width - margin.left - margin.right) / cols;
    const cellHeight = (height - margin.top - margin.bottom) / rows;
    
    sorted.forEach((comp, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      
      positions.push({
        id: comp.id,
        name: comp.name,
        x: margin.left + (col * cellWidth) + (cellWidth / 2),
        y: margin.top + (row * cellHeight) + (cellHeight / 2),
        order: comp.order
      });
    });
  }
  
  return positions;
}

/**
 * Generate flow paths between components based on connections
 */
export function generateFlowPaths(
  connections: Array<{ source: string; target: string; material: string }>,
  positions: ComponentPosition[]
): FlowPath[] {
  const flows: FlowPath[] = [];
  const positionMap = new Map(positions.map(p => [p.id, p]));
  
  connections.forEach((conn, idx) => {
    const sourcePos = positionMap.get(conn.source);
    const targetPos = positionMap.get(conn.target);
    
    if (!sourcePos || !targetPos) return;
    
    const iconKey = normalizeIconKey(conn.material);
    const iconPath = getIconPath(iconKey);
    const color = getFlowColor(conn.material);
    
    flows.push({
      id: `flow-${conn.source}-${conn.target}-${idx}`,
      source: conn.source,
      target: conn.target,
      material: conn.material,
      iconPath,
      color,
      label: conn.material,
      description: `${conn.material} from ${sourcePos.name} to ${targetPos.name}`
    });
  });
  
  return flows;
}

/**
 * Generate external inputs (materials coming from outside the system)
 */
export function generateExternalInputs(
  componentId: string,
  inputs: string[],
  position: ComponentPosition
): FlowPath[] {
  const flows: FlowPath[] = [];
  const inputOffset = 80; // Distance from component
  
  inputs.forEach((input, idx) => {
    const iconKey = normalizeIconKey(input);
    const iconPath = getIconPath(iconKey);
    const color = getFlowColor(input);
    
    // Position inputs coming from the left or top
    const inputX = position.x - inputOffset - (idx * 20);
    const inputY = position.y - (idx * 30);
    
    flows.push({
      id: `input-${componentId}-${idx}`,
      source: `external-${input}`,
      target: componentId,
      material: input,
      iconPath,
      color,
      label: input,
      description: `External input: ${input}`
    });
  });
  
  return flows;
}

/**
 * Generate external outputs (materials leaving the system)
 */
export function generateExternalOutputs(
  componentId: string,
  outputs: string[],
  position: ComponentPosition
): FlowPath[] {
  const flows: FlowPath[] = [];
  const outputOffset = 80;
  
  outputs.forEach((output, idx) => {
    const iconKey = normalizeIconKey(output);
    const iconPath = getIconPath(iconKey);
    const color = getFlowColor(output);
    
    // Position outputs going to the right or bottom
    const outputX = position.x + outputOffset + (idx * 20);
    const outputY = position.y + (idx * 30);
    
    flows.push({
      id: `output-${componentId}-${idx}`,
      source: componentId,
      target: `external-${output}`,
      material: output,
      iconPath,
      color,
      label: output,
      description: `External output: ${output}`
    });
  });
  
  return flows;
}

/**
 * Main function to generate complete diagram
 */
export function generateDiagram(
  view: 'current' | 'proposed',
  activeComponents: string[],
  components: Record<string, { name: string; order: number }>,
  connections: Array<{ source: string; target: string; material: string }>,
  width?: number,
  height?: number
): GeneratedDiagram {
  const positions = generateComponentPositions(activeComponents, components, width, height);
  const flows = generateFlowPaths(connections, positions);
  
  return {
    components: positions,
    flows,
    view
  };
}

/**
 * Helper to identify circular flows (materials that return to earlier components)
 */
export function identifyCircularFlows(flows: FlowPath[]): string[] {
  const circularFlowIds: string[] = [];
  
  flows.forEach(flow => {
    if (flow.material.toLowerCase().includes('biochar') && 
        flow.target.includes('chicken')) {
      circularFlowIds.push(flow.id);
    }
  });
  
  return circularFlowIds;
}

/**
 * Calculate flow metrics for display
 */
export function calculateFlowMetrics(
  flows: FlowPath[]
): {
  totalFlows: number;
  circularFlows: number;
  wasteFlows: number;
  energyFlows: number;
  materialRecovery: number;
} {
  const circularCount = identifyCircularFlows(flows).length;
  const wasteCount = flows.filter(f => f.color === FLOW_COLORS.waste).length;
  const energyCount = flows.filter(f => f.color === FLOW_COLORS.energy).length;
  const totalFlows = flows.length;
  
  // Calculate material recovery percentage (simplified)
  const recoveryFlows = flows.filter(f => 
    f.color === FLOW_COLORS.circular || 
    f.color === FLOW_COLORS.nutrient ||
    f.color === FLOW_COLORS.product
  ).length;
  
  const materialRecovery = totalFlows > 0 ? (recoveryFlows / totalFlows) * 100 : 0;
  
  return {
    totalFlows,
    circularFlows: circularCount,
    wasteFlows: wasteCount,
    energyFlows: energyCount,
    materialRecovery: Math.round(materialRecovery)
  };
}