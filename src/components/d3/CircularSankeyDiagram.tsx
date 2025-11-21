'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useSystemData } from '@/hooks/useSystemData';
import { getIconPath } from '@/lib/iconMapping';
import {
  CircularNode,
  CircularLink,
  CircularLayoutConfig,
  createCircularLayout,
  calculateNodePosition,
  createForwardPath,
  createCircularReturnPath,
  createCrossCenterPath,
  isCircularFlow,
  getResponsiveConfig,
} from '@/lib/circularSankeyLayout';
import { FlowParticleAnimator } from '@/lib/flowParticleAnimator';

interface CircularSankeyDiagramProps {
  className?: string;
}

/**
 * Color mapping for components and materials
 */
const COLOR_MAP: Record<string, string> = {
  // Components
  'chicken-house': '#059669',
  'processing-plant': '#3B82F6',
  'processing': '#3B82F6',
  'anaerobic-digester': '#8B5CF6',
  'pyrolysis-unit': '#F59E0B',
  'farm-waterways': '#10B981',

  // Materials - Inputs
  pine: '#8B7355',
  feed: '#FFA500',
  fossil: '#DC2626',
  water: '#3B82F6',

  // Materials - Outputs
  meat: '#10B981',
  biochar: '#065F46',
  digestate: '#059669',
  syngas: '#F59E0B',
  methane: '#8B5CF6',
  emissions: '#991B1B',
  waste: '#DC2626',
  runoff: '#DC2626',
};

/**
 * Get color for node/material
 */
function getColor(id: string): string {
  return COLOR_MAP[id] || '#6B7280';
}

