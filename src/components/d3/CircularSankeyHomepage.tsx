'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import IconTooltip from '@/components/ui/IconTooltip';

interface DiagramNode {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  icon: string;
  iconOnly?: boolean;
  showLabel?: boolean;
  fontSize?: number;
}

interface DiagramLink {
  id: string;
  source: string;
  target: string;
  value: number;
  color: string;
  label?: string;
  animationFrequency?: number;
  animationRate?: number;
  animationSize?: number;
  particleIconSource?: string;
  particleIcon?: string;
  particleType?: string;
}

interface DiagramData {
  metadata?: {
    title: string;
    description: string;
    type: string;
    system: string;
  };
  nodes: DiagramNode[];
  links: DiagramLink[];
  config: {
    width: number;
    height: number;
    nodePadding?: number;
    nodeWidth?: number;
    circularLinkGap?: number;
  };
}

interface CircularSankeyHomepageProps {
  diagramData: DiagramData;
  width?: number;
  height?: number;
  enableNavigation?: boolean; // New prop to enable/disable click navigation
}

// Mapping of node IDs to component detail page slugs
const NODE_TO_COMPONENT_MAP: Record<string, string> = {
  'farm': 'farm',
  'farms': 'farm',
  'chicken-house': 'chicken-house',
  'chicken-houses': 'chicken-house',
  'processing-plant': 'processing-plant',
  'waterways': 'waterways',
  'farm-waterways': 'waterways',
  'anaerobic-digester': 'anaerobic-digester',
  'pyrolysis-unit': 'pyrolysis-unit',
  'pyrolysis': 'pyrolysis-unit'
};

