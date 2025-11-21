/**
 * Circular Sankey Layout Engine
 * Handles node positioning and path generation for circular flow diagrams
 */

export interface CircularLayoutConfig {
  centerX: number;
  centerY: number;
  radiusOuter: number;   // Outer ring for inputs/outputs
  radiusMid: number;     // Mid ring for processing nodes
  radiusInner: number;   // Inner ring for treatment systems
  angleOffset: number;   // Starting angle offset (default: -90° for top start)
}

export interface Position {
  x: number;
  y: number;
}

export interface CircularNode {
  id: string;
  label: string;
  color: string;
  nodeType: 'input' | 'component' | 'treatment' | 'output' | 'recovery';
  angle: number;        // Position on circle (degrees)
  radius: number;       // Distance from center
  value?: number;
}

export interface CircularLink {
  source: string;
  target: string;
  value: number;
  color: string;
  type: string;
  label?: string;
  isCircular?: boolean; // Part of closed loop?
  arcRadius?: number;    // For return flows: 0.0-1.0 controls curve depth (default: 0.85 = 85% from center)
}

/**
 * Calculate node position on circular layout
 */
export function calculateNodePosition(
  angle: number,
  radius: number,
  config: CircularLayoutConfig
): Position {
  const radians = ((angle + config.angleOffset) * Math.PI) / 180;
  return {
    x: config.centerX + radius * Math.cos(radians),
    y: config.centerY + radius * Math.sin(radians),
  };
}

/**
 * Create circular layout for nodes
 */
export function createCircularLayout(
  nodes: CircularNode[],
  systemView: 'current' | 'proposed'
): Map<string, CircularNode> {
  const nodeMap = new Map<string, CircularNode>();

  if (systemView === 'current') {
    // Current system layout (linear, fewer nodes)
    const layouts: Record<string, Partial<CircularNode>> = {
      pine: { angle: 0, radius: 280, nodeType: 'input' },
      feed: { angle: 30, radius: 280, nodeType: 'input' },
      fossil: { angle: 60, radius: 280, nodeType: 'input' },
      'chicken-house': { angle: 90, radius: 200, nodeType: 'component' },
      processing: { angle: 150, radius: 200, nodeType: 'component' },
      meat: { angle: 180, radius: 280, nodeType: 'output' },
      'litter-waste': { angle: 240, radius: 280, nodeType: 'output' },
      emissions: { angle: 270, radius: 280, nodeType: 'output' },
      runoff: { angle: 300, radius: 280, nodeType: 'output' },
    };

    nodes.forEach((node) => {
      const layout = layouts[node.id];
      if (layout) {
        nodeMap.set(node.id, { ...node, ...layout });
      }
    });
  } else {
    // Proposed system layout (circular with treatment)
    const layouts: Record<string, Partial<CircularNode>> = {
      // Inputs (12-3 o'clock)
      pine: { angle: 0, radius: 280, nodeType: 'input' },
      feed: { angle: 30, radius: 280, nodeType: 'input' },
      water: { angle: 60, radius: 280, nodeType: 'input' },
      
      // Primary production (3-6 o'clock)
      'chicken-house': { angle: 90, radius: 200, nodeType: 'component' },
      processing: { angle: 150, radius: 200, nodeType: 'component' },
      
      // Products (6-9 o'clock)
      meat: { angle: 180, radius: 280, nodeType: 'output' },
      
      // Treatment & Recovery (9-12 o'clock)
      'pyrolysis-unit': { angle: 270, radius: 120, nodeType: 'treatment' },
      'anaerobic-digester': { angle: 300, radius: 120, nodeType: 'treatment' },
      'farm-waterways': { angle: 330, radius: 280, nodeType: 'recovery' },
      
      // Recovery outputs (around treatment)
      biochar: { angle: 240, radius: 280, nodeType: 'recovery' },
      syngas: { angle: 255, radius: 280, nodeType: 'recovery' },
      digestate: { angle: 285, radius: 280, nodeType: 'recovery' },
      methane: { angle: 315, radius: 280, nodeType: 'recovery' },
    };

    nodes.forEach((node) => {
      const layout = layouts[node.id];
      if (layout) {
        nodeMap.set(node.id, { ...node, ...layout });
      }
    });
  }

  return nodeMap;
}