export function CircularSankeyDiagram({ className = '' }: CircularSankeyDiagramProps) {
  const { currentView: systemView } = useSystemData();

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<CircularLayoutConfig>(
    getResponsiveConfig(900)
  );
  const particleAnimatorRef = useRef<FlowParticleAnimator | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  /**
   * Sankey data for both system views
   */
  const data = useMemo(
    (): { nodes: CircularNode[]; links: CircularLink[] } => {
      if (systemView === 'current') {
        return {
          nodes: [
            {
              id: 'pine',
              label: 'Pine Shavings',
              color: getColor('pine'),
              nodeType: 'input',
              angle: 0,
              radius: 280,
              value: 500,
            },
            {
              id: 'feed',
              label: 'Chicken Feed',
              color: getColor('feed'),
              nodeType: 'input',
              angle: 20,
              radius: 280,
              value: 2000,
            },
            {
              id: 'fossil',
              label: 'Fossil Fuels',
              color: getColor('fossil'),
              nodeType: 'input',
              angle: 40,
              radius: 280,
              value: 100,
            },
            {
              id: 'co2',
              label: 'CO2 Gas',
              color: '#60A5FA',
              nodeType: 'input',
              angle: 60,
              radius: 280,
              value: 50,
            },
            {
              id: 'chicken-house',
              label: 'Chicken House',
              color: getColor('chicken-house'),
              nodeType: 'component',
              angle: 90,
              radius: 200,
              value: 1000,
            },
            {
              id: 'processing',
              label: 'Processing Plant',
              color: getColor('processing'),
              nodeType: 'component',
              angle: 150,
              radius: 200,
              value: 1000,
            },
            {
              id: 'meat',
              label: 'Chicken Meat',
              color: getColor('meat'),
              nodeType: 'output',
              angle: 180,
              radius: 280,
              value: 1300,
            },
            {
              id: 'litter-waste',
              label: 'Waste Litter',
              color: getColor('waste'),
              nodeType: 'output',
              angle: 240,
              radius: 280,
              value: 500,
            },
            {
              id: 'emissions',
              label: 'GHG Emissions',
              color: getColor('emissions'),
              nodeType: 'output',
              angle: 270,
              radius: 280,
              value: 200,
            },
            {
              id: 'runoff',
              label: 'Nutrient Runoff',
              color: getColor('runoff'),
              nodeType: 'output',
              angle: 300,
              radius: 280,
              value: 300,
            },
          ],
          links: [
            {
              source: 'pine',
              target: 'chicken-house',
              value: 500,
              color: getColor('pine'),
              type: 'material',
            },
            {
              source: 'feed',
              target: 'chicken-house',
              value: 2000,
              color: getColor('feed'),
              type: 'material',
            },
            {
              source: 'chicken-house',
              target: 'processing',
              value: 1800,
              color: getColor('chicken-house'),
              type: 'material',
              label: 'Live Birds',
            },
            {
              source: 'processing',
              target: 'meat',
              value: 1300,
              color: getColor('meat'),
              type: 'material',
            },
            {
              source: 'fossil',
              target: 'processing',
              value: 100,
              color: getColor('fossil'),
              type: 'energy',
            },
            {
              source: 'co2',
              target: 'processing',
              value: 50,
              color: '#60A5FA',
              type: 'gas',
            },
            {
              source: 'processing',
              target: 'emissions',
              value: 200,
              color: getColor('emissions'),
              type: 'gas',
            },
            {
              source: 'chicken-house',
              target: 'litter-waste',
              value: 500,
              color: getColor('waste'),
              type: 'manure',
            },
            {
              source: 'litter-waste',
              target: 'runoff',
              value: 300,
              color: getColor('runoff'),
              type: 'material',
            },
          ],
        };
      } else {
        return {
          nodes: [
            {
              id: 'pine',
              label: 'Pine Shavings',
              color: getColor('pine'),
              nodeType: 'input',
              angle: 0,
              radius: 280,
              value: 500,
            },
            {
              id: 'feed',
              label: 'Chicken Feed',
              color: getColor('feed'),
              nodeType: 'input',
              angle: 20,
              radius: 280,
              value: 2000,
            },
            {
              id: 'co2',
              label: 'CO2 Gas',
              color: '#60A5FA',
              nodeType: 'input',
              angle: 40,
              radius: 280,
              value: 50,
            },
            {
              id: 'chicken-house',
              label: 'Chicken House',
              color: getColor('chicken-house'),
              nodeType: 'component',
              angle: 90,
              radius: 200,
              value: 1000,
            },
            {
              id: 'processing',
              label: 'Processing Plant',
              color: getColor('processing'),
              nodeType: 'component',
              angle: 150,
              radius: 200,
              value: 1000,
            },
            {
              id: 'pyrolysis-unit',
              label: 'Pyrolysis Unit',
              color: getColor('pyrolysis-unit'),
              nodeType: 'treatment',
              angle: 270,
              radius: 120,
              value: 800,
            },
            {
              id: 'anaerobic-digester',
              label: 'Anaerobic Digester',
              color: getColor('anaerobic-digester'),
              nodeType: 'treatment',
              angle: 300,
              radius: 120,
              value: 800,
            },
            {
              id: 'meat',
              label: 'Chicken Meat',
              color: getColor('meat'),
              nodeType: 'output',
              angle: 180,
              radius: 280,
              value: 1300,
            },
            {
              id: 'digestate',
              label: 'Digestate',
              color: getColor('digestate'),
              nodeType: 'recovery',
              angle: 285,
              radius: 280,
              value: 300,
            },
            {
              id: 'methane',
              label: 'Bio-Methane',
              color: getColor('methane'),
              nodeType: 'recovery',
              angle: 315,
              radius: 280,
              value: 120,
            },
            {
              id: 'biochar',
              label: 'Biochar',
              color: getColor('biochar'),
              nodeType: 'recovery',
              angle: 240,
              radius: 280,
              value: 60,
            },
            {
              id: 'syngas',
              label: 'Syngas Energy',
              color: getColor('syngas'),
              nodeType: 'recovery',
              angle: 255,
              radius: 280,
              value: 150,
            },
          ],
          links: [
            {
              source: 'pine',
              target: 'chicken-house',
              value: 500,
              color: getColor('pine'),
              type: 'material',
            },
            {
              source: 'feed',
              target: 'chicken-house',
              value: 2000,
              color: getColor('feed'),
              type: 'material',
            },
            {
              source: 'co2',
              target: 'processing',
              value: 50,
              color: '#60A5FA',
              type: 'gas',
            },
            {
              source: 'chicken-house',
              target: 'processing',
              value: 1800,
              color: getColor('chicken-house'),
              type: 'material',
              label: 'Live Birds',
            },
            {
              source: 'processing',
              target: 'meat',
              value: 1300,
              color: getColor('meat'),
              type: 'material',
            },
            {
              source: 'chicken-house',
              target: 'anaerobic-digester',
              value: 350,
              color: getColor('anaerobic-digester'),
              type: 'manure',
              label: 'Litter to AD',
            },
            {
              source: 'chicken-house',
              target: 'pyrolysis-unit',
              value: 250,
              color: getColor('pyrolysis-unit'),
              type: 'manure',
              label: 'Litter to Pyrolysis',
            },
            {
              source: 'processing',
              target: 'anaerobic-digester',
              value: 200,
              color: getColor('anaerobic-digester'),
              type: 'material',
              label: 'FOG to AD',
            },
            {
              source: 'anaerobic-digester',
              target: 'digestate',
              value: 300,
              color: getColor('digestate'),
              type: 'material',
            },
            {
              source: 'anaerobic-digester',
              target: 'methane',
              value: 120,
              color: getColor('methane'),
              type: 'gas',
            },
            {
              source: 'pyrolysis-unit',
              target: 'biochar',
              value: 60,
              color: getColor('biochar'),
              type: 'biochar',
            },
            {
              source: 'pyrolysis-unit',
              target: 'syngas',
              value: 150,
              color: getColor('syngas'),
              type: 'energy',
            },
            {
              source: 'pyrolysis-unit',
              target: 'anaerobic-digester',
              value: 40,
              color: getColor('anaerobic-digester'),
              type: 'biochar',
              label: 'Biochar to AD',
            },
            {
              source: 'biochar',
              target: 'chicken-house',
              value: 20,
              color: getColor('biochar'),
              type: 'biochar',
              label: 'Biochar Bedding',
              isCircular: true,
              arcRadius: 0.75, // Control curve depth (can be adjusted via config)
            },
          ],
        };
      }
    },
    [systemView]
  );

  /**
   * Calculate node positions
   */
  const nodePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();

    data.nodes.forEach((node) => {
      const pos = calculateNodePosition(node.angle, node.radius, config);
      positions.set(node.id, pos);
    });

    return positions;
  }, [data.nodes, config]);

  /**
   * Handle window resize
   */
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setConfig(getResponsiveConfig(width));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Render diagram
   */
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = config.centerX * 2;
    const height = config.centerY * 2;
    
    // Add substantial padding to viewBox, especially at bottom for return connectors
    const paddingTop = 100;
    const paddingSides = 100;
    const paddingBottom = 350; // Extra space for return paths
    
    const viewBoxWidth = width + (paddingSides * 2);
    const viewBoxHeight = height + paddingTop + paddingBottom;
    const viewBoxX = -paddingSides;
    const viewBoxY = -paddingTop;

    // Set viewBox with asymmetric padding
    svg.attr('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);

    // Create/update defs for gradients
    let defs = svg.select<SVGDefsElement>('defs');
    if (defs.empty()) {
      defs = svg.append<SVGDefsElement>('defs');
    }

    // Update gradients for each link
    const gradients = defs
      .selectAll<SVGLinearGradientElement, CircularLink>('linearGradient')
      .data(data.links, (d) => `${d.source}-${d.target}`);

    gradients.exit().remove();

    const gradientsEnter = gradients
      .enter()
      .append('linearGradient')
      .attr('id', (d) => `gradient-${d.source}-${d.target}`)
      .attr('gradientUnits', 'userSpaceOnUse');

    gradientsEnter.append('stop').attr('offset', '0%').attr('stop-opacity', 0.6);

    gradientsEnter.append('stop').attr('offset', '100%').attr('stop-opacity', 0.3);

    const mergedGradients = gradients.merge(gradientsEnter);
    mergedGradients
      .transition()
      .duration(800)
      .attr('x1', (d) => nodePositions.get(d.source)?.x || 0)
      .attr('y1', (d) => nodePositions.get(d.source)?.y || 0)
      .attr('x2', (d) => nodePositions.get(d.target)?.x || 0)
      .attr('y2', (d) => nodePositions.get(d.target)?.y || 0);

    mergedGradients.selectAll('stop').data((d) => [d, d]).attr('stop-color', (d) => d.color);

    // Get or create main group
    let g = svg.select<SVGGElement>('g.main-group');
    if (g.empty()) {
      g = svg.append<SVGGElement>('g').attr('class', 'main-group');
    }

    // Helper to create path based on link type
    const createPath = (d: CircularLink): string => {
      const sourcePos = nodePositions.get(d.source);
      const targetPos = nodePositions.get(d.target);
      const sourceNode = data.nodes.find((n) => n.id === d.source);
      const targetNode = data.nodes.find((n) => n.id === d.target);

      if (!sourcePos || !targetPos || !sourceNode || !targetNode) return '';

      // Adjust positions to node edges
      const sourceX = sourcePos.x + (targetPos.x > sourcePos.x ? 80 : -80);
      const sourceY = sourcePos.y;
      const targetX = targetPos.x + (targetPos.x > sourcePos.x ? -80 : 80);
      const targetY = targetPos.y;

      const adjustedSourcePos = { x: sourceX, y: sourceY };
      const adjustedTargetPos = { x: targetX, y: targetY };

      // Use circular return path for closed-loop flows
      if (d.isCircular || isCircularFlow(d)) {
        return createCircularReturnPath(
          adjustedSourcePos,
          adjustedTargetPos,
          sourceNode.angle,
          targetNode.angle,
          config.centerX,
          config.centerY,
          true,
          d.arcRadius // Pass custom arc radius if specified
        );
      }

      // Use cross-center path for treatment connections
      if (sourceNode.nodeType === 'treatment' || targetNode.nodeType === 'treatment') {
        return createCrossCenterPath(
          adjustedSourcePos,
          adjustedTargetPos,
          config.centerX,
          config.centerY
        );
      }

      // Default forward path
      return createForwardPath(adjustedSourcePos, adjustedTargetPos);
    };

    // Update links
    const links = g
      .selectAll<SVGGElement, CircularLink>('.link')
      .data(data.links, (d) => `${d.source}-${d.target}`);

    links.exit().transition().duration(400).style('opacity', 0).remove();

    const linksEnter = links
      .enter()
      .append('g')
      .attr('class', 'link')
      .style('opacity', 0);

    linksEnter
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d) => `url(#gradient-${d.source}-${d.target})`)
      .attr('stroke-width', (d) => Math.max(2, Math.min(20, d.value / 50)))
      .style('stroke-dasharray', (d) => (d.isCircular ? '8,4' : 'none'));

    linksEnter
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#374151')
      .style('pointer-events', 'none');

    const linksUpdate = links.merge(linksEnter);

    linksUpdate.transition().duration(800).style('opacity', 1);

    linksUpdate
      .select('path')
      .transition()
      .duration(800)
      .attr('d', createPath)
      .attr('stroke-width', (d) => Math.max(2, Math.min(20, d.value / 50)));

    linksUpdate
      .select('text')
      .text((d) => d.label || '')
      .transition()
      .duration(800)
      .attr('x', (d) => {
        const sourcePos = nodePositions.get(d.source);
        const targetPos = nodePositions.get(d.target);
        return sourcePos && targetPos ? (sourcePos.x + targetPos.x) / 2 : 0;
      })
      .attr('y', (d) => {
        const sourcePos = nodePositions.get(d.source);
        const targetPos = nodePositions.get(d.target);
        return sourcePos && targetPos ? (sourcePos.y + targetPos.y) / 2 - 10 : 0;
      });

    // Store path elements for particle animator
    const pathElements = new Map<string, SVGPathElement>();
    linksUpdate.each(function (d) {
      const pathElement = d3.select(this).select('path').node() as SVGPathElement;
      if (pathElement) {
        pathElements.set(`${d.source}-${d.target}`, pathElement);
      }
    });

    // Update nodes
    const nodes = g
      .selectAll<SVGGElement, CircularNode>('.node')
      .data(data.nodes, (d) => d.id);

    // Exit old nodes
    /* eslint-disable @typescript-eslint/no-explicit-any */
    nodes
      .exit()
      .transition()
      .duration(400)
      .style('opacity', 0)
      .attr('transform', (d: any) => {
        const pos = nodePositions.get(d.id) || {
          x: config.centerX,
          y: config.centerY,
        };
        return `translate(${pos.x}, ${pos.y}) scale(0.5)`;
      })
      .remove();
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const nodesEnter = nodes
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('opacity', 0)
      .attr('transform', (d) => {
        const pos = nodePositions.get(d.id) || {
          x: config.centerX,
          y: config.centerY,
        };
        return `translate(${pos.x}, ${pos.y}) scale(0.5)`;
      })
      .style('cursor', 'pointer');

    nodesEnter
      .append('rect')
      .attr('x', -75)
      .attr('y', -25)
      .attr('width', 150)
      .attr('height', 50)
      .attr('rx', 8)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    nodesEnter
      .append('foreignObject')
      .attr('x', -65)
      .attr('y', -15)
      .attr('width', 30)
      .attr('height', 30)
      .html((d) => {
        const iconPath = getIconPath(d.label);
        return `<img src="${iconPath}" style="width: 100%; height: 100%; object-fit: contain;" />`;
      });

    nodesEnter
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', 10)
      .attr('dy', '0.35em')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .text((d) => d.label);

    const nodesUpdate = nodes.merge(nodesEnter);

    nodesUpdate
      .transition()
      .duration(800)
      .ease(d3.easeCubicInOut)
      .style('opacity', 1)
      .attr('transform', (d) => {
        const pos = nodePositions.get(d.id);
        return pos ? `translate(${pos.x}, ${pos.y}) scale(1)` : '';
      });

    // Add hover interactions
    nodesUpdate
      .on('mouseenter', function (event, d) {
        setHoveredNode(d.id);
        d3.select(this).transition().duration(200).attr('transform', () => {
          const pos = nodePositions.get(d.id);
          return pos ? `translate(${pos.x}, ${pos.y}) scale(1.1)` : '';
        });
      })
      .on('mouseleave', function (event, d) {
        setHoveredNode(null);
        d3.select(this).transition().duration(200).attr('transform', () => {
          const pos = nodePositions.get(d.id);
          return pos ? `translate(${pos.x}, ${pos.y}) scale(1)` : '';
        });
      });

    // Update title
    let title = svg.select<SVGTextElement>('.diagram-title');
    if (title.empty()) {
      title = svg
        .append<SVGTextElement>('text')
        .attr('class', 'diagram-title')
        .attr('x', config.centerX)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', '#111827');
    }

    title
      .transition()
      .duration(400)
      .style('opacity', 0)
      .transition()
      .duration(400)
      .style('opacity', 1)
      .attr('x', config.centerX)
      .text(
        systemView === 'current'
          ? 'Current Practice: Material Flows'
          : 'Proposed System: Circular Material Flows'
      );

    // Initialize particle animator
    if (particleAnimatorRef.current) {
      particleAnimatorRef.current.destroy();
    }

    const linkData = data.links.map((link) => ({
      id: `${link.source}-${link.target}`,
      source: link.source,
      target: link.target,
      value: link.value,
      color: link.color,
      type: link.type,
    }));

    particleAnimatorRef.current = new FlowParticleAnimator(svgRef.current);
    particleAnimatorRef.current.initializeParticles(linkData, pathElements);

    return () => {
      if (particleAnimatorRef.current) {
        particleAnimatorRef.current.destroy();
        particleAnimatorRef.current = null;
      }
    };
  }, [systemView, data, nodePositions, config]);

  return (
    <div
      ref={containerRef}
      className={`w-full bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 transition-all duration-500 ${className}`}
    >
      <div className="bg-white rounded-lg shadow-lg p-4">
        <svg ref={svgRef} className="w-full h-auto" style={{ minHeight: '400px' }} />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm transition-all duration-500">
        {systemView === 'current' ? (
          <>
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-4 h-4 rounded bg-red-600"></div>
              <span>Waste/Emissions</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-4 h-4 rounded bg-green-600"></div>
              <span>Production</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-4 h-4 rounded bg-green-700"></div>
              <span>Biochar (Carbon Sink)</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-4 h-4 rounded bg-purple-600"></div>
              <span>Renewable Energy</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-4 h-4 rounded bg-green-600"></div>
              <span>Nutrient Recovery</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-4 h-4 rounded-full bg-gray-400 animate-pulse"></div>
              <span>Flow Animation</span>
            </div>
          </>
        )}
      </div>

      {/* Key Insights */}
      <div className="mt-4 bg-blue-50 border-l-4 border-blue-600 p-4 rounded transition-all duration-500">
        <h4 className="font-semibold text-blue-900 mb-2">Key Insights:</h4>
        {systemView === 'current' ? (
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              • <strong>Linear waste model</strong> - disposal focused
            </li>
            <li>
              • <strong>High emissions</strong> from fossil fuel dependency
            </li>
            <li>
              • <strong>Nutrient pollution</strong> in waterways
            </li>
            <li>
              • <strong>100% external energy</strong> required
            </li>
          </ul>
        ) : (
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              • <strong>Circular economy</strong> - zero waste achieved
            </li>
            <li>
              • <strong>Carbon sequestration</strong> via biochar production
            </li>
            <li>
              • <strong>95% nutrient recovery</strong> prevents pollution
            </li>
            <li>
              • <strong>Energy self-sufficient</strong> - renewable sources
            </li>
            <li>
              • <strong>Closed-loop flows</strong> - biochar returns to chicken house
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}