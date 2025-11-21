/**
 * Hybrid Sankey Path Generator
 * Generates SVG paths with intelligent routing:
 * - Straight lines for short direct connections
 * - S-curves for medium-distance flows
 * - Circular arcs for return/loop flows
 */

import { HybridNode, HybridLink } from './hybridSankeyLayout';

export interface PathResult {
  d: string;              // SVG path data
  type: 'straight' | 's-curve' | 'arc';
  width: number;          // Stroke width
  midpoint: { x: number; y: number }; // For label positioning
}

export interface PathConfig {
  minWidth: number;
  maxWidth: number;
  widthScale: number;
  curvature: number;      // 0-1, amount of curve for S-curves
  arcRadius: number;      // Radius multiplier for circular arcs
}

const DEFAULT_PATH_CONFIG: PathConfig = {
  minWidth: 2,
  maxWidth: 40,
  widthScale: 0.1,
  curvature: 0.5,
  arcRadius: 1.2
};

/**
 * Calculate path width based on flow value
 */
function calculatePathWidth(value: number, config: PathConfig): number {
  const width = Math.sqrt(value) * config.widthScale;
  return Math.max(config.minWidth, Math.min(config.maxWidth, width));
}

/**
 * Determine optimal path type based on link properties and node positions
 */
function determinePathType(link: HybridLink): 'straight' | 's-curve' | 'arc' {
  // Check if explicitly marked as circular flow
  if (link.circular) {
    return 'arc';
  }
  
  const source = link.source;
  const target = link.target;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Short distance: straight line
  if (distance < 150) {
    return 'straight';
  }
  
  // Otherwise: S-curve
  return 's-curve';
}

/**
 * Generate straight line path
 */
function generateStraightPath(source: HybridNode, target: HybridNode): string {
  const sourceX = source.x + source.width / 2;
  const sourceY = source.y + source.height / 2;
  const targetX = target.x - target.width / 2;
  const targetY = target.y + target.height / 2;
  
  return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
}

/**
 * Generate S-curve path using cubic Bezier
 */
function generateSCurvePath(
  source: HybridNode,
  target: HybridNode,
  config: PathConfig
): string {
  const sourceX = source.x + source.width / 2;
  const sourceY = source.y + source.height / 2;
  const targetX = target.x - target.width / 2;
  const targetY = target.y + target.height / 2;
  
  // Calculate control points for smooth S-curve
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  
  // Control points are positioned horizontally between nodes
  const controlDistance = Math.abs(dx) * config.curvature;
  
  const cp1X = sourceX + controlDistance;
  const cp1Y = sourceY;
  
  const cp2X = targetX - controlDistance;
  const cp2Y = targetY;
  
  return `M ${sourceX},${sourceY} 
          C ${cp1X},${cp1Y} 
            ${cp2X},${cp2Y} 
            ${targetX},${targetY}`;
}

/**
 * Generate circular path EXACTLY as d3-sankey-circular does
 * Following the exact pattern from createCircularPathString
 */
