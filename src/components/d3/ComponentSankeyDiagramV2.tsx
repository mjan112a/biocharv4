'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getIconPath } from '@/lib/iconMapping';
import { FlowParticleAnimator } from '@/lib/flowParticleAnimator';

interface Tooltip {
  description?: string;
  properties?: Record<string, string>;
  benefits?: string[];
  impacts?: string[];
  economics?: Record<string, string>;
  costs?: string;
}

interface MaterialFlow {
  id: string;
  name: string;
  icon: string;
  value: number;
  unit?: string;
  source?: string;
  destination?: string;
  type?: string;
  new?: boolean;
  tooltip?: Tooltip;
}

interface ComponentDataV2 {
  component: {
    id: string;
    name: string;
    icon: string;
    description: string;
    specs?: Record<string, string>;
  };
  current: {
    inputs: MaterialFlow[];
    outputs: MaterialFlow[];
    summary: {
      energyProduction: number;
      wasteProcessed: number;
      ghgEmissions?: number;
      costPerDay?: number;
    };
  };
  proposed: {
    inputs: MaterialFlow[];
    outputs: MaterialFlow[];
    summary: {
      energyProduction: number;
      wasteProcessed: number;
      ghgReduction?: number;
      revenuePerDay?: number;
      comparison?: Record<string, string>;
    };
  };
}

interface ComponentSankeyDiagramV2Props {
  componentId: string;
  className?: string;
}

