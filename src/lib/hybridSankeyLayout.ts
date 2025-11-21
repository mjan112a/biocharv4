/**
 * Hybrid Sankey Layout Engine
 * Positions nodes in vertical columns with intelligent spacing
 * for optimal flow path visualization
 */

export interface HybridNode {
  id: string;
  name: string;
  type: 'component' | 'input' | 'intermediate' | 'output' | 'energy' | 'waste';
  value?: number;
  column: number;      // Which column (0-based)
  row: number;         // Position within column (0-based)
  x: number;           // Calculated pixel position
  y: number;           // Calculated pixel position
  width: number;       // Node width
  height: number;      // Node height
  color: string;
  icon?: string;
}

export interface HybridLink {
  source: HybridNode;
  target: HybridNode;
  value: number;
  type: string;
  label: string;
  color: string;
  circular?: boolean;  // Is this a return/circular flow?
}

export interface ColumnConfig {
  index: number;
  x: number;           // X position of column center
  nodeIds: string[];   // Nodes in this column
  spacing: number;     // Vertical spacing between nodes
}

export interface HybridLayoutConfig {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  nodeWidth: number;
  nodeHeight: number;
  columnSpacing: number;
  rowSpacing: number;
}

const DEFAULT_LAYOUT_CONFIG: HybridLayoutConfig = {
  width: 1000,
  height: 700,
  padding: {
    top: 80,
    right: 100,
    bottom: 100,
    left: 100
  },
  nodeWidth: 80,
  nodeHeight: 50,
  columnSpacing: 200,
  rowSpacing: 80
};
/**
 * Get flow color based on type
 */
function getFlowColor(type: string): string {
  const typeColors: Record<string, string> = {
    'gas': '#93C5FD',          // Light blue
    'manure': '#92400E',       // Brown
    'biochar': '#065F46',      // Dark green
    'material': '#6B7280',     // Gray
    'energy': '#F59E0B',       // Orange
    'waste': '#DC2626',        // Red
    'water': '#3B82F6',        // Blue
    'feed': '#FFA500',         // Orange
    'meat': '#EF4444',         // Red
  };
  
  return typeColors[type] || '#6B7280'; // Default gray
}


/**
 * Node classification for column assignment
 */
const NODE_COLUMN_MAPPING: Record<string, number> = {
  // Column 0: Inputs
  'fresh-pine-shavings': 0,
  'chicken-feed': 0,
  'water-input': 0,
  'fossil-fuels': 0,
  'electricity-input': 0,
  'liquid-co2': 0,
  
  // Column 1: Primary production
  'chicken-house': 1,
  
  // Column 2: Intermediate processing
  'used-poultry-litter': 2,
  'dead-chickens': 2,
  'litter-char': 2,
  'live-chickens': 2,
  
  // Column 3: Processing plant
  'processing-plant': 3,
  'offal-fog': 3,
  
  // Column 4: Treatment systems
  'anaerobic-digester': 4,
  'pyrolysis-unit': 4,
  
  // Column 5: Products and outputs
  'meat': 5,
  'biochar': 5,
  'bio-methane': 5,
  'syngas': 5,
  'digestate-liquids': 5,
  'digestate-solids': 5,
  'wood-vinegars': 5,
  
  // Column 6: End uses
  'farm-waterways': 6,
  'crops': 6,
  
  // Waste/emissions (positioned based on source)
  'ammonia-emissions': 2,
  'ghg-emissions': 2,
  'ghg-emissions-chicken': 2,
  'fertilizer-losses': 6,
  'water-pollution': 6
};

/**
 * Calculate column-based layout for nodes
 */