export function CircularSankeyHomepage({
  diagramData,
  width: initialWidth = 850,
  height = 700,
  enableNavigation = true
}: CircularSankeyHomepageProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initialWidth);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setWidth(entry.contentRect.width);
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  
  // Tooltip state
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipIconPath, setTooltipIconPath] = useState<string | undefined>();
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipContext, setTooltipContext] = useState<'current' | 'proposed'>('current');
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !diagramData) return;

    // Determine context from metadata
    const context = diagramData.metadata?.system === 'proposed' ? 'proposed' : 'current';
    setTooltipContext(context);

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    
    // Create main group (centering will be applied after rendering)
    const g = svg.append('g')
      .attr('class', 'diagram-group');

    // Create node map for quick lookup
    const nodeMap = new Map(diagramData.nodes.map(node => [node.id, node]));

    // Generate link path (matching BuilderCanvas logic with circular support)
    const generateLinkPath = (link: DiagramLink, linkIndex: number): string => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);
      
      if (!sourceNode || !targetNode) return '';

      const sx = sourceNode.x + sourceNode.width;
      const sy = sourceNode.y + sourceNode.height / 2;
      const tx = targetNode.x;
      const ty = targetNode.y + targetNode.height / 2;

      // Check if this is a reverse connection (target is left of source)
      if (tx < sx) {
        // Calculate stagger to prevent overlaps - each link gets its own offset
        const stagger = linkIndex * 60; // Offset by 60px for each link
        const gap = 30; // Gap from nodes
        // Use custom returnY if provided, otherwise calculate staggered position
        const returnY = (link as any).returnY;
        const bottomY = returnY !== undefined
          ? returnY
          : Math.max(sy, ty) + 100 + stagger;
        
        return `
          M ${sx} ${sy}
          L ${sx + gap} ${sy}
          Q ${sx + gap + 20} ${sy} ${sx + gap + 20} ${sy + 20}
          L ${sx + gap + 20} ${bottomY - 20}
          Q ${sx + gap + 20} ${bottomY} ${sx + gap} ${bottomY}
          L ${tx - gap} ${bottomY}
          Q ${tx - gap - 20} ${bottomY} ${tx - gap - 20} ${bottomY - 20}
          L ${tx - gap - 20} ${ty + 20}
          Q ${tx - gap - 20} ${ty} ${tx - gap} ${ty}
          L ${tx} ${ty}
        `;
      }

      // Forward connection: use cubic Bezier curve for natural S-curves
      const midX = (sx + tx) / 2;
      return `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
    };

    // Create defs for path references (for textPath)
    const defs = g.append('defs');
    diagramData.links.forEach((link, index) => {
      defs.append('path')
        .attr('id', `link-path-${link.id}`)
        .attr('d', generateLinkPath(link, index))
        .attr('fill', 'none');
    });

    // Draw links
    const linksGroup = g.append('g').attr('class', 'links');
    
    diagramData.links.forEach((link, linkIndex) => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);
      
      if (!sourceNode || !targetNode) return;

      const linkGroup = linksGroup.append('g');
      const path = generateLinkPath(link, linkIndex);

      // Draw link path with proper width based on value
      linkGroup.append('path')
        .attr('d', path)
        .attr('stroke', link.color)
        .attr('stroke-width', link.value || 4) // Use link.value for width
        .attr('fill', 'none')
        .attr('opacity', highlightedNode
          ? (highlightedNode === link.source || highlightedNode === link.target ? 0.8 : 0.1)
          : 0.6)
        .attr('stroke-linecap', 'round')
        .attr('class', 'link-path') // Add class for selection
        .style('transition', 'opacity 0.3s ease');

      // Add link label following the path
      if (link.label) {
        linkGroup.append('text')
          .attr('font-size', '12')
          .attr('fill', '#374151')
          .attr('font-weight', '600')
          .attr('class', 'pointer-events-none select-none')
          .append('textPath')
          .attr('href', `#link-path-${link.id}`)
          .attr('startOffset', '50%')
          .attr('text-anchor', 'middle')
          .style('paint-order', 'stroke')
          .style('stroke', 'white')
          .style('stroke-width', '3')
          .style('stroke-linejoin', 'round')
          .text(link.label);
      }

      // Add animated particles (default if no animationFrequency is 3 particles)
      const particleCount = link.animationFrequency !== undefined ? link.animationFrequency : 3;
      const particleSize = link.animationSize || 4;
      const animationRate = link.animationRate || 3;
      const duration = (11 - animationRate) * 2; // Convert rate to duration

      if (particleCount > 0) {
        // Determine if we should use an icon
        const useIcon = link.particleIcon || (link.particleIconSource && link.particleIconSource !== 'dot');
        const iconPath = link.particleIcon || (useIcon ? link.particleIconSource : undefined);

        // Get the path element to calculate length for animation
        const pathElement = document.getElementById(`link-path-${link.id}`) as unknown as SVGPathElement;
        const pathLength = pathElement?.getTotalLength() || 0;
        
        // Get start point for initialization to prevent jump from 0,0
        const startPoint = pathElement?.getPointAtLength(0) || { x: 0, y: 0 };

        for (let i = 0; i < particleCount; i++) {
          const delay = (i / particleCount) * duration;
          
          if (useIcon && iconPath) {
            // Create icon particle using path-following animation
            const icon = linkGroup.append('image')
              .attr('href', iconPath)
              .attr('xlink:href', iconPath) // Support xlink:href for compatibility
              .attr('width', particleSize * 4)
              .attr('height', particleSize * 4)
              .attr('x', -particleSize * 2)
              .attr('y', -particleSize * 2)
              .attr('transform', `translate(${startPoint.x}, ${startPoint.y})`) // Initialize at start
              .attr('opacity', highlightedNode
                ? (highlightedNode === link.source || highlightedNode === link.target ? 1 : 0.1)
                : 0.8)
              .attr('class', 'link-particle') // Add class for selection
              .style('transition', 'opacity 0.3s ease');

            // Animate along the path using D3 transition with path length
            function animateIcon() {
              icon.transition()
                .duration(duration * 1000)
                .ease(d3.easeLinear)
                .delay(delay * 1000)
                .attrTween('transform', function() {
                  return function(t) {
                    if (!pathElement) return `translate(0,0)`;
                    const point = pathElement.getPointAtLength(t * pathLength);
                    return `translate(${point.x},${point.y})`;
                  };
                })
                .on('end', animateIcon);
            }

            animateIcon();
          } else {
            // Create circle particle using path-following animation
            const circle = linkGroup.append('circle')
              .attr('r', particleSize)
              .attr('fill', link.color)
              .attr('transform', `translate(${startPoint.x}, ${startPoint.y})`) // Initialize at start
              .attr('opacity', highlightedNode
                ? (highlightedNode === link.source || highlightedNode === link.target ? 1 : 0.1)
                : 0.8)
              .attr('class', 'link-particle') // Add class for selection
              .style('transition', 'opacity 0.3s ease');

            // Animate along the path using D3 transition with path length
            function animate() {
              circle.transition()
                .duration(duration * 1000)
                .ease(d3.easeLinear)
                .delay(delay * 1000)
                .attrTween('transform', function() {
                  return function(t) {
                    if (!pathElement) return `translate(0,0)`;
                    const point = pathElement.getPointAtLength(t * pathLength);
                    return `translate(${point.x},${point.y})`;
                  };
                })
                .on('end', animate);
            }

            animate();
          }
        }
      }
    });

    // Draw nodes
    const nodesGroup = g.append('g').attr('class', 'nodes');
    
    diagramData.nodes.forEach(node => {
      // Check if node is connected to highlighted node
      const isConnected = highlightedNode
        ? node.id === highlightedNode ||
          diagramData.links.some(l => (l.source === highlightedNode && l.target === node.id) || (l.target === highlightedNode && l.source === node.id))
        : true;

      const nodeGroup = nodesGroup.append('g')
        .attr('class', 'node')
        .attr('transform', `translate(${node.x},${node.y})`)
        .attr('opacity', isConnected ? 1 : 0.2)
        .style('transition', 'opacity 0.3s ease');

      // Add icon
      nodeGroup.append('image')
        .attr('href', node.icon)
        .attr('xlink:href', node.icon) // Support xlink:href for compatibility
        .attr('width', node.width)
        .attr('height', node.height)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      // Add label if showLabel is true (matching BuilderCanvas logic)
      if (node.showLabel !== false) {
        // Split name by <br/> or <br> for multi-line support
        const lines = node.name.split(/<br\s*\/?>/i);
        const fontSize = node.fontSize || 12;
        const lineHeight = fontSize * 1.2;
        const yBase = node.iconOnly ? node.height + 15 : node.height - 10;
        const yOffset = lines.length > 1 ? -((lines.length - 1) * lineHeight) / 2 : 0;
        
        const textGroup = nodeGroup.append('text')
          .attr('x', node.width / 2)
          .attr('y', yBase + yOffset)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#1f2937')
          .attr('font-size', fontSize)
          .attr('font-weight', '600')
          .attr('class', 'pointer-events-none select-none');

        lines.forEach((line, i) => {
          textGroup.append('tspan')
            .attr('x', node.width / 2)
            .attr('dy', i === 0 ? 0 : lineHeight)
            .text(line);
        });
      }

      // Add hover effects, tooltip, and click navigation
      nodeGroup
        .style('cursor', 'pointer')
        .on('mouseenter', function(event) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', `translate(${node.x},${node.y}) scale(1.05)`);
          
          setHighlightedNode(node.id);

          // Show tooltip
          if (node.icon) {
            setTooltipIconPath(node.icon);
            setTooltipPos({ x: event.clientX, y: event.clientY });
            setTooltipVisible(true);
          }
        })
        .on('mousemove', function(event) {
          if (tooltipVisible) {
            setTooltipPos({ x: event.clientX, y: event.clientY });
          }
        })
        .on('mouseleave', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', `translate(${node.x},${node.y}) scale(1)`);
          
          setHighlightedNode(null);

          // Hide tooltip
          setTooltipVisible(false);
        })
        .on('click', function(event) {
          event.stopPropagation();
          
          // Only navigate if enableNavigation is true
          if (!enableNavigation) return;
          
          // Try to find a matching component slug from the node ID
          const nodeId = node.id.toLowerCase();
          const componentSlug = NODE_TO_COMPONENT_MAP[nodeId];
          
          if (componentSlug) {
            router.push(`/details/${componentSlug}`);
          } else {
            // Try partial matching for node IDs that contain component names
            for (const [key, slug] of Object.entries(NODE_TO_COMPONENT_MAP)) {
              if (nodeId.includes(key) || key.includes(nodeId)) {
                router.push(`/details/${slug}`);
                return;
              }
            }
            console.log(`No detail page found for node: ${node.id}`);
          }
        });
    });

    // Center and scale the diagram to fill available space
    // Force a re-calculation after a small delay to ensure particles don't mess up bbox initially
    // Actually, better to filter what we consider for bbox, but d3 getBBox is simple.
    // With particles initialized at startPoint (which is on the path), bbox should be correct.
    
    const bbox = g.node()?.getBBox();
    if (bbox) {
      // Calculate scale to fit within bounds with minimal padding
      const padding = 20; // Reduced padding for better fill
      const scaleX = (width - padding) / bbox.width;
      const scaleY = (height - padding) / bbox.height;
      const scale = Math.min(scaleX, scaleY) * 0.95; // Slight safety margin
      
      // Debug logging
      console.log('CircularSankeyHomepage scaling:', {
        width,
        height,
        bboxWidth: bbox.width,
        bboxHeight: bbox.height,
        scaleX,
        scaleY,
        finalScale: scale
      });
      
      // Calculate center position accounting for bbox offset
      const scaledWidth = bbox.width * scale;
      const scaledHeight = bbox.height * scale;
      const translateX = (width - scaledWidth) / 2 - bbox.x * scale;
      const translateY = (height - scaledHeight) / 2 - bbox.y * scale;
      
      g.attr('transform', `translate(${translateX},${translateY}) scale(${scale})`);
    }

  }, [diagramData, width, height, highlightedNode]);

  return (
    <div ref={containerRef} className="w-full relative" style={{ height: `${height}px` }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full"
        style={{ background: 'transparent' }}
      />
      
      {/* Tooltip */}
      <IconTooltip
        iconPath={tooltipIconPath}
        context={tooltipContext}
        x={tooltipPos.x}
        y={tooltipPos.y}
        visible={tooltipVisible}
      />
    </div>
  );
}
