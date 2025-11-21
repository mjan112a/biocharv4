/**
 * Layout Optimizer for Hybrid Sankey
 * Minimizes path crossings using iterative improvement
 */

import { HybridNode, HybridLink } from './hybridSankeyLayout';
import { calculatePathCollision } from './hybridPathGenerator';

/**
 * Calculate crossing score for current layout
 * Lower is better
 */
function calculateCrossingScore(nodes: HybridNode[], links: HybridLink[]): number {
  let score = 0;
  
  // Check all pairs of links for crossings
  for (let i = 0; i < links.length; i++) {
    for (let j = i + 1; j < links.length; j++) {
      const link1 = links[i];
      const link2 = links[j];
      
      // Skip if links share a node
      if (link1.source.id === link2.source.id || 
          link1.source.id === link2.target.id ||
          link1.target.id === link2.source.id || 
          link1.target.id === link2.target.id) {
        continue;
      }
      
      // Check if paths cross
      if (doPathsCross(link1, link2)) {
        score += 1;
      }
    }
  }
  
  return score;
}

/**
 * Check if two paths cross each other
 */
function doPathsCross(link1: HybridLink, link2: HybridLink): boolean {
  const x1a = link1.source.x;
  const y1a = link1.source.y;
  const x1b = link1.target.x;
  const y1b = link1.target.y;
  
  const x2a = link2.source.x;
  const y2a = link2.source.y;
  const x2b = link2.target.x;
  const y2b = link2.target.y;
  
  // Use line segment intersection algorithm
  const denom = ((y2b - y2a) * (x1b - x1a)) - ((x2b - x2a) * (y1b - y1a));
  
  if (denom === 0) return false; // Parallel
  
  const ua = (((x2b - x2a) * (y1a - y2a)) - ((y2b - y2a) * (x1a - x2a))) / denom;
  const ub = (((x1b - x1a) * (y1a - y2a)) - ((y1b - y1a) * (x1a - x2a))) / denom;
  
  return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
}

/**
 * Optimize layout to minimize crossings
 * Uses simple swapping within columns
 */
export function optimizeLayoutSimple(
  nodes: HybridNode[],
  links: HybridLink[],
  maxIterations: number = 50
): HybridNode[] {
  let currentNodes = [...nodes];
  let currentScore = calculateCrossingScore(currentNodes, links);
  let improved = true;
  let iteration = 0;
  
  console.log(`Initial crossing score: ${currentScore}`);
  
  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;
    
    // Group nodes by column
    const columnMap = new Map<number, HybridNode[]>();
    currentNodes.forEach(node => {
      if (!columnMap.has(node.column)) {
        columnMap.set(node.column, []);
      }
      columnMap.get(node.column)!.push(node);
    });
    
    // Try swapping pairs within each column
    columnMap.forEach((columnNodes, columnIndex) => {
      if (columnNodes.length < 2) return;
      
      for (let i = 0; i < columnNodes.length - 1; i++) {
        for (let j = i + 1; j < columnNodes.length; j++) {
          // Swap nodes
          const node1 = columnNodes[i];
          const node2 = columnNodes[j];
          
          const tempY = node1.y;
          node1.y = node2.y;
          node2.y = tempY;
          
          const tempRow = node1.row;
          node1.row = node2.row;
          node2.row = tempRow;
          
          // Calculate new score
          const newScore = calculateCrossingScore(currentNodes, links);
          
          if (newScore < currentScore) {
            // Keep the swap
            currentScore = newScore;
            improved = true;
            console.log(`Iteration ${iteration}: Improved score to ${currentScore}`);
          } else {
            // Revert swap
            node1.y = tempY;
            node2.y = node1.y;
            node1.row = tempRow;
            node2.row = node1.row;
          }
        }
      }
    });
  }
  
  console.log(`Final crossing score: ${currentScore} after ${iteration} iterations`);
  return currentNodes;
}

/**
 * Sort nodes within columns by barycenter
 * (average position of connected nodes)
 */
export function optimizeByBarycenter(
  nodes: HybridNode[],
  links: HybridLink[]
): HybridNode[] {
  const optimizedNodes = [...nodes];
  
  // Group by column
  const columnMap = new Map<number, HybridNode[]>();
  optimizedNodes.forEach(node => {
    if (!columnMap.has(node.column)) {
      columnMap.set(node.column, []);
    }
    columnMap.get(node.column)!.push(node);
  });
  
  // Process each column
  columnMap.forEach((columnNodes, columnIndex) => {
    if (columnNodes.length < 2) return;
    
    // Calculate barycenter for each node
    const barycenters = columnNodes.map(node => {
      const incoming = links.filter(l => l.target.id === node.id);
      const outgoing = links.filter(l => l.source.id === node.id);
      
      const connectedYs = [
        ...incoming.map(l => l.source.y),
        ...outgoing.map(l => l.target.y)
      ].filter(y => y > 0);
      
      const barycenter = connectedYs.length > 0
        ? connectedYs.reduce((sum, y) => sum + y, 0) / connectedYs.length
        : node.y;
      
      return { node, barycenter };
    });
    
    // Sort by barycenter
    barycenters.sort((a, b) => a.barycenter - b.barycenter);
    
    // Reassign Y positions
    const baseY = columnNodes[0].y;
    const spacing = columnNodes.length > 1 
      ? (columnNodes[columnNodes.length - 1].y - baseY) / (columnNodes.length - 1)
      : 0;
    
    barycenters.forEach((item, index) => {
      item.node.y = baseY + (index * spacing);
      item.node.row = index;
    });
  });
  
  return optimizedNodes;
}

/**
 * Full optimization combining multiple strategies
 */
export function optimizeLayoutFull(
  nodes: HybridNode[],
  links: HybridLink[]
): HybridNode[] {
  // First pass: barycenter sort
  let optimized = optimizeByBarycenter(nodes, links);
  
  // Second pass: iterative improvement
  optimized = optimizeLayoutSimple(optimized, links, 30);
  
  return optimized;
}