export function calculateHybridLayout(
  nodes: any[],
  links: any[],
  config: Partial<HybridLayoutConfig> = {}
): { nodes: HybridNode[]; links: HybridLink[]; columns: ColumnConfig[] } {
  const layoutConfig = { ...DEFAULT_LAYOUT_CONFIG, ...config };
  
  // Guard against undefined/null inputs
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    console.warn('calculateHybridLayout: Invalid nodes array');
    return { nodes: [], links: [], columns: [] };
  }
  
  if (!links || !Array.isArray(links)) {
    console.warn('calculateHybridLayout: Invalid links array');
    links = []; // Default to empty array
  }
  
  // Step 1: Assign nodes to columns
  const columnMap = new Map<number, HybridNode[]>();
  const nodeMap = new Map<string, HybridNode>();
  
  // Initialize columns
  for (let i = 0; i <= 6; i++) {
    columnMap.set(i, []);
  }
  
  // Assign nodes to columns
  nodes.forEach(node => {
    const column = NODE_COLUMN_MAPPING[node.id] ?? 3; // Default to middle
    const nodeType = node.type || 'intermediate';
    
    // Component nodes are larger (with boxes), others are smaller (just icons)
    const isComponent = nodeType === 'component';
    const nodeWidth = isComponent ? layoutConfig.nodeWidth : layoutConfig.nodeWidth * 0.5;
    const nodeHeight = isComponent ? layoutConfig.nodeHeight : layoutConfig.nodeHeight * 0.6;
    
    // Set colors based on type: inputs blue, outputs black, components keep their color
    let nodeColor = node.color || '#6B7280';
    if (nodeType === 'input') {
      nodeColor = '#3B82F6'; // Blue for inputs
    } else if (nodeType === 'output') {
      nodeColor = '#1F2937'; // Black/dark gray for outputs
    }
    
    const hybridNode: HybridNode = {
      id: node.id,
      name: node.name,
      type: nodeType,
      value: node.value,
      column,
      row: 0, // Will be calculated
      x: 0,   // Will be calculated
      y: 0,   // Will be calculated
      width: nodeWidth,
      height: nodeHeight,
      color: nodeColor,
      icon: node.icon
    };
    
    columnMap.get(column)?.push(hybridNode);
    nodeMap.set(node.id, hybridNode);
  });
  
  // Step 2: Calculate positions within each column
  const columns: ColumnConfig[] = [];
  const usableWidth = layoutConfig.width - layoutConfig.padding.left - layoutConfig.padding.right;
  const numColumns = 7;
  const columnWidth = usableWidth / (numColumns - 1);
  
  columnMap.forEach((columnNodes, columnIndex) => {
    if (columnNodes.length === 0) return;
    
    // Calculate column X position
    const columnX = layoutConfig.padding.left + (columnIndex * columnWidth);
    
    // Calculate vertical spacing for this column
    const usableHeight = layoutConfig.height - layoutConfig.padding.top - layoutConfig.padding.bottom;
    const totalNodeHeight = columnNodes.length * layoutConfig.nodeHeight;
    const totalSpacing = (columnNodes.length - 1) * layoutConfig.rowSpacing;
    
    // Center the column vertically if there's extra space
    const startY = layoutConfig.padding.top + Math.max(0, (usableHeight - totalNodeHeight - totalSpacing) / 2);
    
    // Position nodes within column
    columnNodes.forEach((node, rowIndex) => {
      node.row = rowIndex;
      node.x = columnX;
      node.y = startY + (rowIndex * (layoutConfig.nodeHeight + layoutConfig.rowSpacing));
    });
    
    columns.push({
      index: columnIndex,
      x: columnX,
      nodeIds: columnNodes.map(n => n.id),
      spacing: layoutConfig.rowSpacing
    });
  });
  
  // Step 3: Create hybrid links with source/target references
  const hybridLinks: HybridLink[] = links.map(link => {
    const sourceNode = nodeMap.get(link.source) || nodeMap.get(link.source.id);
    const targetNode = nodeMap.get(link.target) || nodeMap.get(link.target.id);
    
    if (!sourceNode || !targetNode) {
      console.warn(`Missing node for link: ${link.source} -> ${link.target}`);
      return null;
    }
    
    // Determine if this is a circular flow (goes backwards in columns)
    const isCircular = sourceNode.column > targetNode.column;
    
    return {
      source: sourceNode,
      target: targetNode,
      value: link.value || 1,
      type: link.type || 'material',
      label: link.label || '',
      color: link.color || getFlowColor(link.type || 'material'),
      circular: isCircular
    };
  }).filter(Boolean) as HybridLink[];
  
  return {
    nodes: Array.from(nodeMap.values()),
    links: hybridLinks,
    columns
  };
}

/**
 * Optimize node positions to minimize path crossings
 * Uses a simple heuristic: sort nodes within each column by their average target Y position
 */
export function optimizeLayout(
  nodes: HybridNode[],
  links: HybridLink[]
): HybridNode[] {
  // Group nodes by column
  const columnGroups = new Map<number, HybridNode[]>();
  nodes.forEach(node => {
    if (!columnGroups.has(node.column)) {
      columnGroups.set(node.column, []);
    }
    columnGroups.get(node.column)!.push(node);
  });
  
  // For each column, calculate average target Y for sorting
  columnGroups.forEach((columnNodes, columnIndex) => {
    const nodeScores = columnNodes.map(node => {
      // Find all outgoing links
      const outgoing = links.filter(l => l.source.id === node.id);
      const incoming = links.filter(l => l.target.id === node.id);
      
      // Calculate average Y position of connected nodes
      const connectedYs = [
        ...outgoing.map(l => l.target.y),
        ...incoming.map(l => l.source.y)
      ].filter(y => y > 0);
      
      const avgY = connectedYs.length > 0
        ? connectedYs.reduce((sum, y) => sum + y, 0) / connectedYs.length
        : node.y;
      
      return { node, score: avgY };
    });
    
    // Sort by score
    nodeScores.sort((a, b) => a.score - b.score);
    
    // Reassign Y positions
    const baseY = columnNodes[0].y;
    const spacing = columnNodes.length > 1 ? (columnNodes[columnNodes.length - 1].y - baseY) / (columnNodes.length - 1) : 0;
    
    nodeScores.forEach((item, index) => {
      item.node.row = index;
      item.node.y = baseY + (index * spacing);
    });
  });
  
  return nodes;
}

/**
 * Adjust node position manually (for drag-and-drop)
 */
export function updateNodePosition(
  nodes: HybridNode[],
  nodeId: string,
  newX: number,
  newY: number
): HybridNode[] {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return { ...node, x: newX, y: newY };
    }
    return node;
  });
}

/**
 * Export layout configuration for saving/loading
 */
export function exportLayout(nodes: HybridNode[]): Record<string, { x: number; y: number; column: number; row: number }> {
  const layout: Record<string, { x: number; y: number; column: number; row: number }> = {};
  nodes.forEach(node => {
    layout[node.id] = {
      x: node.x,
      y: node.y,
      column: node.column,
      row: node.row
    };
  });
  return layout;
}

/**
 * Import layout configuration
 */
export function importLayout(
  nodes: HybridNode[],
  layout: Record<string, { x: number; y: number; column: number; row: number }>
): HybridNode[] {
  return nodes.map(node => {
    const savedPosition = layout[node.id];
    if (savedPosition) {
      return {
        ...node,
        x: savedPosition.x,
        y: savedPosition.y,
        column: savedPosition.column,
        row: savedPosition.row
      };
    }
    return node;
  });
}