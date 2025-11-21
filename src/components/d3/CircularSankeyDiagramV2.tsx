'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { getIconPath } from '@/lib/iconMapping';
import { FlowParticleAnimator } from '@/lib/flowParticleAnimator';
import { CircularSankeyConfig, DEFAULT_CONFIG } from '@/types/circular-sankey-config';
import { EnhancedTooltip } from './EnhancedTooltip';

interface Node {
  id: string;
  name: string;
  type: 'component' | 'input' | 'intermediate' | 'output' | 'energy';
  position?: string;
  icon?: string;
}

interface Flow {
  source: string;
  target: string;
  type: string;
  label: string;
  value: number;
  circular?: boolean;
}

interface CircularSankeyData {
  nodes: Node[];
  flows: Flow[];
}

interface CircularNode extends Node {
  x: number;
  y: number;
  angle?: number;
  radius?: number;
  color: string;
}

interface CircularLink {
  source: CircularNode;
  target: CircularNode;
  value: number;
  type: string;
  label: string;
  circular?: boolean;
  color: string;
}

const COLORS: Record<string, string> = {
  // Components
  'chicken-house': '#059669',
  'processing-plant': '#3B82F6',
  'anaerobic-digester': '#8B5CF6',
  'pyrolysis-unit': '#F59E0B',
  'farm': '#10B981',
  'land-applied': '#06B6D4',
  'landfill': '#991B1B',
  
  // Materials by type
  input: '#9CA3AF',
  intermediate: '#6B7280',
  output: '#10B981',
  energy: '#F59E0B',
  biochar: '#065F46',
  material: '#6B7280',
  manure: '#92400E',
  gas: '#8B5CF6',
  waste: '#DC2626',
};

function getColor(id: string, type?: string): string {
  if (id === 'biochar') return COLORS.biochar;
  if (COLORS[id]) return COLORS[id];
  if (type && COLORS[type]) return COLORS[type];
  return '#6B7280';
}

/**
 * Calculate flow width based on value and configuration
 */
function calculateFlowWidth(value: number, flowConfig: CircularSankeyConfig['flows']): number {
  const { minWidth, widthMultiplier, widthFormula } = flowConfig;
  
  let calculatedWidth: number;
  
  switch (widthFormula) {
    case 'linear':
      calculatedWidth = value * widthMultiplier / 10;
      break;
    case 'log':
      calculatedWidth = Math.log10(value + 1) * widthMultiplier * 5;
      break;
    case 'sqrt':
    default:
      calculatedWidth = Math.sqrt(value) * widthMultiplier;
      break;
  }
  
  return Math.max(minWidth, calculatedWidth);
}

/**
 * Position mapping based on hand-drawn diagram
 */
const POSITION_MAP: Record<string, { x: number; y: number; radius?: number }> = {
  // Main components in circular layout
  'chicken-house': { x: 0.15, y: 0.5 }, // Left
  'processing-plant': { x: 0.5, y: 0.15 }, // Top
  'anaerobic-digester': { x: 0.5, y: 0.5 }, // Center
  'pyrolysis-unit': { x: 0.85, y: 0.5 }, // Right
  'farm': { x: 0.3, y: 0.85 }, // Bottom left
  'land-applied': { x: 0.7, y: 0.85 }, // Bottom right
  'landfill': { x: 0.9, y: 0.5 }, // Right (for current system)

  // Input nodes (outer ring)
  'fresh-pine-shavings': { x: 0.05, y: 0.4, radius: 0.9 },
  'chicken-feed-input': { x: 0.05, y: 0.55, radius: 0.9 },
  'labor-chicken': { x: 0.05, y: 0.65, radius: 0.9 },
  'fossil-fuels': { x: 0.5, y: 0.05, radius: 0.9 },
  'electricity-input': { x: 0.6, y: 0.05, radius: 0.9 },
  'chemical-fertilizers': { x: 0.15, y: 0.9, radius: 0.9 },
  'diesel': { x: 0.25, y: 0.9, radius: 0.9 },
  'labor-farm': { x: 0.2, y: 0.95, radius: 0.9 },

  // Intermediate nodes (between components)
  'litter-char': { x: 0.25, y: 0.45 },
  'dead-chickens': { x: 0.25, y: 0.55 },
  'used-litter': { x: 0.4, y: 0.6 },
  'live-chickens': { x: 0.32, y: 0.25 },
  'offal-fog': { x: 0.5, y: 0.32 },
  'fog-waste': { x: 0.65, y: 0.25 },
  'digestate-liquids': { x: 0.6, y: 0.7 },
  'digestate-solids': { x: 0.65, y: 0.5 },
  'bio-methane': { x: 0.5, y: 0.25 },
  'syngas': { x: 0.9, y: 0.4 },

  // Output/circular nodes
  'biochar': { x: 0.85, y: 0.35 },
  'crops': { x: 0.35, y: 0.75 },
  'meat': { x: 0.65, y: 0.05 },

  // Waste nodes (current system)
  'ghg-emissions': { x: 0.7, y: 0.05 },
  'water-pollution': { x: 0.5, y: 0.95 },
  'fertilizer-losses': { x: 0.4, y: 0.95 },
};