/**
 * Generate path for forward flow (standard Bezier curve)
 */
export function createForwardPath(
  sourcePos: Position,
  targetPos: Position
): string {
  const controlDistance = 50;
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Control points push outward for smooth curve
  const controlOffset = Math.min(distance * 0.4, controlDistance);
  
  return `M ${sourcePos.x},${sourcePos.y} 
          C ${sourcePos.x + controlOffset},${sourcePos.y} 
            ${targetPos.x - controlOffset},${targetPos.y} 
            ${targetPos.x},${targetPos.y}`;
}

/**
 * Generate path for circular return flow (constrained Bezier with intermediate arc point)
 */
export function createCircularReturnPath(
  sourcePos: Position,
  targetPos: Position,
  sourceAngle: number,
  targetAngle: number,
  centerX: number,
  centerY: number,
  clockwise: boolean = true,
  arcRadiusRatio: number = 0.85
): string {
  // Calculate the radius from center to nodes
  const sourceRadius = Math.sqrt(
    Math.pow(sourcePos.x - centerX, 2) + Math.pow(sourcePos.y - centerY, 2)
  );
  
  // Create an intermediate point along the arc at specified ratio (default 85% of the way from center)
  // arcRadiusRatio: 0.0 = at center, 1.0 = at outer nodes, 0.85 = slightly inside
  const arcRadius = sourceRadius * arcRadiusRatio;
  
  // Calculate midpoint angle (average of source and target, taking shorter path)
  let midAngle = (sourceAngle + targetAngle) / 2;
  
  // Adjust if we need to go the other way around
  const angleDiff = targetAngle - sourceAngle;
  if (Math.abs(angleDiff) > 180) {
    midAngle = midAngle + 180;
  }
  
  // Convert midpoint angle to radians and calculate position
  const midRadians = ((midAngle - 90) * Math.PI) / 180; // -90 to start at top
  const midX = centerX + arcRadius * Math.cos(midRadians);
  const midY = centerY + arcRadius * Math.sin(midRadians);
  
  // Use quadratic Bezier with midpoint as control
  return `M ${sourcePos.x},${sourcePos.y}
          Q ${midX},${midY}
            ${targetPos.x},${targetPos.y}`;
}

/**
 * Generate path through circle center (cross-circle)
 */
export function createCrossCenterPath(
  sourcePos: Position,
  targetPos: Position,
  centerX: number,
  centerY: number
): string {
  const midX = (sourcePos.x + targetPos.x) / 2;
  const midY = (sourcePos.y + targetPos.y) / 2;
  
  // Pull toward center slightly for visual interest
  const centerPull = 0.8;
  const controlX = midX * centerPull + centerX * (1 - centerPull);
  const controlY = midY * centerPull + centerY * (1 - centerPull);
  
  return `M ${sourcePos.x},${sourcePos.y}
          Q ${controlX},${controlY}
            ${targetPos.x},${targetPos.y}`;
}

/**
 * Detect if link is part of circular flow
 */
export function isCircularFlow(link: CircularLink): boolean {
  const circularPatterns = [
    ['biochar', 'chicken-house'],
    ['pyrolysis-unit', 'anaerobic-digester'],
    ['digestate', 'farm-waterways'],
  ];

  return circularPatterns.some(
    ([source, target]) =>
      (link.source.includes(source) && link.target.includes(target)) ||
      (link.target.includes(source) && link.source.includes(target))
  );
}

/**
 * Get default responsive config based on viewport
 */
export function getResponsiveConfig(width: number): CircularLayoutConfig {
  if (width < 640) {
    // Mobile
    return {
      centerX: 180,
      centerY: 180,
      radiusOuter: 140,
      radiusMid: 100,
      radiusInner: 60,
      angleOffset: -90,
    };
  } else if (width < 1024) {
    // Tablet
    return {
      centerX: 300,
      centerY: 300,
      radiusOuter: 220,
      radiusMid: 160,
      radiusInner: 100,
      angleOffset: -90,
    };
  } else {
    // Desktop
    return {
      centerX: 450,
      centerY: 450,
      radiusOuter: 280,
      radiusMid: 200,
      radiusInner: 120,
      angleOffset: -90,
    };
  }
}