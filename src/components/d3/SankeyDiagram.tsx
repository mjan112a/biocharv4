'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useSystemData } from '@/hooks/useSystemData';
import { getIconPath } from '@/lib/iconMapping';

interface SankeyNode {
  id: string;
  label: string;
  value?: number;
  color: string;
  x?: number;
  y?: number;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color: string;
  label?: string;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

/**
 * Color mapping for components and materials
 */
const COLOR_MAP: Record<string, string> = {
  // Components
  'chicken-house': '#059669',
  'processing-plant': '#3B82F6',
  'anaerobic-digester': '#8B5CF6',
  'pyrolysis-unit': '#F59E0B',
  'farm-waterways': '#10B981',
  
  // Materials - Inputs
  'pine': '#8B7355',
  'feed': '#FFA500',
  'fossil': '#DC2626',
  'water': '#3B82F6',
  
  // Materials - Outputs
  'meat': '#10B981',
  'biochar': '#065F46',
  'digestate': '#059669',
  'syngas': '#F59E0B',
  'methane': '#8B5CF6',
  'emissions': '#991B1B',
  'waste': '#DC2626',
  'runoff': '#DC2626',
};

/**
 * Estimate flow quantity based on material type
 */
function estimateFlowValue(material: string): number {
  const lower = material.toLowerCase();
  
  // High volume flows
  if (lower.includes('feed') || lower.includes('chicken')) return 2000;
  if (lower.includes('birds') || lower.includes('live')) return 1800;
  if (lower.includes('meat')) return 1300;
  
  // Medium volume flows
  if (lower.includes('litter') || lower.includes('waste')) return 500;
  if (lower.includes('pine') || lower.includes('shavings')) return 500;
  if (lower.includes('digestate')) return 300;
  
  // Low volume flows
  if (lower.includes('biochar')) return 60;
  if (lower.includes('syngas') || lower.includes('energy')) return 150;
  if (lower.includes('methane') || lower.includes('bio')) return 120;
  if (lower.includes('emissions') || lower.includes('co2')) return 200;
  if (lower.includes('fossil') || lower.includes('fuel')) return 100;
  
  // Default
  return 100;
}

/**
 * Get color for material/component
 */
function getColor(id: string, material?: string): string {
  // Try exact match first
  if (COLOR_MAP[id]) return COLOR_MAP[id];
  
  // Try material-based color
  if (material) {
    const lower = material.toLowerCase();
    if (lower.includes('waste') || lower.includes('emissions')) return '#DC2626';
    if (lower.includes('energy') || lower.includes('syngas')) return '#F59E0B';
    if (lower.includes('biochar')) return '#065F46';
    if (lower.includes('digestate')) return '#059669';
    if (lower.includes('methane')) return '#8B5CF6';
  }
  
  // Default colors by component type
  return '#6B7280';
}

export function SankeyDiagram() {
  const { currentView: systemView } = useSystemData();
  
  const svgRef = useRef<SVGSVGElement>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);