function generateArcPath(
  source: HybridNode,
  target: HybridNode,
  config: PathConfig
): string {
  const sourceX = source.x - source.width / 2;
  const sourceY = source.y + source.height / 2;
  const targetX = target.x - target.width / 2;
  const targetY = target.y + target.height / 2;
  
  // Calculate circularPathData exactly as d3-sankey-circular
  const baseRadius = 10;
  const buffer = 10;
  const verticalMargin = 25;
  const circularLinkGap = 2;
  
  const leftSmallArcRadius = baseRadius;
  const leftLargeArcRadius = baseRadius + circularLinkGap;
  const rightSmallArcRadius = baseRadius;
  const rightLargeArcRadius = baseRadius + circularLinkGap;
  
  const leftNodeBuffer = buffer;
  const rightNodeBuffer = buffer;
  
  const leftInnerExtent = sourceX + leftNodeBuffer;
  const rightInnerExtent = targetX - rightNodeBuffer;
  const leftFullExtent = sourceX + leftLargeArcRadius + leftNodeBuffer;
  const rightFullExtent = targetX - rightLargeArcRadius - rightNodeBuffer;
  
  // Determine circularLinkType (bottom or top)
  const circularLinkType = sourceY <= targetY ? 'bottom' : 'top';
  
  let verticalFullExtent, verticalLeftInnerExtent, verticalRightInnerExtent;
  
  if (circularLinkType == 'bottom') {
    const lowestY = Math.max(sourceY, targetY);
    verticalFullExtent = lowestY + verticalMargin;
    verticalLeftInnerExtent = verticalFullExtent - leftLargeArcRadius;
    verticalRightInnerExtent = verticalFullExtent - rightLargeArcRadius;
    
    // Bottom path
    return 'M' + sourceX + ' ' + sourceY + ' ' +
      'L' + leftInnerExtent + ' ' + sourceY + ' ' +
      'A' + leftLargeArcRadius + ' ' + leftSmallArcRadius + ' 0 0 1 ' +
      leftFullExtent + ' ' + (sourceY + leftSmallArcRadius) + ' ' +
      'L' + leftFullExtent + ' ' + verticalLeftInnerExtent + ' ' +
      'A' + leftLargeArcRadius + ' ' + leftLargeArcRadius + ' 0 0 1 ' +
      leftInnerExtent + ' ' + verticalFullExtent + ' ' +
      'L' + rightInnerExtent + ' ' + verticalFullExtent + ' ' +
      'A' + rightLargeArcRadius + ' ' + rightLargeArcRadius + ' 0 0 1 ' +
      rightFullExtent + ' ' + verticalRightInnerExtent + ' ' +
      'L' + rightFullExtent + ' ' + (targetY + rightSmallArcRadius) + ' ' +
      'A' + rightLargeArcRadius + ' ' + rightSmallArcRadius + ' 0 0 1 ' +
      rightInnerExtent + ' ' + targetY + ' ' +
      'L' + targetX + ' ' + targetY;
  } else {
    // Top path
    const highestY = Math.min(sourceY, targetY);
    verticalFullExtent = highestY - verticalMargin;
    verticalLeftInnerExtent = verticalFullExtent + leftLargeArcRadius;
    verticalRightInnerExtent = verticalFullExtent + rightLargeArcRadius;
    
    return 'M' + sourceX + ' ' + sourceY + ' ' +
      'L' + leftInnerExtent + ' ' + sourceY + ' ' +
      'A' + leftLargeArcRadius + ' ' + leftSmallArcRadius + ' 0 0 0 ' +
      leftFullExtent + ' ' + (sourceY - leftSmallArcRadius) + ' ' +
      'L' + leftFullExtent + ' ' + verticalLeftInnerExtent + ' ' +
      'A' + leftLargeArcRadius + ' ' + leftLargeArcRadius + ' 0 0 0 ' +
      leftInnerExtent + ' ' + verticalFullExtent + ' ' +
      'L' + rightInnerExtent + ' ' + verticalFullExtent + ' ' +
      'A' + rightLargeArcRadius + ' ' + rightLargeArcRadius + ' 0 0 0 ' +
      rightFullExtent + ' ' + verticalRightInnerExtent + ' ' +
      'L' + rightFullExtent + ' ' + (targetY - rightSmallArcRadius) + ' ' +
      'A' + rightLargeArcRadius + ' ' + rightSmallArcRadius + ' 0 0 0 ' +
      rightInnerExtent + ' ' + targetY + ' ' +
      'L' + targetX + ' ' + targetY;
  }
}

/**
 * Generate path with appropriate width for flow volume
 */