interface CircularSankeyDiagramV2Props {
  className?: string;
  config?: CircularSankeyConfig;
  onConfigChange?: (config: CircularSankeyConfig) => void;
  editMode?: boolean;
  showGrid?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  systemView?: 'current' | 'proposed';
  onSystemViewChange?: (view: 'current' | 'proposed') => void;
  showTooltips?: boolean;
}

export function CircularSankeyDiagramV2({
  className = '',
  config = DEFAULT_CONFIG,
  onConfigChange,
  editMode = false,
  showGrid = false,
  snapToGrid = false,
  gridSize = 0.05,
  systemView: externalSystemView,
  onSystemViewChange,
  showTooltips = true
}: CircularSankeyDiagramV2Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: config.canvas.width,
    height: config.canvas.height
  });
  const particleAnimatorRef = useRef<FlowParticleAnimator | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [data, setData] = useState<CircularSankeyData | null>(null);
  const [internalSystemView, setInternalSystemView] = useState<'current' | 'proposed'>('proposed');
  const [isDragging, setIsDragging] = useState(false);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    node: CircularNode;
    incomingFlows: CircularLink[];
    outgoingFlows: CircularLink[];
  } | null>(null);
  
  // Use external system view if provided, otherwise use internal
  const systemView = externalSystemView !== undefined ? externalSystemView : internalSystemView;
  
  const handleSystemViewChange = (view: 'current' | 'proposed') => {
    if (onSystemViewChange) {
      onSystemViewChange(view);
    } else {
      setInternalSystemView(view);
    }
  };

  // Load data based on system view
  useEffect(() => {
    const dataFile = systemView === 'current'
      ? '/data/system/flows-circular-current.json'
      : '/data/system/flows-circular.json';
    
    fetch(dataFile)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to load circular Sankey data:', err));
  }, [systemView]);

  // Update dimensions when config changes
  useEffect(() => {
    setDimensions({
      width: config.canvas.width,
      height: config.canvas.height
    });
  }, [config.canvas.width, config.canvas.height]);

  // Handle responsive resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const maxWidth = Math.min(config.canvas.width, width);
        setDimensions({
          width: maxWidth,
          height: maxWidth * config.canvas.aspectRatio
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [config.canvas.aspectRatio, config.canvas.width]);

  // Process data into positioned nodes and links
  const processedData = useMemo(() => {
    if (!data) return null;

    const { width, height } = dimensions;
    const nodeMap = new Map<string, CircularNode>();

    // Create positioned nodes
    data.nodes.forEach(node => {
      const pos = config.nodes.positions[node.id] || { x: 0.5, y: 0.5 };
      nodeMap.set(node.id, {
        ...node,
        x: pos.x * width,
        y: pos.y * height,
        color: config.colors[node.id as keyof typeof config.colors] || getColor(node.id, node.type)
      });
    });

    // Create links
    const links: CircularLink[] = data.flows.map(flow => {
      const source = nodeMap.get(flow.source);
      const target = nodeMap.get(flow.target);
      if (!source || !target) {
        console.warn(`Missing node for flow: ${flow.source} -> ${flow.target}`);
        return null;
      }

      return {
        source,
        target,
        value: flow.value,
        type: flow.type,
        label: flow.label,
        circular: flow.circular,
        color: config.colors[flow.type as keyof typeof config.colors] || getColor(flow.type, flow.type)
      };
    }).filter(Boolean) as CircularLink[];

    return {
      nodes: Array.from(nodeMap.values()),
      links
    };
  }, [data, dimensions, config]);

  // Render the diagram
  useEffect(() => {
    if (!svgRef.current || !processedData) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create main group
    const g = svg
      .append('g')
      .attr('class', 'main-group');

    // Create defs for gradients
    const defs = svg.append('defs');

    // Draw grid if enabled
    if (showGrid) {
      const gridGroup = g.append('g').attr('class', 'grid');
      const gridPixels = gridSize * width;
      
      // Vertical lines
      for (let x = 0; x <= width; x += gridPixels) {
        gridGroup.append('line')
          .attr('x1', x)
          .attr('y1', 0)
          .attr('x2', x)
          .attr('y2', height)
          .attr('stroke', '#E5E7EB')
          .attr('stroke-width', x % (gridPixels * 2) === 0 ? 1 : 0.5)
          .attr('stroke-dasharray', x % (gridPixels * 2) === 0 ? 'none' : '2,2');
      }
      
      // Horizontal lines
      for (let y = 0; y <= height; y += gridPixels) {
        gridGroup.append('line')
          .attr('x1', 0)
          .attr('y1', y)
          .attr('x2', width)
          .attr('y2', y)
          .attr('stroke', '#E5E7EB')
          .attr('stroke-width', y % (gridPixels * 2) === 0 ? 1 : 0.5)
          .attr('stroke-dasharray', y % (gridPixels * 2) === 0 ? 'none' : '2,2');
      }
    }

    // Create link paths (render first so they're behind nodes)
    const linkGroup = g.append('g').attr('class', 'links');
    
    processedData.links.forEach((link, i) => {
      const pathGroup = linkGroup.append('g')
        .attr('class', `link link-${i}`);

      // Calculate path
      const path = link.circular 
        ? createCircularPath(link)
        : createDirectPath(link);

      // Draw path
      const strokeWidth = calculateFlowWidth(link.value, config.flows);
      pathGroup.append('path')
        .attr('d', path)
        .attr('class', 'link-path')
        .attr('stroke', link.color)
        .attr('stroke-width', strokeWidth)
        .attr('fill', 'none')
        .attr('opacity', config.flows.opacity)
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          if (showTooltips) {
            // For flow tooltips, show target node with this single incoming flow
            setTooltip({
              x: event.pageX,
              y: event.pageY,
              node: link.target,
              incomingFlows: [link],
              outgoingFlows: []
            });
          }
        })
        .on('mouseleave', () => {
          setTooltip(null);
        })
        .on('mousemove', (event) => {
          if (showTooltips && tooltip) {
            setTooltip({
              ...tooltip,
              x: event.pageX,
              y: event.pageY
            });
          }
        });

      // Add label
      if (link.label && config.labels.showLinkLabels) {
        const midpoint = getPathMidpoint(link);
        pathGroup.append('text')
          .attr('x', midpoint.x)
          .attr('y', midpoint.y)
          .attr('text-anchor', 'middle')
          .attr('dy', config.labels.linkOffset)
          .attr('class', 'link-label')
          .attr('font-size', `${config.labels.linkFontSize}px`)
          .attr('fill', '#374151')
          .text(link.label);
      }
    });

    // Create nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    
    // Define drag behavior if in edit mode
    const dragBehavior = editMode ? d3.drag<SVGGElement, CircularNode>()
      .on('start', function(event, d) {
        setIsDragging(true);
        d3.select(this).raise().style('cursor', 'grabbing');
        
        // Store starting position in the node data (using any to add temp properties)
        (d as any)._dragStartX = d.x;
        (d as any)._dragStartY = d.y;
      })
      .on('drag', function(event, d) {
        const dAny = d as any;
        
        // Calculate new position using delta from start
        let newX = (dAny._dragStartX || d.x) + event.dx;
        let newY = (dAny._dragStartY || d.y) + event.dy;
        
        // Snap to grid if enabled
        if (snapToGrid) {
          const gridPixels = gridSize * dimensions.width;
          newX = Math.round(newX / gridPixels) * gridPixels;
          newY = Math.round(newY / gridPixels) * gridPixels;
        }
        
        // Update the start position for next delta (AFTER snapping)
        dAny._dragStartX = newX;
        dAny._dragStartY = newY;
        
        // Update visual position
        d3.select(this).attr('transform', `translate(${newX},${newY})`);
        
        // Update node data
        d.x = newX;
        d.y = newY;
        
        // Update connected links dynamically
        processedData.links.forEach((link, i) => {
          if (link.source.id === d.id || link.target.id === d.id) {
            const path = link.circular
              ? createCircularPath(link)
              : createDirectPath(link);
            svg.select(`.link-${i} .link-path`).attr('d', path);
            
            // Update label position if it exists
            if (link.label && config.labels.showLinkLabels) {
              const midpoint = getPathMidpoint(link);
              svg.select(`.link-${i} text`)
                .attr('x', midpoint.x)
                .attr('y', midpoint.y);
            }
          }
        });
      })
      .on('end', function(event, d) {
        setIsDragging(false);
        d3.select(this).style('cursor', editMode ? 'grab' : 'pointer');
        
        // d already has the node data
        if (!d || !onConfigChange) return;
        
        const relativeX = d.x / dimensions.width;
        const relativeY = d.y / dimensions.height;
        
        // Update config with new position
        const newConfig = {
          ...config,
          nodes: {
            ...config.nodes,
            positions: {
              ...config.nodes.positions,
              [d.id]: {
                x: relativeX,
                y: relativeY,
                radius: config.nodes.positions[d.id]?.radius
              }
            }
          }
        };
        onConfigChange(newConfig);
      }) : null;
    
    processedData.nodes.forEach(node => {
      const nodeG = nodeGroup.append('g')
        .attr('class', `node node-${node.id}`)
        .attr('transform', `translate(${node.x},${node.y})`)
        .style('cursor', editMode ? 'grab' : 'pointer')
        .on('mouseenter', (event) => {
          setHoveredNode(node.id);
          if (showTooltips) {
            // Find incoming and outgoing flows
            const incoming = processedData.links.filter(link => link.target.id === node.id);
            const outgoing = processedData.links.filter(link => link.source.id === node.id);
            
            setTooltip({
              x: event.pageX,
              y: event.pageY,
              node: node,
              incomingFlows: incoming,
              outgoingFlows: outgoing
            });
          }
        })
        .on('mouseleave', () => {
          setHoveredNode(null);
          setTooltip(null);
        })
        .on('mousemove', (event) => {
          if (showTooltips && tooltip) {
            setTooltip({
              ...tooltip,
              x: event.pageX,
              y: event.pageY
            });
          }
        })
        .datum(node); // Bind node data to element
      
      // Apply drag behavior if in edit mode
      if (dragBehavior) {
        nodeG.call(dragBehavior as any);
      }

      // Node size based on type
      const isComponent = node.type === 'component';
      const size = isComponent ? config.nodes.sizes.componentSize : config.nodes.sizes.standardSize;
      
      // Get icon path from iconMapping
      const iconId = node.icon || node.id;
      const iconPath = getIconPath(iconId);

      if (iconPath && iconPath !== '/images/flow-icons/placeholder.svg') {
        // Display icon image without clipping - let the SVG's own circle frame it
        nodeG.append('image')
          .attr('xlink:href', iconPath)
          .attr('x', -size / 2)
          .attr('y', -size / 2)
          .attr('width', size)
          .attr('height', size)
          .style('filter', hoveredNode === node.id ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');
      } else {
        // Fallback to circle with color
        const radius = size / 2;
        nodeG.append('circle')
          .attr('r', radius)
          .attr('fill', node.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .style('filter', hoveredNode === node.id ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' : 'none');
      }

      // Add label below the node
      if (config.labels.showNodeLabels) {
        nodeG.append('text')
          .attr('dy', size / 2 + config.labels.nodeLabelOffset)
          .attr('text-anchor', 'middle')
          .attr('font-size', isComponent ? `${config.labels.componentFontSize}px` : `${config.labels.standardFontSize}px`)
          .attr('font-weight', isComponent ? 'bold' : 'normal')
          .attr('fill', '#1F2937')
          .style('text-shadow', '0 1px 2px rgba(255,255,255,0.8)')
          .text(node.name);
      }
    });

    // Initialize particle animator
    const particleAnimator = new FlowParticleAnimator(svgRef.current);
    
    // Collect path elements and prepare links for animator with icon paths
    const pathElementsMap = new Map<string, SVGPathElement>();
    const linksForAnimator = processedData.links.map((link, i) => {
      const pathElement = svg.select(`.link-${i} .link-path`).node() as SVGPathElement;
      if (pathElement) {
        pathElementsMap.set(`flow-${i}`, pathElement);
      }
      
      // Determine which material icon to use for this flow
      // Use the target node's icon as it represents the material being transferred
      let materialIconId = link.target.icon || link.target.id;
      
      // Special cases for specific flow types
      if (link.type === 'biochar') {
        materialIconId = 'biochar';
      } else if (link.type === 'energy' || link.type === 'gas') {
        // Use source for energy flows as they represent the energy type
        materialIconId = link.source.icon || link.source.id;
      } else if (link.type === 'material' || link.type === 'manure') {
        // For material flows, try to extract from the label or use target
        const label = link.label.toLowerCase();
        if (label.includes('litter') && label.includes('char')) {
          materialIconId = 'litter-char';
        } else if (label.includes('digestate') && label.includes('liquid')) {
          materialIconId = 'digestate-liquids';
        } else if (label.includes('digestate') && label.includes('solid')) {
          materialIconId = 'digestate-solids';
        } else if (label.includes('offal') || label.includes('fog')) {
          materialIconId = 'offal-fog';
        } else if (label.includes('dead chicken')) {
          materialIconId = 'dead-chickens';
        } else if (label.includes('live chicken')) {
          materialIconId = 'live-chickens';
        } else if (label.includes('meat')) {
          materialIconId = 'meat';
        } else if (label.includes('crop')) {
          materialIconId = 'crops';
        } else if (label.includes('pine')) {
          materialIconId = 'fresh-pine-shavings';
        } else if (label.includes('feed')) {
          materialIconId = 'chicken-feed';
        }
      }
      
      const iconPath = getIconPath(materialIconId);
      
      return {
        id: `flow-${i}`,
        source: link.source.id,
        target: link.target.id,
        value: link.value,
        color: link.color,
        type: link.type,
        iconPath: iconPath !== '/images/flow-icons/placeholder.svg' ? iconPath : undefined
      };
    });

    particleAnimator.initializeParticles(linksForAnimator, pathElementsMap);
    particleAnimatorRef.current = particleAnimator;

    return () => {
      particleAnimator.stop();
    };
  }, [processedData, dimensions, hoveredNode]);

  // Helper functions for path generation
  function createDirectPath(link: CircularLink): string {
    const dx = link.target.x - link.source.x;
    const dy = link.target.y - link.source.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    
    return `M ${link.source.x},${link.source.y} A ${dr},${dr} 0 0,1 ${link.target.x},${link.target.y}`;
  }

  function createCircularPath(link: CircularLink): string {
    // For circular flows, create a curved path that goes around
    const dx = link.target.x - link.source.x;
    const dy = link.target.y - link.source.y;
    const midX = (link.source.x + link.target.x) / 2;
    const midY = (link.source.y + link.target.y) / 2;
    
    // Create control point for nice curve
    const perpX = -dy * config.curves.circularCurvature;
    const perpY = dx * config.curves.circularCurvature;
    const cx = midX + perpX;
    const cy = midY + perpY;

    return `M ${link.source.x},${link.source.y} Q ${cx},${cy} ${link.target.x},${link.target.y}`;
  }

  function getPathMidpoint(link: CircularLink): { x: number; y: number } {
    return {
      x: (link.source.x + link.target.x) / 2,
      y: (link.source.y + link.target.y) / 2
    };
  }

  if (!data) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-gray-500">Loading circular flow diagram...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full ${className} relative`}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="rounded-lg"
        style={{ backgroundColor: config.canvas.backgroundColor }}
      />
      
      {/* Enhanced Tooltip */}
      {showTooltips && tooltip && (
        <EnhancedTooltip
          x={tooltip.x}
          y={tooltip.y}
          node={tooltip.node}
          incomingFlows={tooltip.incomingFlows}
          outgoingFlows={tooltip.outgoingFlows}
          systemView={systemView}
        />
      )}
    </div>
  );
}