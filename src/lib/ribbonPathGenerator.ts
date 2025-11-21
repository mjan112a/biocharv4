/**
 * Ribbon Path Generator for Traditional Sankey Diagrams
 * Generates filled ribbon paths with tapered connections and smooth bezier curves
 */

import { HybridNode, HybridLink } from './hybridSankeyLayout';

export interface RibbonPathResult {
  d: string;              // SVG path data for filled ribbon
  type: 'straight' | 's-curve' | 'arc';
  width: number;          // Maximum width of ribbon
  midpoint: { x: number; y: number }; // For label positioning
}

export interface RibbonConfig {
  minWidth: number;
  maxWidth: number;
  widthScale: number;
  curvature: number;      // 0-1, amount of curve for S-curves
  arcRadius: number;      // Radius multiplier for circular arcs
  taperRatio: number;     // 0-1, how much to taper at node connections (0=no taper, 1=full taper)
}

const DEFAULT_RIBBON_CONFIG: RibbonConfig = {
  minWidth: 3,
  maxWidth: 50,
  widthScale: 0.12,
  curvature: 0.5,
  arcRadius: 1.2,
  taperRatio: 0.4
};

/**
 * Calculate ribbon width based on flow value
 */
function calculateRibbonWidth(value: number, config: RibbonConfig): number {
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
 * Generate straight ribbon path with tapered ends
 */
function generateStraightRibbon(
  source: HybridNode,
  target: HybridNode,
  width: number,
  config: RibbonConfig
): string {
  const sourceX = source.x + source.width / 2;
  const sourceY = source.y + source.height / 2;
  const targetX = target.x - target.width / 2;
  const targetY = target.y + target.height / 2;
  
  const halfWidth = width / 2;
  const taperWidth = halfWidth * (1 - config.taperRatio);
  
  // Calculate perpendicular offset for ribbon edges
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const perpX = -dy / length;
  const perpY = dx / length;
  
  // Source points (slightly tapered)
  const s1x = sourceX + perpX * taperWidth;
  const s1y = sourceY + perpY * taperWidth;
  const s2x = sourceX - perpX * taperWidth;
  const s2y = sourceY - perpY * taperWidth;
  
  // Target points (slightly tapered)
  const t1x = targetX + perpX * taperWidth;
  const t1y = targetY + perpY * taperWidth;
  const t2x = targetX - perpX * taperWidth;
  const t2y = targetY - perpY * taperWidth;
  
  return `M ${s1x},${s1y} L ${t1x},${t1y} L ${t2x},${t2y} L ${s2x},${s2y} Z`;
}

/**
 * Generate S-curve ribbon path with tapered connections
 */
function generateSCurveRibbon(
  source: HybridNode,
  target: HybridNode,
  width: number,
  config: RibbonConfig
): string {
  const sourceX = source.x + source.width / 2;
  const sourceY = source.y + source.height / 2;
  const targetX = target.x - target.width / 2;
  const targetY = target.y + target.height / 2;
  
  const halfWidth = width / 2;
  const sourceTaper = halfWidth * (1 - config.taperRatio);
  const targetTaper = halfWidth * (1 - config.taperRatio);
  
  // Calculate control points for smooth S-curve
  const dx = targetX - sourceX;
  const controlDistance = Math.abs(dx) * config.curvature;
  
  const cp1X = sourceX + controlDistance;
  const cp1Y = sourceY;
  const cp2X = targetX - controlDistance;
  const cp2Y = targetY;
  
  // Top edge of ribbon
  const topPath = `M ${sourceX},${sourceY - sourceTaper}
                   C ${cp1X},${cp1Y - halfWidth}
                     ${cp2X},${cp2Y - halfWidth}
                     ${targetX},${targetY - targetTaper}`;
  
  // Bottom edge of ribbon (reversed)
  const bottomPath = `L ${targetX},${targetY + targetTaper}
                      C ${cp2X},${cp2Y + halfWidth}
                        ${cp1X},${cp1Y + halfWidth}
                        ${sourceX},${sourceY + sourceTaper}`;
  
  return `${topPath} ${bottomPath} Z`;
}

/**
 * Generate circular ribbon path EXACTLY as d3-sankey-circular does
 * Following the exact pattern from createCircularPathString
 */
function generateArcRibbon(
  source: HybridNode,
  target: HybridNode,
  width: number,
  config: RibbonConfig
): string {
  const sourceX = source.x - source.width / 2;
  const sourceY = source.y + source.height / 2;
  const targetX = target.x - target.width / 2;
  const targetY = target.y + target.height / 2;
  
  const halfWidth = width / 2;
  
  // Same parameters as line path generator
  const baseRadius = 10;
  const buffer = 10;
  const verticalMargin = 25;
  const circularLinkGap = 2;
  
  // Top edge uses larger radius (baseRadius + gap + halfWidth)
  const leftSmallArcRadiusTop = baseRadius + circularLinkGap + halfWidth;
  const leftLargeArcRadiusTop = baseRadius + circularLinkGap + halfWidth;
  const rightSmallArcRadiusTop = baseRadius + circularLinkGap + halfWidth;
  const rightLargeArcRadiusTop = baseRadius + circularLinkGap + halfWidth;
  
  // Bottom edge uses smaller radius (baseRadius - halfWidth)
  const leftSmallArcRadiusBottom = Math.max(2, baseRadius - halfWidth);
  const leftLargeArcRadiusBottom = Math.max(2, baseRadius - halfWidth);
  const rightSmallArcRadiusBottom = Math.max(2, baseRadius - halfWidth);
  const rightLargeArcRadiusBottom = Math.max(2, baseRadius - halfWidth);
  
  const leftNodeBuffer = buffer;
  const rightNodeBuffer = buffer;
  
  const leftInnerExtent = sourceX + leftNodeBuffer;
  const rightInnerExtent = targetX - rightNodeBuffer;
  
  // Extents for top edge
  const leftFullExtentTop = sourceX + leftLargeArcRadiusTop + leftNodeBuffer;
  const rightFullExtentTop = targetX - rightLargeArcRadiusTop - rightNodeBuffer;
  
  // Extents for bottom edge
  const leftFullExtentBottom = sourceX + leftLargeArcRadiusBottom + leftNodeBuffer;
  const rightFullExtentBottom = targetX - rightLargeArcRadiusBottom - rightNodeBuffer;
  
  // Determine circularLinkType (bottom or top)
  const circularLinkType = sourceY <= targetY ? 'bottom' : 'top';
  
  if (circularLinkType == 'bottom') {
    const lowestY = Math.max(sourceY, targetY);
    
    // Top edge vertical extents
    const verticalFullExtentTop = lowestY + verticalMargin + halfWidth;
    const verticalLeftInnerExtentTop = verticalFullExtentTop - leftLargeArcRadiusTop;
    const verticalRightInnerExtentTop = verticalFullExtentTop - rightLargeArcRadiusTop;
    
    // Bottom edge vertical extents
    const verticalFullExtentBottom = lowestY + verticalMargin - halfWidth;
    const verticalLeftInnerExtentBottom = verticalFullExtentBottom - leftLargeArcRadiusBottom;
    const verticalRightInnerExtentBottom = verticalFullExtentBottom - rightLargeArcRadiusBottom;
    
    // Top edge path (forward)
    const topPath =
      'M' + sourceX + ' ' + (sourceY + halfWidth) + ' ' +
      'L' + leftInnerExtent + ' ' + (sourceY + halfWidth) + ' ' +
      'A' + leftLargeArcRadiusTop + ' ' + leftSmallArcRadiusTop + ' 0 0 1 ' +
      leftFullExtentTop + ' ' + (sourceY + halfWidth + leftSmallArcRadiusTop) + ' ' +
      'L' + leftFullExtentTop + ' ' + verticalLeftInnerExtentTop + ' ' +
      'A' + leftLargeArcRadiusTop + ' ' + leftLargeArcRadiusTop + ' 0 0 1 ' +
      leftInnerExtent + ' ' + verticalFullExtentTop + ' ' +
      'L' + rightInnerExtent + ' ' + verticalFullExtentTop + ' ' +
      'A' + rightLargeArcRadiusTop + ' ' + rightLargeArcRadiusTop + ' 0 0 1 ' +
      rightFullExtentTop + ' ' + verticalRightInnerExtentTop + ' ' +
      'L' + rightFullExtentTop + ' ' + (targetY + halfWidth + rightSmallArcRadiusTop) + ' ' +
      'A' + rightLargeArcRadiusTop + ' ' + rightSmallArcRadiusTop + ' 0 0 1 ' +
      rightInnerExtent + ' ' + (targetY + halfWidth) + ' ' +
      'L' + targetX + ' ' + (targetY + halfWidth) + ' ';
    
    // Bottom edge path (return)
    const bottomPath =
      'L' + targetX + ' ' + (targetY - halfWidth) + ' ' +
      'L' + rightInnerExtent + ' ' + (targetY - halfWidth) + ' ' +
      'A' + rightLargeArcRadiusBottom + ' ' + rightSmallArcRadiusBottom + ' 0 0 0 ' +
      rightFullExtentBottom + ' ' + (targetY - halfWidth + rightSmallArcRadiusBottom) + ' ' +
      'L' + rightFullExtentBottom + ' ' + verticalRightInnerExtentBottom + ' ' +
      'A' + rightLargeArcRadiusBottom + ' ' + rightLargeArcRadiusBottom + ' 0 0 0 ' +
      rightInnerExtent + ' ' + verticalFullExtentBottom + ' ' +
      'L' + leftInnerExtent + ' ' + verticalFullExtentBottom + ' ' +
      'A' + leftLargeArcRadiusBottom + ' ' + leftLargeArcRadiusBottom + ' 0 0 0 ' +
      leftFullExtentBottom + ' ' + verticalLeftInnerExtentBottom + ' ' +
      'L' + leftFullExtentBottom + ' ' + (sourceY - halfWidth + leftSmallArcRadiusBottom) + ' ' +
      'A' + leftLargeArcRadiusBottom + ' ' + leftSmallArcRadiusBottom + ' 0 0 0 ' +
      leftInnerExtent + ' ' + (sourceY - halfWidth) + ' ' +
      'L' + sourceX + ' ' + (sourceY - halfWidth) + ' ' +
      'Z';
    
    return topPath + bottomPath;
  } else {
    // Top path
    const highestY = Math.min(sourceY, targetY);
    
    // Top edge vertical extents
    const verticalFullExtentTop = highestY - verticalMargin - halfWidth;
    const verticalLeftInnerExtentTop = verticalFullExtentTop + leftLargeArcRadiusTop;
    const verticalRightInnerExtentTop = verticalFullExtentTop + rightLargeArcRadiusTop;
    
    // Bottom edge vertical extents
    const verticalFullExtentBottom = highestY - verticalMargin + halfWidth;
    const verticalLeftInnerExtentBottom = verticalFullExtentBottom + leftLargeArcRadiusBottom;
    const verticalRightInnerExtentBottom = verticalFullExtentBottom + rightLargeArcRadiusBottom;
    
    // Top edge path (forward)
    const topPath =
      'M' + sourceX + ' ' + (sourceY - halfWidth) + ' ' +
      'L' + leftInnerExtent + ' ' + (sourceY - halfWidth) + ' ' +
      'A' + leftLargeArcRadiusTop + ' ' + leftSmallArcRadiusTop + ' 0 0 0 ' +
      leftFullExtentTop + ' ' + (sourceY - halfWidth - leftSmallArcRadiusTop) + ' ' +
      'L' + leftFullExtentTop + ' ' + verticalLeftInnerExtentTop + ' ' +
      'A' + leftLargeArcRadiusTop + ' ' + leftLargeArcRadiusTop + ' 0 0 0 ' +
      leftInnerExtent + ' ' + verticalFullExtentTop + ' ' +
      'L' + rightInnerExtent + ' ' + verticalFullExtentTop + ' ' +
      'A' + rightLargeArcRadiusTop + ' ' + rightLargeArcRadiusTop + ' 0 0 0 ' +
      rightFullExtentTop + ' ' + verticalRightInnerExtentTop + ' ' +
      'L' + rightFullExtentTop + ' ' + (targetY - halfWidth - rightSmallArcRadiusTop) + ' ' +
      'A' + rightLargeArcRadiusTop + ' ' + rightSmallArcRadiusTop + ' 0 0 0 ' +
      rightInnerExtent + ' ' + (targetY - halfWidth) + ' ' +
      'L' + targetX + ' ' + (targetY - halfWidth) + ' ';
    
    // Bottom edge path (return)
    const bottomPath =
      'L' + targetX + ' ' + (targetY + halfWidth) + ' ' +
      'L' + rightInnerExtent + ' ' + (targetY + halfWidth) + ' ' +
      'A' + rightLargeArcRadiusBottom + ' ' + rightSmallArcRadiusBottom + ' 0 0 1 ' +
      rightFullExtentBottom + ' ' + (targetY + halfWidth - rightSmallArcRadiusBottom) + ' ' +
      'L' + rightFullExtentBottom + ' ' + verticalRightInnerExtentBottom + ' ' +
      'A' + rightLargeArcRadiusBottom + ' ' + rightLargeArcRadiusBottom + ' 0 0 1 ' +
      rightInnerExtent + ' ' + verticalFullExtentBottom + ' ' +
      'L' + leftInnerExtent + ' ' + verticalFullExtentBottom + ' ' +
      'A' + leftLargeArcRadiusBottom + ' ' + leftLargeArcRadiusBottom + ' 0 0 1 ' +
      leftFullExtentBottom + ' ' + verticalLeftInnerExtentBottom + ' ' +
      'L' + leftFullExtentBottom + ' ' + (sourceY + halfWidth - leftSmallArcRadiusBottom) + ' ' +
      'A' + leftLargeArcRadiusBottom + ' ' + leftSmallArcRadiusBottom + ' 0 0 1 ' +
      leftInnerExtent + ' ' + (sourceY + halfWidth) + ' ' +
      'L' + sourceX + ' ' + (sourceY + halfWidth) + ' ' +
      'Z';
    
    return topPath + bottomPath;
  }
}

/**
 * Generate ribbon path with appropriate width for flow volume
 */
export function generateRibbonPath(
  link: HybridLink,
  config: Partial<RibbonConfig> = {}
): RibbonPathResult {
  const ribbonConfig = { ...DEFAULT_RIBBON_CONFIG, ...config };
  
  // Determine path type
  const pathType = determinePathType(link);
  
  // Calculate width
  const width = calculateRibbonWidth(link.value, ribbonConfig);
  
  // Generate path data based on type
  let pathData: string;
  switch (pathType) {
    case 'straight':
      pathData = generateStraightRibbon(link.source, link.target, width, ribbonConfig);
      break;
    case 's-curve':
      pathData = generateSCurveRibbon(link.source, link.target, width, ribbonConfig);
      break;
    case 'arc':
      pathData = generateArcRibbon(link.source, link.target, width, ribbonConfig);
      break;
  }
  
  // Calculate midpoint for label placement
  const midpoint = calculateRibbonMidpoint(link.source, link.target, pathType);
  
  return {
    d: pathData,
    type: pathType,
    width,
    midpoint
  };
}

/**
 * Calculate midpoint of ribbon for label positioning
 */
function calculateRibbonMidpoint(
  source: HybridNode,
  target: HybridNode,
  pathType: 'straight' | 's-curve' | 'arc'
): { x: number; y: number } {
  const sourceX = source.x + source.width / 2;
  const sourceY = source.y + source.height / 2;
  const targetX = pathType === 'arc' ? target.x + target.width / 2 : target.x - target.width / 2;
  const targetY = target.y + target.height / 2;
  
  if (pathType === 'straight' || pathType === 's-curve') {
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
 * Generate all ribbon paths for a set of links
 */
export function generateAllRibbons(
  links: HybridLink[],
  config: Partial<RibbonConfig> = {}
): Map<string, RibbonPathResult> {
  const ribbonMap = new Map<string, RibbonPathResult>();
  
  links.forEach((link, index) => {
    const linkId = `${link.source.id}-${link.target.id}-${index}`;
    const ribbonResult = generateRibbonPath(link, config);
    ribbonMap.set(linkId, ribbonResult);
  });
  
  return ribbonMap;
}

/**
 * Get ribbon style based on flow type
 */
export function getRibbonStyle(link: HybridLink, pathType: 'straight' | 's-curve' | 'arc'): {
  strokeDasharray?: string;
  opacity: number;
  fillOpacity: number;
} {
  // Circular flows are dashed with lower opacity
  if (link.circular || pathType === 'arc') {
    return {
      strokeDasharray: '12,6',
      opacity: 0.6,
      fillOpacity: 0.4
    };
  }
  
  // Energy flows are more opaque
  if (link.type === 'energy') {
    return {
      opacity: 0.85,
      fillOpacity: 0.7
    };
  }
  
  // Standard flows
  return {
    opacity: 0.75,
    fillOpacity: 0.6
  };
}