/**
 * Flow Position Mapping System
 * Maps connections to visual coordinates for animated flows
 */

export interface FlowCoordinate {
  startX: string;
  startY: string;
  endX: string;
  endY: string;
}

export interface FlowVisualParams extends FlowCoordinate {
  duration?: number;
  iconSize?: number;
  labelColor?: string;
}

/**
 * Component positions for both layouts
 */
export const componentPositions = {
  current: {
    'chicken-house': { x: 15, y: 47 },
    'processing-plant': { x: 47, y: 15 },
    'farm-waterways': { x: 45, y: 80 },
  },
  proposed: {
    'chicken-house': { x: 13, y: 47 },
    'processing-plant': { x: 47, y: 10 },
    'anaerobic-digester': { x: 47, y: 45 },
    'pyrolysis-unit': { x: 78, y: 12 },
    'farm-waterways': { x: 47, y: 80 },
  },
};

/**
 * Calculate flow coordinates between two components
 */
export function calculateFlowPath(
  source: string,
  target: string,
  layout: 'current' | 'proposed'
): FlowCoordinate {
  const positions = componentPositions[layout];
  const sourcePos = (positions as Record<string, { x: number; y: number }>)[source];
  const targetPos = (positions as Record<string, { x: number; y: number }>)[target];

  if (!sourcePos || !targetPos) {
    // Fallback coordinates
    return {
      startX: '10',
      startY: '50',
      endX: '90',
      endY: '50',
    };
  }

  // Calculate offset for flow start/end (edges of component boxes)
  const offsetX = sourcePos.x < targetPos.x ? 5 : -5;
  const offsetY = sourcePos.y < targetPos.y ? 3 : -3;

  return {
    startX: String(sourcePos.x + offsetX),
    startY: String(sourcePos.y),
    endX: String(targetPos.x - offsetX),
    endY: String(targetPos.y),
  };
}

/**
 * Get visual parameters for a material flow
 */
export function getFlowVisualParams(
  material: string,
  source: string,
  target: string,
  layout: 'current' | 'proposed'
): FlowVisualParams {
  const coords = calculateFlowPath(source, target, layout);
  
  // Determine color based on material type
  const materialLower = material.toLowerCase();
  let labelColor = 'gray';
  
  if (materialLower.includes('biochar')) labelColor = 'green';
  else if (materialLower.includes('waste') || materialLower.includes('litter')) labelColor = 'red';
  else if (materialLower.includes('energy') || materialLower.includes('syngas')) labelColor = 'purple';
  else if (materialLower.includes('digestate')) labelColor = 'blue';
  else if (materialLower.includes('meat')) labelColor = 'green';

  // Determine duration (longer paths = longer duration)
  const distance = Math.sqrt(
    Math.pow(parseFloat(coords.endX) - parseFloat(coords.startX), 2) +
    Math.pow(parseFloat(coords.endY) - parseFloat(coords.startY), 2)
  );
  const duration = Math.max(3000, Math.min(5000, distance * 50));

  return {
    ...coords,
    duration,
    iconSize: 35,
    labelColor,
  };
}