  /**
   * Hardcoded Sankey data (JSON structure not designed for Sankey material nodes)
   */
  const data = useMemo((): SankeyData => {
    if (systemView === 'current') {
      return {
        nodes: [
          { id: 'pine', label: 'Pine Shavings', color: '#8B7355', value: 500 },
          { id: 'feed', label: 'Chicken Feed', color: '#FFA500', value: 2000 },
          { id: 'fossil', label: 'Fossil Fuels', color: '#DC2626', value: 100 },
          { id: 'chicken-house', label: 'Chicken House', color: '#059669', value: 1000 },
          { id: 'processing', label: 'Processing Plant', color: '#3B82F6', value: 1000 },
          { id: 'meat', label: 'Chicken Meat', color: '#10B981', value: 1300 },
          { id: 'litter-waste', label: 'Waste Litter', color: '#DC2626', value: 500 },
          { id: 'emissions', label: 'GHG Emissions', color: '#991B1B', value: 200 },
          { id: 'runoff', label: 'Nutrient Runoff', color: '#DC2626', value: 300 }
        ],
        links: [
          { source: 'pine', target: 'chicken-house', value: 500, color: '#8B7355' },
          { source: 'feed', target: 'chicken-house', value: 2000, color: '#FFA500' },
          { source: 'chicken-house', target: 'processing', value: 1800, color: '#059669', label: 'Live Birds' },
          { source: 'processing', target: 'meat', value: 1300, color: '#10B981' },
          { source: 'fossil', target: 'processing', value: 100, color: '#DC2626' },
          { source: 'processing', target: 'emissions', value: 200, color: '#991B1B' },
          { source: 'chicken-house', target: 'litter-waste', value: 500, color: '#DC2626' },
          { source: 'litter-waste', target: 'runoff', value: 300, color: '#DC2626' }
        ]
      };
    } else {
      return {
        nodes: [
          { id: 'pine', label: 'Pine Shavings', color: '#8B7355', value: 500 },
          { id: 'feed', label: 'Chicken Feed', color: '#FFA500', value: 2000 },
          { id: 'chicken-house', label: 'Chicken House', color: '#059669', value: 1000 },
          { id: 'processing', label: 'Processing Plant', color: '#3B82F6', value: 1000 },
          { id: 'anaerobic-digester', label: 'Anaerobic Digester', color: '#8B5CF6', value: 800 },
          { id: 'pyrolysis-unit', label: 'Pyrolysis Unit', color: '#F59E0B', value: 800 },
          { id: 'meat', label: 'Chicken Meat', color: '#10B981', value: 1300 },
          { id: 'digestate', label: 'Digestate', color: '#059669', value: 300 },
          { id: 'methane', label: 'Bio-Methane', color: '#8B5CF6', value: 120 },
          { id: 'biochar', label: 'Biochar', color: '#065F46', value: 60 },
          { id: 'syngas', label: 'Syngas Energy', color: '#F59E0B', value: 150 }
        ],
        links: [
          { source: 'pine', target: 'chicken-house', value: 500, color: '#8B7355' },
          { source: 'feed', target: 'chicken-house', value: 2000, color: '#FFA500' },
          { source: 'chicken-house', target: 'processing', value: 1800, color: '#059669', label: 'Live Birds' },
          { source: 'processing', target: 'meat', value: 1300, color: '#10B981' },
          { source: 'chicken-house', target: 'anaerobic-digester', value: 350, color: '#8B5CF6', label: 'Litter to AD' },
          { source: 'chicken-house', target: 'pyrolysis-unit', value: 250, color: '#F59E0B', label: 'Litter to Pyrolysis' },
          { source: 'processing', target: 'anaerobic-digester', value: 200, color: '#8B5CF6', label: 'FOG to AD' },
          { source: 'anaerobic-digester', target: 'digestate', value: 300, color: '#059669' },
          { source: 'anaerobic-digester', target: 'methane', value: 120, color: '#8B5CF6' },
          { source: 'pyrolysis-unit', target: 'biochar', value: 60, color: '#065F46' },
          { source: 'pyrolysis-unit', target: 'syngas', value: 150, color: '#F59E0B' },
          { source: 'pyrolysis-unit', target: 'anaerobic-digester', value: 40, color: '#8B5CF6', label: 'Biochar to AD' },
          { source: 'biochar', target: 'chicken-house', value: 20, color: '#065F46', label: 'Biochar Bedding' }
        ]
      };
    }
  }, [systemView]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const width = 900;
    const height = 600;
    const margin = { top: 40, right: 150, bottom: 40, left: 150 };

    // Create node positions for both views
    const nodePositions = new Map<string, { x: number; y: number }>();
    
    if (systemView === 'current') {
      nodePositions.set('pine', { x: margin.left, y: 100 });
      nodePositions.set('feed', { x: margin.left, y: 200 });
      nodePositions.set('fossil', { x: margin.left, y: 300 });
      nodePositions.set('chicken-house', { x: width / 2 - 50, y: 150 });
      nodePositions.set('processing', { x: width / 2 - 50, y: 350 });
      nodePositions.set('meat', { x: width - margin.right, y: 150 });
      nodePositions.set('litter-waste', { x: width - margin.right, y: 300 });
      nodePositions.set('emissions', { x: width - margin.right, y: 400 });
      nodePositions.set('runoff', { x: width - margin.right, y: 500 });
    } else {
      nodePositions.set('pine', { x: margin.left, y: 150 });
      nodePositions.set('feed', { x: margin.left, y: 250 });
      nodePositions.set('chicken-house', { x: width / 3 - 20, y: 200 });
      nodePositions.set('ad', { x: width / 2 + 20, y: 150 });
      nodePositions.set('pyrolysis', { x: width / 2 + 20, y: 300 });
      nodePositions.set('processing', { x: width / 2 + 20, y: 450 });
      nodePositions.set('meat', { x: width - margin.right, y: 100 });
      nodePositions.set('digestate', { x: width - margin.right, y: 200 });
      nodePositions.set('methane', { x: width - margin.right, y: 300 });
      nodePositions.set('biochar', { x: width - margin.right, y: 400 });
      nodePositions.set('syngas', { x: width - margin.right, y: 500 });
    }

    // Initialize on first render
    if (isFirstRender) {
      svg.selectAll('*').remove();
      setIsFirstRender(false);
    }

    // Create/update defs
    let defs = svg.select<SVGDefsElement>('defs');
    if (defs.empty()) {
      defs = svg.append<SVGDefsElement>('defs');
    }

    // Update gradients
    const gradients = defs.selectAll('linearGradient')
      .data(data.links, (d) => `${(d as SankeyLink).source}-${(d as SankeyLink).target}`);

    gradients.exit().remove();

    const gradientsEnter = gradients.enter()
      .append('linearGradient')
      .attr('id', (d) => `gradient-${d.source}-${d.target}`)
      .attr('gradientUnits', 'userSpaceOnUse');

    gradientsEnter.append('stop')
      .attr('offset', '0%')
      .attr('stop-opacity', 0.6);

    gradientsEnter.append('stop')
      .attr('offset', '100%')
      .attr('stop-opacity', 0.3);

    // Update gradient positions and colors
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const mergedGradients = gradients.merge(gradientsEnter as any);
    mergedGradients
      .transition()
      .duration(800)
      .attr('x1', (d: any) => nodePositions.get(d.source)?.x || 0)
      .attr('y1', (d: any) => nodePositions.get(d.source)?.y || 0)
      .attr('x2', (d: any) => nodePositions.get(d.target)?.x || 0)
      .attr('y2', (d: any) => nodePositions.get(d.target)?.y || 0);

    mergedGradients.selectAll('stop')
      .data((d: any) => [d, d])
      .attr('stop-color', (d: any) => d.color);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Get or create main group
    let g = svg.select<SVGGElement>('g.main-group');
    if (g.empty()) {
      g = svg.append<SVGGElement>('g').attr('class', 'main-group');
    }

    // Helper function to create path
    const createPath = (d: SankeyLink) => {
      const sourcePos = nodePositions.get(d.source);
      const targetPos = nodePositions.get(d.target);
      if (!sourcePos || !targetPos) return '';

      const sourceX = sourcePos.x + 80;
      const sourceY = sourcePos.y;
      const targetX = targetPos.x - 80;
      const targetY = targetPos.y;
      const midX = (sourceX + targetX) / 2;

      return `M ${sourceX},${sourceY} C ${midX},${sourceY} ${midX},${targetY} ${targetX},${targetY}`;
    };

    // Update links
    const links = g.selectAll('.link')
      .data(data.links, (d) => `${(d as SankeyLink).source}-${(d as SankeyLink).target}`);

    // Exit old links
    links.exit()
      .transition()
      .duration(400)
      .style('opacity', 0)
      .remove();

    // Enter new links
    const linksEnter = links.enter()
      .append('g')
      .attr('class', 'link')
      .style('opacity', 0);

    linksEnter.append('path')
      .attr('fill', 'none')
      .attr('stroke', (d) => `url(#gradient-${d.source}-${d.target})`)
      .attr('stroke-width', (d) => Math.max(2, Math.min(20, d.value / 50)));

    linksEnter.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#374151')
      .style('pointer-events', 'none');

    // Update all links (existing + new)
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const linksUpdate = links.merge(linksEnter as any);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    linksUpdate
      .transition()
      .duration(800)
      .style('opacity', 1);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    linksUpdate.select('path')
      .transition()
      .duration(800)
      .attr('d', createPath)
      .attr('stroke-width', (d: any) => Math.max(2, Math.min(20, d.value / 50)));

    linksUpdate.select('text')
      .text((d: any) => d.label || '')
      .transition()
      .duration(800)
      .attr('x', (d: any) => {
        const sourcePos = nodePositions.get(d.source);
        const targetPos = nodePositions.get(d.target);
        return sourcePos && targetPos ? (sourcePos.x + targetPos.x) / 2 : 0;
      })
      .attr('y', (d: any) => {
        const sourcePos = nodePositions.get(d.source);
        const targetPos = nodePositions.get(d.target);
        return sourcePos && targetPos ? (sourcePos.y + targetPos.y) / 2 - 10 : 0;
      });
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Update nodes
    const nodes = g.selectAll('.node')
      .data(data.nodes, (d) => (d as SankeyNode).id);

    // Exit old nodes
    /* eslint-disable @typescript-eslint/no-explicit-any */
    nodes.exit()
      .transition()
      .duration(400)
      .style('opacity', 0)
      .attr('transform', (d: any) => {
        const pos = nodePositions.get(d.id) || { x: width / 2, y: height / 2 };
        return `translate(${pos.x}, ${pos.y}) scale(0.5)`;
      })
      .remove();
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Enter new nodes
    const nodesEnter = nodes.enter()
      .append('g')
      .attr('class', 'node')
      .style('opacity', 0)
      .attr('transform', (d) => {
        const pos = nodePositions.get(d.id) || { x: width / 2, y: height / 2 };
        return `translate(${pos.x}, ${pos.y}) scale(0.5)`;
      });

    nodesEnter.append('rect')
      .attr('x', -75)
      .attr('y', -25)
      .attr('width', 150)
      .attr('height', 50)
      .attr('rx', 8)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add icon (using foreignObject for HTML img)
    nodesEnter.append('foreignObject')
      .attr('x', -65)
      .attr('y', -15)
      .attr('width', 30)
      .attr('height', 30)
      .html((d) => {
        const iconPath = getIconPath(d.label);
        return `<img src="${iconPath}" style="width: 100%; height: 100%; object-fit: contain;" />`;
      });

    nodesEnter.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', 10)
      .attr('dy', '0.35em')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .text((d) => d.label);

    // Update all nodes (existing + new)
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const nodesUpdate = nodes.merge(nodesEnter as any);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    nodesUpdate
      .transition()
      .duration(800)
      .ease(d3.easeCubicInOut)
      .style('opacity', 1)
      .attr('transform', (d) => {
        const pos = nodePositions.get(d.id);
        return pos ? `translate(${pos.x}, ${pos.y}) scale(1)` : '';
      });

    // Update title
    let title = svg.select<SVGTextElement>('.diagram-title');
    if (title.empty()) {
      title = svg.append<SVGTextElement>('text')
        .attr('class', 'diagram-title')
        .attr('x', width / 2)
        .attr('y', 20)
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
    .text(systemView === 'current'
      ? 'Current Practice: Material Flows'
      : 'Proposed System: Circular Material Flows'
    );

  }, [systemView, isFirstRender, data.nodes, data.links]);

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 transition-all duration-500">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <svg
          ref={svgRef}
          viewBox="0 0 900 600"
          className="w-full h-auto"
          style={{ minHeight: '400px' }}
        />
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
          </>
        )}
      </div>

      {/* Key Insights */}
      <div className="mt-4 bg-blue-50 border-l-4 border-blue-600 p-4 rounded transition-all duration-500">
        <h4 className="font-semibold text-blue-900 mb-2">Key Insights:</h4>
        {systemView === 'current' ? (
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Linear waste model</strong> - disposal focused</li>
            <li>• <strong>High emissions</strong> from fossil fuel dependency</li>
            <li>• <strong>Nutrient pollution</strong> in waterways</li>
            <li>• <strong>100% external energy</strong> required</li>
          </ul>
        ) : (
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Circular economy</strong> - zero waste achieved</li>
            <li>• <strong>Carbon sequestration</strong> via biochar production</li>
            <li>• <strong>95% nutrient recovery</strong> prevents pollution</li>
            <li>• <strong>Energy self-sufficient</strong> - renewable sources</li>
          </ul>
        )}
      </div>
    </div>
  );
}