export function ComponentSankeyDiagramV2({ componentId, className = '' }: ComponentSankeyDiagramV2Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 500 });
  const particleAnimatorRef = useRef<FlowParticleAnimator | null>(null);
  const [data, setData] = useState<ComponentDataV2 | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [systemView, setSystemView] = useState<'current' | 'proposed'>('proposed');
  const [tooltipContent, setTooltipContent] = useState<{ material: MaterialFlow; x: number; y: number } | null>(null);

  // Load component flow data
  useEffect(() => {
    fetch(`/data/components/${componentId}-flows-v2.json`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error(`Failed to load ${componentId} flow data:`, err));
  }, [componentId]);

  // Handle responsive resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(700, width),
          height: 500
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show tooltip on hover
  const showTooltip = (material: MaterialFlow, event: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipContent({
        material,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  };

  const hideTooltip = () => {
    setTooltipContent(null);
  };

  // Render the Sankey diagram
  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const viewData = systemView === 'current' ? data.current : data.proposed;

    // Clear previous content
    svg.selectAll('*').remove();

    // Layout parameters
    const margin = { top: 40, right: 100, bottom: 40, left: 100 };
    const componentSize = 120;
    const nodeWidth = 80;
    const nodeHeight = 60;
    const verticalSpacing = 100;

    // Calculate positions
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Input column (left)
    const inputX = margin.left + nodeWidth / 2;
    const inputStartY = centerY - ((viewData.inputs.length - 1) * verticalSpacing) / 2;
    
    // Output column (right)
    const outputX = width - margin.right - nodeWidth / 2;
    const outputStartY = centerY - ((viewData.outputs.length - 1) * verticalSpacing) / 2;

    // Create main group
    const g = svg.append('g').attr('class', 'main-group');

    // Create flows from inputs to component
    const inputFlows = viewData.inputs.map((input, i) => {
      const startY = inputStartY + i * verticalSpacing;
      return {
        id: `input-${input.id}`,
        source: { x: inputX + nodeWidth / 2, y: startY },
        target: { x: centerX - componentSize / 2, y: centerY },
        value: input.value,
        icon: input.icon,
        color: input.new ? '#10B981' : '#9CA3AF',
        material: input
      };
    });

    // Draw flows from component to outputs
    const outputFlows = viewData.outputs.map((output, i) => {
      const endY = outputStartY + i * verticalSpacing;
      return {
        id: `output-${output.id}`,
        source: { x: centerX + componentSize / 2, y: centerY },
        target: { x: outputX - nodeWidth / 2, y: endY },
        value: output.value,
        icon: output.icon,
        color: output.type === 'energy' ? '#F59E0B' : output.type === 'negative' ? '#EF4444' : output.new ? '#10B981' : '#9CA3AF',
        material: output
      };
    });

    const allFlows = [...inputFlows, ...outputFlows];

    // Draw flow paths
    const linkGroup = g.append('g').attr('class', 'links');
    
    allFlows.forEach((flow, i) => {
      const path = `M ${flow.source.x},${flow.source.y} 
                    C ${(flow.source.x + flow.target.x) / 2},${flow.source.y}
                      ${(flow.source.x + flow.target.x) / 2},${flow.target.y}
                      ${flow.target.x},${flow.target.y}`;

      linkGroup.append('path')
        .attr('d', path)
        .attr('class', `link link-${i} link-for-${flow.material.id}`)
        .attr('stroke', flow.color)
        .attr('stroke-width', Math.max(3, Math.sqrt(flow.value) * 2))
        .attr('fill', 'none')
        .attr('opacity', hoveredItem === flow.material.id ? 0.8 : 0.4)
        .attr('stroke-dasharray', flow.material.new ? '0' : '5,5');
    });

    // Draw input nodes
    const inputGroup = g.append('g').attr('class', 'inputs');
    
    viewData.inputs.forEach((input, i) => {
      const y = inputStartY + i * verticalSpacing;
      const nodeG = inputGroup.append('g')
        .attr('class', `input-node input-${input.id}`)
        .attr('transform', `translate(${inputX},${y})`)
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          setHoveredItem(input.id);
          // Store event data for tooltip
          const mouseEvent = event as unknown as React.MouseEvent;
          if (input.tooltip) {
            showTooltip(input, mouseEvent);
          }
        })
        .on('mouseleave', () => {
          setHoveredItem(null);
          hideTooltip();
        });

      // Background box with glow on hover
      nodeG.append('rect')
        .attr('x', -nodeWidth / 2)
        .attr('y', -nodeHeight / 2)
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 8)
        .attr('fill', input.new ? '#ECFDF5' : '#F3F4F6')
        .attr('stroke', input.new ? '#10B981' : '#9CA3AF')
        .attr('stroke-width', hoveredItem === input.id ? 3 : 2)
        .style('filter', hoveredItem === input.id ? 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.4))' : 'none');

      // "NEW" badge
      if (input.new) {
        nodeG.append('rect')
          .attr('x', nodeWidth / 2 - 28)
          .attr('y', -nodeHeight / 2 - 8)
          .attr('width', 30)
          .attr('height', 16)
          .attr('rx', 8)
          .attr('fill', '#10B981');

        nodeG.append('text')
          .attr('x', nodeWidth / 2 - 13)
          .attr('y', -nodeHeight / 2 + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('font-weight', 'bold')
          .attr('fill', 'white')
          .text('NEW');
      }

      // Icon
      const iconPath = getIconPath(input.icon);
      if (iconPath !== '/images/flow-icons/placeholder.svg') {
        nodeG.append('image')
          .attr('xlink:href', iconPath)
          .attr('x', -20)
          .attr('y', -25)
          .attr('width', 40)
          .attr('height', 40)
          .style('opacity', hoveredItem === input.id ? 1 : 0.9);
      }

      // Label
      nodeG.append('text')
        .attr('y', 35)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', '#1F2937')
        .text(input.name);

      // Value
      nodeG.append('text')
        .attr('y', 48)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#6B7280')
        .text(`${input.value} ${input.unit || ''}`);
    });

    // Draw component node (center)
    const componentG = g.append('g')
      .attr('class', 'component-node')
      .attr('transform', `translate(${centerX},${centerY})`);

    // Component background
    componentG.append('rect')
      .attr('x', -componentSize / 2)
      .attr('y', -componentSize / 2)
      .attr('width', componentSize)
      .attr('height', componentSize)
      .attr('rx', 12)
      .attr('fill', '#F9FAFB')
      .attr('stroke', '#8B5CF6')
      .attr('stroke-width', 3);

    // Component icon
    const componentIconPath = getIconPath(data.component.icon);
    if (componentIconPath !== '/images/flow-icons/placeholder.svg') {
      componentG.append('image')
        .attr('xlink:href', componentIconPath)
        .attr('x', -50)
        .attr('y', -50)
        .attr('width', 100)
        .attr('height', 100);
    }

    // Component label
    componentG.append('text')
      .attr('y', componentSize / 2 + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1F2937')
      .text(data.component.name);

    // Draw output nodes
    const outputGroup = g.append('g').attr('class', 'outputs');
    
    viewData.outputs.forEach((output, i) => {
      const y = outputStartY + i * verticalSpacing;
      const nodeG = outputGroup.append('g')
        .attr('class', `output-node output-${output.id}`)
        .attr('transform', `translate(${outputX},${y})`)
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          setHoveredItem(output.id);
          const mouseEvent = event as unknown as React.MouseEvent;
          if (output.tooltip) {
            showTooltip(output, mouseEvent);
          }
        })
        .on('mouseleave', () => {
          setHoveredItem(null);
          hideTooltip();
        });

      // Background box
      const isEnergy = output.type === 'energy';
      const isNegative = output.type === 'negative';
      const bgColor = output.new ? '#ECFDF5' : isEnergy ? '#FEF3C7' : isNegative ? '#FEE2E2' : '#F3F4F6';
      const strokeColor = output.new ? '#10B981' : isEnergy ? '#F59E0B' : isNegative ? '#EF4444' : '#9CA3AF';

      nodeG.append('rect')
        .attr('x', -nodeWidth / 2)
        .attr('y', -nodeHeight / 2)
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 8)
        .attr('fill', bgColor)
        .attr('stroke', strokeColor)
        .attr('stroke-width', hoveredItem === output.id ? 3 : 2)
        .style('filter', hoveredItem === output.id ? `drop-shadow(0 4px 12px ${strokeColor}66)` : 'none');

      // "NEW" badge
      if (output.new) {
        nodeG.append('rect')
          .attr('x', nodeWidth / 2 - 28)
          .attr('y', -nodeHeight / 2 - 8)
          .attr('width', 30)
          .attr('height', 16)
          .attr('rx', 8)
          .attr('fill', '#10B981');

        nodeG.append('text')
          .attr('x', nodeWidth / 2 - 13)
          .attr('y', -nodeHeight / 2 + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('font-weight', 'bold')
          .attr('fill', 'white')
          .text('NEW');
      }

      // Icon
      const iconPath = getIconPath(output.icon);
      if (iconPath !== '/images/flow-icons/placeholder.svg') {
        nodeG.append('image')
          .attr('xlink:href', iconPath)
          .attr('x', -20)
          .attr('y', -25)
          .attr('width', 40)
          .attr('height', 40)
          .style('opacity', hoveredItem === output.id ? 1 : 0.9);
      }

      // Label
      nodeG.append('text')
        .attr('y', 35)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', '#1F2937')
        .text(output.name);

      // Value
      nodeG.append('text')
        .attr('y', 48)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#6B7280')
        .text(`${output.value} ${output.unit || ''}`);
    });

    // Initialize particle animator
    const particleAnimator = new FlowParticleAnimator(svgRef.current);
    
    const pathElementsMap = new Map<string, SVGPathElement>();
    const linksForAnimator = allFlows.map((flow, i) => {
      const pathElement = svg.select(`.link-${i}`).node() as SVGPathElement;
      if (pathElement) {
        pathElementsMap.set(flow.id, pathElement);
      }

      const iconPath = getIconPath(flow.icon);
      
      return {
        id: flow.id,
        source: 'input',
        target: 'output',
        value: flow.value,
        color: flow.color,
        type: 'material',
        iconPath: iconPath !== '/images/flow-icons/placeholder.svg' ? iconPath : undefined
      };
    });

    particleAnimator.initializeParticles(linksForAnimator, pathElementsMap);
    particleAnimatorRef.current = particleAnimator;

    return () => {
      particleAnimator.stop();
    };
  }, [data, dimensions, hoveredItem, systemView]);

  if (!data) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-gray-500">Loading component flow diagram...</div>
      </div>
    );
  }

  const viewData = systemView === 'current' ? data.current : data.proposed;

  return (
    <div ref={containerRef} className={`w-full ${className} relative`}>
      {/* Toggle Switch */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className="text-sm font-medium text-gray-600">System View:</span>
        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setSystemView('current')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              systemView === 'current'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Current System
          </button>
          <button
            onClick={() => setSystemView('proposed')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              systemView === 'proposed'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Proposed System
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">{data.component.description}</p>
      </div>

      {/* SVG Diagram */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="bg-white rounded-lg shadow-lg border border-gray-200"
      />

      {/* Tooltip */}
      {tooltipContent && (
        <div
          ref={tooltipRef}
          className="absolute z-50 bg-white rounded-lg shadow-2xl border-2 border-gray-300 p-4 max-w-sm pointer-events-none"
          style={{
            left: `${tooltipContent.x + 20}px`,
            top: `${tooltipContent.y - 50}px`,
          }}
        >
          <div className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            {tooltipContent.material.name}
            {tooltipContent.material.new && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                NEW
              </span>
            )}
          </div>
          
          {tooltipContent.material.tooltip?.description && (
            <p className="text-sm text-gray-700 mb-2">
              {tooltipContent.material.tooltip.description}
            </p>
          )}

          {tooltipContent.material.tooltip?.properties && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-gray-500 mb-1">Properties:</div>
              <div className="text-sm text-gray-700 space-y-0.5">
                {Object.entries(tooltipContent.material.tooltip.properties).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tooltipContent.material.tooltip?.benefits && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-green-700 mb-1">✓ Benefits:</div>
              <ul className="text-sm text-gray-700 space-y-0.5">
                {tooltipContent.material.tooltip.benefits.map((benefit, i) => (
                  <li key={i} className="text-xs">• {benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {tooltipContent.material.tooltip?.impacts && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-red-700 mb-1">⚠ Impacts:</div>
              <ul className="text-sm text-gray-700 space-y-0.5">
                {tooltipContent.material.tooltip.impacts.map((impact, i) => (
                  <li key={i} className="text-xs">• {impact}</li>
                ))}
              </ul>
            </div>
          )}

          {tooltipContent.material.tooltip?.economics && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-blue-700 mb-1">💰 Economics:</div>
              <div className="text-sm text-gray-700 space-y-0.5">
                {Object.entries(tooltipContent.material.tooltip.economics).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 text-xs">{key}:</span>
                    <span className="font-medium text-xs">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tooltipContent.material.tooltip?.costs && (
            <div className="text-sm text-red-600 font-medium">
              Cost: {tooltipContent.material.tooltip.costs}
            </div>
          )}
        </div>
      )}

      {/* Summary Metrics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-xs font-semibold text-blue-600 mb-1">Energy Production</div>
          <div className="text-2xl font-bold text-blue-900">
            {viewData.summary.energyProduction}
            <span className="text-sm ml-1">MJ/day</span>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-xs font-semibold text-green-600 mb-1">Waste Processed</div>
          <div className="text-2xl font-bold text-green-900">
            {viewData.summary.wasteProcessed}
            <span className="text-sm ml-1">kg/day</span>
          </div>
        </div>
        
        {systemView === 'current' && data.current.summary.ghgEmissions && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-xs font-semibold text-red-600 mb-1">GHG Emissions</div>
            <div className="text-2xl font-bold text-red-900">
              {data.current.summary.ghgEmissions}
              <span className="text-sm ml-1">kg CO₂/day</span>
            </div>
          </div>
        )}
        
        {systemView === 'proposed' && data.proposed.summary.ghgReduction && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-xs font-semibold text-green-600 mb-1">GHG Reduced</div>
            <div className="text-2xl font-bold text-green-900">
              {data.proposed.summary.ghgReduction}
              <span className="text-sm ml-1">kg CO₂/day</span>
            </div>
          </div>
        )}
        
        <div className={`rounded-lg p-4 border ${systemView === 'proposed' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`text-xs font-semibold mb-1 ${systemView === 'proposed' ? 'text-green-600' : 'text-gray-600'}`}>
            {systemView === 'proposed' ? 'Daily Revenue' : 'Daily Cost'}
          </div>
          <div className={`text-2xl font-bold ${systemView === 'proposed' ? 'text-green-900' : 'text-gray-900'}`}>
            ${systemView === 'proposed' ? data.proposed.summary.revenuePerDay : data.current.summary.costPerDay}
            <span className="text-sm ml-1">/day</span>
          </div>
        </div>
      </div>

      {/* Comparison Note */}
      {systemView === 'proposed' && data.proposed.summary.comparison && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="font-semibold text-amber-900 mb-2">💡 System Improvements:</div>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-amber-800">
            {Object.entries(data.proposed.summary.comparison).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <div>
                  <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="ml-1">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}