export function generateFlowPath(
  link: HybridLink,
  config: Partial<PathConfig> = {}
): PathResult {
  const pathConfig = { ...DEFAULT_PATH_CONFIG, ...config };
  
  // Determine path type
  const pathType = determinePathType(link);
  
  // Generate path data
  let pathData: string;
  switch (pathType) {
    case 'straight':
      pathData = generateStraightPath(link.source, link.target);
      break;
    case 's-curve':
      pathData = generateSCurvePath(link.source, link.target, pathConfig);
      break;
    case 'arc':
      pathData = generateArcPath(link.source, link.target, pathConfig);
      break;
  }
  
  // Calculate width
  const width = calculatePathWidth(link.value, pathConfig);
  
  // Calculate midpoint for label placement
  const midpoint = calculatePathMidpoint(link.source, link.target, pathType);
  
  return {
    d: pathData,
    type: pathType,
    width,
    midpoint
  };
}

/**
 * Calculate midpoint of path for label positioning
 */
function calculatePathMidpoint(
  source: HybridNode,
  target: HybridNode,
  pathType: 'straight' | 's-curve' | 'arc'
): { x: number; y: number } {
  const sourceX = source.x + source.width / 2;
  const sourceY = source.y + source.height / 2;
  const targetX = pathType === 'arc' ? target.x + target.width / 2 : target.x - target.width / 2;
  const targetY = target.y + target.height / 2;
  
  if (pathType === 'straight') {
    return {
      x: (sourceX + targetX) / 2,
      y: (sourceY + targetY) / 2
    };
  }
  
  if (pathType === 's-curve') {
    // Midpoint is slightly offset from center for S-curves
    return {
      x: (sourceX + targetX) / 2,
      y: (sourceY + targetY) / 2
    };
  }
  
  // Arc: position label at the bottom/top of the circular path (d3-sankey-circular style)
  const circularLinkType = sourceY <= targetY ? 'bottom' : 'top';
  const verticalMargin = 25;
  
  let verticalFullExtent;
  if (circularLinkType == 'bottom') {
    const lowestY = Math.max(sourceY, targetY);
    verticalFullExtent = lowestY + verticalMargin;
  } else {
    const highestY = Math.min(sourceY, targetY);
    verticalFullExtent = highestY - verticalMargin;
  }
  
  const midX = (sourceX + targetX) / 2;
  
  return { x: midX, y: verticalFullExtent };
}

/**
 * Generate all paths for a set of links
 */
export function generateAllPaths(
  links: HybridLink[],
  config: Partial<PathConfig> = {}
): Map<string, PathResult> {
  const pathMap = new Map<string, PathResult>();
  
  links.forEach((link, index) => {
    const linkId = `${link.source.id}-${link.target.id}-${index}`;
    const pathResult = generateFlowPath(link, config);
    pathMap.set(linkId, pathResult);
  });
  
  return pathMap;
}

/**
 * Get path style based on flow type
 */
export function getPathStyle(link: HybridLink, pathType: 'straight' | 's-curve' | 'arc'): {
  strokeDasharray?: string;
  opacity: number;
} {
  // Circular flows are dashed
  if (link.circular || pathType === 'arc') {
    return {
      strokeDasharray: '8,4',
      opacity: 0.7
    };
  }
  
  // Energy flows are more opaque
  if (link.type === 'energy') {
    return {
      opacity: 0.9
    };
  }
  
  // Standard flows
  return {
    opacity: 0.8
  };
}

/**
 * Calculate collision score between two paths
 * Used for layout optimization
 */
export function calculatePathCollision(
  path1: PathResult,
  path2: PathResult
): number {
  // Simple distance-based collision detection
  const dx = path1.midpoint.x - path2.midpoint.x;
  const dy = path1.midpoint.y - path2.midpoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Combine widths
  const combinedWidth = path1.width + path2.width;
  
  // Return collision score (0 = no collision, 1+ = collision)
  if (distance < combinedWidth) {
    return (combinedWidth - distance) / combinedWidth;
  }
  
  return 0;
}

/**
 * Create gradient definition for wide paths
 */
export function createPathGradient(
  linkId: string,
  color: string,
  opacity: number = 0.8
): string {
  return `
    <linearGradient id="gradient-${linkId}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0" />
      <stop offset="20%" style="stop-color:${color};stop-opacity:${opacity}" />
      <stop offset="80%" style="stop-color:${color};stop-opacity:${opacity}" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
    </linearGradient>
  `;
}