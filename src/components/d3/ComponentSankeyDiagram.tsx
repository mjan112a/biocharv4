'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getIconPath } from '@/lib/iconMapping';
import { FlowParticleAnimator } from '@/lib/flowParticleAnimator';

interface MaterialFlow {
  id: string;
  name: string;
  icon: string;
  value: number;
  unit?: string;
  source?: string;
  destination?: string;
  type?: string;
}

interface ComponentData {
  component: {
    id: string;
    name: string;
    icon: string;
    description: string;
  };
  inputs: MaterialFlow[];
  outputs: MaterialFlow[];
}

interface ComponentSankeyDiagramProps {
  componentId: string;
  className?: string;
}

export function ComponentSankeyDiagram({ componentId, className = '' }: ComponentSankeyDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 500 });
  const particleAnimatorRef = useRef<FlowParticleAnimator | null>(null);
  const [data, setData] = useState<ComponentData | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Load component flow data
  useEffect(() => {
    fetch(`/data/components/${componentId}-flows.json`)
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

  // Render the Sankey diagram
  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

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
    const inputStartY = centerY - ((data.inputs.length - 1) * verticalSpacing) / 2;
    
    // Output column (right)
    const outputX = width - margin.right - nodeWidth / 2;
    const outputStartY = centerY - ((data.outputs.length - 1) * verticalSpacing) / 2;

    // Create main group
    const g = svg.append('g').attr('class', 'main-group');

    // Create defs for gradients
    const defs = svg.append('defs');

    // Draw flows from inputs to component
    const inputFlows = data.inputs.map((input, i) => {
      const startY = inputStartY + i * verticalSpacing;
      return {
        id: `input-${input.id}`,
        source: { x: inputX + nodeWidth / 2, y: startY },
        target: { x: centerX - componentSize / 2, y: centerY },
        value: input.value,
        icon: input.icon,
        color: '#3B82F6'
      };
    });

    // Draw flows from component to outputs
    const outputFlows = data.outputs.map((output, i) => {
      const endY = outputStartY + i * verticalSpacing;
      return {
        id: `output-${output.id}`,
        source: { x: centerX + componentSize / 2, y: centerY },
        target: { x: outputX - nodeWidth / 2, y: endY },
        value: output.value,
        icon: output.icon,
        color: output.type === 'energy' ? '#F59E0B' : '#10B981'
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
        .attr('class', `link link-${i}`)
        .attr('stroke', flow.color)
        .attr('stroke-width', Math.max(3, Math.sqrt(flow.value) * 2))
        .attr('fill', 'none')
        .attr('opacity', 0.4);
    });

    // Draw input nodes
    const inputGroup = g.append('g').attr('class', 'inputs');
    
    data.inputs.forEach((input, i) => {
      const y = inputStartY + i * verticalSpacing;
      const nodeG = inputGroup.append('g')
        .attr('class', `input-node input-${input.id}`)
        .attr('transform', `translate(${inputX},${y})`)
        .style('cursor', 'pointer')
        .on('mouseenter', () => setHoveredItem(input.id))
        .on('mouseleave', () => setHoveredItem(null));

      // Background box
      nodeG.append('rect')
        .attr('x', -nodeWidth / 2)
        .attr('y', -nodeHeight / 2)
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 8)
        .attr('fill', '#EFF6FF')
        .attr('stroke', '#3B82F6')
        .attr('stroke-width', 2);

      // Icon
      const iconPath = getIconPath(input.icon);
      if (iconPath !== '/images/flow-icons/placeholder.svg') {
        nodeG.append('image')
          .attr('xlink:href', iconPath)
          .attr('x', -20)
          .attr('y', -25)
          .attr('width', 40)
          .attr('height', 40);
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
      .attr('fill', '#F3F4F6')
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
    
    data.outputs.forEach((output, i) => {
      const y = outputStartY + i * verticalSpacing;
      const nodeG = outputGroup.append('g')
        .attr('class', `output-node output-${output.id}`)
        .attr('transform', `translate(${outputX},${y})`)
        .style('cursor', 'pointer')
        .on('mouseenter', () => setHoveredItem(output.id))
        .on('mouseleave', () => setHoveredItem(null));

      // Background box
      const isEnergy = output.type === 'energy';
      nodeG.append('rect')
        .attr('x', -nodeWidth / 2)
        .attr('y', -nodeHeight / 2)
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 8)
        .attr('fill', isEnergy ? '#FEF3C7' : '#D1FAE5')
        .attr('stroke', isEnergy ? '#F59E0B' : '#10B981')
        .attr('stroke-width', 2);

      // Icon
      const iconPath = getIconPath(output.icon);
      if (iconPath !== '/images/flow-icons/placeholder.svg') {
        nodeG.append('image')
          .attr('xlink:href', iconPath)
          .attr('x', -20)
          .attr('y', -25)
          .attr('width', 40)
          .attr('height', 40);
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
  }, [data, dimensions, hoveredItem]);

  if (!data) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-gray-500">Loading component flow diagram...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">{data.component.description}</p>
      </div>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="bg-white rounded-lg shadow-lg border border-gray-200"
      />
    </div>
  );
}