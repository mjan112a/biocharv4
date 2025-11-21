/**
 * Sankey Data Generator
 * Generates Sankey diagram nodes and links from system-comparison.json
 */

export interface SankeyNode {
  id: string;
  label: string;
  value?: number;
  color: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color: string;
  label?: string;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

const COLOR_MAP: Record<string, string> = {
  // Components
  'chicken-house': '#059669',
  'processing-plant': '#3B82F6',
  'anaerobic-digester': '#8B5CF6',
  'pyrolysis-unit': '#F59E0B',
  'farm-waterways': '#10B981',
  
  // Inputs
  'pine': '#8B7355',
  'feed': '#FFA500',
  'fossil': '#DC2626',
  'chickens': '#FFA500',
  
  // Outputs
  'meat': '#10B981',
  'biochar': '#065F46',
  'digestate': '#059669',
  'syngas': '#F59E0B',
  'methane': '#8B5CF6',
  'bio-methane': '#8B5CF6',
  'waste': '#DC2626',
  'emissions': '#991B1B',
  'runoff': '#DC2626',
};

function getNodeColor(id: string, label: string): string {
  if (COLOR_MAP[id]) return COLOR_MAP[id];
  
  const lower = label.toLowerCase();
  if (lower.includes('waste') || lower.includes('emission')) return '#DC2626';
  if (lower.includes('energy') || lower.includes('syngas')) return '#F59E0B';
  if (lower.includes('biochar')) return '#065F46';
  if (lower.includes('digestate')) return '#059669';
  if (lower.includes('methane')) return '#8B5CF6';
  if (lower.includes('meat')) return '#10B981';
  
  return '#6B7280';
}

function materialToNodeId(material: string): string {
  return material.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/,/g, '');
}

function estimateFlowValue(material: string): number {
  const lower = material.toLowerCase();
  
  if (lower.includes('feed') || lower.includes('chicken')) return 2000;
  if (lower.includes('birds') || lower.includes('live')) return 1800;
  if (lower.includes('meat')) return 1300;
  if (lower.includes('litter') || lower.includes('waste')) return 500;
  if (lower.includes('pine') || lower.includes('shavings')) return 500;
  if (lower.includes('digestate')) return 300;
  if (lower.includes('biochar')) return 60;
  if (lower.includes('syngas') || lower.includes('energy')) return 150;
  if (lower.includes('methane') || lower.includes('bio')) return 120;
  if (lower.includes('emissions') || lower.includes('co2')) return 200;
  if (lower.includes('fossil') || lower.includes('fuel')) return 100;
  
  return 100;
}

interface ComponentData {
  name: string;
  current?: {
    inputs?: string[];
    outputs?: string[];
  };
  proposed?: {
    inputs?: string[];
    outputs?: string[];
  };
}

export function generateSankeyData(
  activeComponents: string[],
  componentsData: Record<string, ComponentData>,
  view: 'current' | 'proposed',
  connections: Array<{ source: string; target: string; material: string }>
): SankeyData {
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];
  const nodeIds = new Set<string>();
  
  // Helper to add node if not exists
  const addNode = (id: string, label: string) => {
    if (!nodeIds.has(id)) {
      nodeIds.add(id);
      nodes.push({
        id,
        label,
        color: getNodeColor(id, label),
        value: 1000
      });
    }
  };
  
  // 1. Add component nodes
  activeComponents.forEach(compId => {
    const comp = componentsData[compId];
    if (comp) {
      addNode(compId, comp.name);
    }
  });
  
  // 2. Process each component's inputs and outputs
  activeComponents.forEach(compId => {
    const comp = componentsData[compId];
    if (!comp) return;
    
    const viewData = view === 'current' ? comp.current : comp.proposed;
    if (!viewData) return;
    
    // Add external inputs (materials coming into the system)
    const externalInputs = ['Fresh Pine Shavings', 'Chicken Feed', 'Fossil Fuels', 'Chickens'];
    viewData.inputs?.forEach((input: string) => {
      if (externalInputs.some(ext => input.includes(ext) || ext.includes(input))) {
        const inputId = materialToNodeId(input);
        addNode(inputId, input);
        
        links.push({
          source: inputId,
          target: compId,
          value: estimateFlowValue(input),
          color: getNodeColor(inputId, input)
        });
      }
    });
    
    // Add final outputs (materials leaving the system)
    const componentOutputs = ['Live Chickens', 'Used Poultry Litter', 'Dead Chickens', 'FOG'];
    viewData.outputs?.forEach((output: string) => {
      // Skip intermediate materials that connect to other components
      if (componentOutputs.some(co => output.includes(co) || co.includes(output))) {
        // These are handled by component-to-component connections
        return;
      }
      
      // Final outputs
      const outputId = materialToNodeId(output);
      addNode(outputId, output);
      
      links.push({
        source: compId,
        target: outputId,
        value: estimateFlowValue(output),
        color: getNodeColor(outputId, output)
      });
    });
  });
  
  // 3. Add component-to-component connections
  connections.forEach(conn => {
    links.push({
      source: conn.source,
      target: conn.target,
      value: estimateFlowValue(conn.material),
      color: getNodeColor(conn.source, conn.material),
      label: conn.material
    });
  });
  
  return { nodes, links };
}