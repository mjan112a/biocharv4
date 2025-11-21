'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { calculateHybridLayout, HybridNode, HybridLink, optimizeLayout } from '@/lib/hybridSankeyLayout';
import { generateAllPaths, getPathStyle, PathResult, PathConfig } from '@/lib/hybridPathGenerator';
import { generateAllRibbons, getRibbonStyle, RibbonPathResult, RibbonConfig } from '@/lib/ribbonPathGenerator';
import { FlowParticleAnimator, ParticleAnimationConfig } from '@/lib/flowParticleAnimator';
import { getIconPath } from '@/lib/iconMapping';
import { EnhancedTooltip } from './EnhancedTooltip';

export type VisualizationMode = 'lines' | 'ribbons' | 'both';

interface HybridSankeyDiagramProps {
  systemView?: 'current' | 'proposed';
  showLabels?: boolean;
  showTooltips?: boolean;
  showAnimations?: boolean;
  enableDrag?: boolean;
  onNodePositionChange?: (nodeId: string, x: number, y: number) => void;
  onLayoutChange?: (nodes: HybridNode[]) => void;
  customPositions?: Map<string, {x: number, y: number}>;
  pathConfig?: PathConfig;
  ribbonConfig?: RibbonConfig;
  particleConfig?: ParticleAnimationConfig;
  visualizationMode?: VisualizationMode;
  selectedNode?: string | null;
}

export function HybridSankeyDiagram({
  systemView = 'proposed',
  showLabels = true,
  showTooltips = true,
  showAnimations = false,
  enableDrag = true,
  onNodePositionChange,
  onLayoutChange,
  customPositions,
  pathConfig,
  ribbonConfig,
  particleConfig,
  visualizationMode = 'lines',
  selectedNode: externalSelectedNode
}: HybridSankeyDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const particleAnimatorRef = useRef<FlowParticleAnimator | null>(null);
  const [data, setData] = useState<{ nodes: any[]; links?: any[]; flows?: any[] } | null>(null);
  const [layoutData, setLayoutData] = useState<{ nodes: HybridNode[]; links: HybridLink[] } | null>(null);
  const [paths, setPaths] = useState<Map<string, PathResult> | null>(null);
  const [ribbons, setRibbons] = useState<Map<string, RibbonPathResult> | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(externalSelectedNode || null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    node: any;
    incomingFlows: any[];
    outgoingFlows: any[];
  } | null>(null);

  // Load data
  useEffect(() => {
    const filename = systemView === 'proposed'
      ? 'flows-circular.json'
      : 'flows-circular-current.json';
    
    console.log('Loading hybrid data from:', `/data/system/${filename}`);
    
    fetch(`/data/system/${filename}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(loadedData => {
        console.log('Hybrid data loaded:', {
          hasNodes: !!loadedData?.nodes,
          nodeCount: loadedData?.nodes?.length,
          hasLinks: !!loadedData?.links,
          linkCount: loadedData?.links?.length
        });
        setData(loadedData);
      })
      .catch(err => {
        console.error('Error loading hybrid data:', err);
        setData(null);
      });
  }, [systemView]);

  // Calculate layout when data changes
  useEffect(() => {
    if (!data) {
      return; // Still loading
    }
    
    // Support both "links" and "flows" property names
    const links = data.links || data.flows;
    
    if (!data.nodes || !links) {
      console.warn('HybridSankeyDiagram: Invalid data structure', {
        hasData: !!data,
        hasNodes: !!data?.nodes,
        hasLinks: !!data?.links,
        hasFlows: !!data?.flows
      });
      return;
    }
    
    console.log('Calculating hybrid layout for', data.nodes.length, 'nodes and', links.length, 'links/flows');

    try {
      // Calculate hybrid layout
      const layout = calculateHybridLayout(data.nodes, links);
      
      // Check if layout is valid
      if (!layout.nodes || layout.nodes.length === 0) {
        console.warn('HybridSankeyDiagram: Layout calculation returned no nodes');
        return;
      }
      
      // Optimize node positions
      let optimizedNodes = optimizeLayout(layout.nodes, layout.links);
      
      // Apply custom positions if provided
      if (customPositions && customPositions.size > 0) {
        optimizedNodes = optimizedNodes.map(node => {
          const customPos = customPositions.get(node.id);
          if (customPos) {
            return { ...node, x: customPos.x, y: customPos.y };
          }
          return node;
        });
      }
      
      // Update link node references to use the updated nodes
      const updatedLinks = layout.links.map(link => ({
        ...link,
        source: optimizedNodes.find(n => n.id === link.source.id) || link.source,
        target: optimizedNodes.find(n => n.id === link.target.id) || link.target
      }));
      
      setLayoutData({
        nodes: optimizedNodes,
        links: updatedLinks
      });

      // Generate paths with custom config if provided, using UPDATED links
      const pathMap = pathConfig
        ? generateAllPaths(updatedLinks, pathConfig)
        : generateAllPaths(updatedLinks);
      setPaths(pathMap);
      
      // Generate ribbons if in ribbon or both mode, using UPDATED links
      if (visualizationMode === 'ribbons' || visualizationMode === 'both') {
        const ribbonMap = ribbonConfig
          ? generateAllRibbons(updatedLinks, ribbonConfig)
          : generateAllRibbons(updatedLinks);
        setRibbons(ribbonMap);
      }
      
      // Notify parent of layout change
      if (onLayoutChange) {
        onLayoutChange(optimizedNodes);
      }
    } catch (error) {
      console.error('Error calculating hybrid layout:', error);
    }
  }, [data, customPositions, visualizationMode, pathConfig, ribbonConfig, onLayoutChange]);

  // Sync external selectedNode with internal state
  useEffect(() => {
    if (externalSelectedNode !== undefined) {
      setSelectedNode(externalSelectedNode);
    }
  }, [externalSelectedNode]);

  // Regenerate paths when pathConfig changes (but not on initial mount)
  useEffect(() => {
    if (!layoutData || !pathConfig) return;
    
    // Only regenerate paths, don't recalculate layout
    try {
      const pathMap = generateAllPaths(layoutData.links, pathConfig);
      setPaths(pathMap);
    } catch (error) {
      console.error('Error regenerating paths:', error);
    }
  }, [pathConfig]);

  // Regenerate ribbons when ribbonConfig or visualizationMode changes
  useEffect(() => {
    if (!layoutData) return;
    
    if (visualizationMode === 'ribbons' || visualizationMode === 'both') {
      try {
        const ribbonMap = ribbonConfig
          ? generateAllRibbons(layoutData.links, ribbonConfig)
          : generateAllRibbons(layoutData.links);
        setRibbons(ribbonMap);
      } catch (error) {
        console.error('Error regenerating ribbons:', error);
      }
    } else {
      setRibbons(null);
    }
  }, [ribbonConfig, visualizationMode, layoutData]);

  // Render D3 visualization
  useEffect(() => {
    if (!svgRef.current || !layoutData) return;
    if (visualizationMode === 'lines' && !paths) return;
    if ((visualizationMode === 'ribbons' || visualizationMode === 'both') && !ribbons) return;
    
    // Don't re-render while dragging to prevent node disappearance
    if (draggingNode) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 1000;
    const height = 1100; // Increased to accommodate U-shaped circular flows

    // Create main group
    const g = svg.append('g');

    // Render ribbons if in ribbons or both mode
    if ((visualizationMode === 'ribbons' || visualizationMode === 'both') && ribbons) {
      const ribbonGroup = g.append('g').attr('class', 'ribbons');
      
      layoutData.links.forEach((link, index) => {
        const linkId = `${link.source.id}-${link.target.id}-${index}`;
        const ribbonResult = ribbons.get(linkId);
        
        if (!ribbonResult) return;

        const style = getRibbonStyle(link, ribbonResult.type);
        
        ribbonGroup.append('path')
          .attr('id', `ribbon-${linkId}`)
          .attr('d', ribbonResult.d)
          .attr('fill', link.color)
          .attr('fill-opacity', hoveredNode ?
            (hoveredNode === link.source.id || hoveredNode === link.target.id ? style.fillOpacity : 0.2)
            : style.fillOpacity
          )
          .attr('stroke', link.color)
          .attr('stroke-width', 1)
          .attr('stroke-opacity', style.opacity)
          .attr('stroke-dasharray', style.strokeDasharray || 'none')
          .attr('class', 'flow-ribbon')
          .style('transition', 'fill-opacity 0.3s ease, stroke-opacity 0.3s ease');

        // Add ribbon label if enabled
        if (showLabels && link.label) {
          ribbonGroup.append('text')
            .attr('x', ribbonResult.midpoint.x)
            .attr('y', ribbonResult.midpoint.y)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('font-weight', '600')
            .attr('fill', '#374151')
            .style('pointer-events', 'none')
            .text(link.label);
        }
      });
    }

    // Render paths (lines) if in lines or both mode
    if ((visualizationMode === 'lines' || visualizationMode === 'both') && paths) {
      const linkGroup = g.append('g').attr('class', 'links');
      
      layoutData.links.forEach((link, index) => {
        const linkId = `${link.source.id}-${link.target.id}-${index}`;
        const pathResult = paths.get(linkId);
        
        if (!pathResult) return;

        const style = getPathStyle(link, pathResult.type);
        
        linkGroup.append('path')
          .attr('id', `path-${linkId}`)
          .attr('d', pathResult.d)
          .attr('fill', 'none')
          .attr('stroke', link.color)
          .attr('stroke-width', pathResult.width)
          .attr('stroke-dasharray', style.strokeDasharray || 'none')
          .attr('opacity', hoveredNode ?
            (hoveredNode === link.source.id || hoveredNode === link.target.id ? style.opacity : 0.2)
            : style.opacity
          )
          .attr('class', 'flow-path')
          .style('transition', 'opacity 0.3s ease');

        // Add path label if enabled (only if not in both mode to avoid duplicates)
        if (showLabels && link.label && visualizationMode !== 'both') {
          linkGroup.append('text')
            .attr('x', pathResult.midpoint.x)
            .attr('y', pathResult.midpoint.y)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#374151')
            .text(link.label);
        }
      });
    }

    // Render nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    
    // Create drag behavior
    const drag = d3.drag<SVGGElement, HybridNode>()
      .on('start', function(event, d) {
        if (!enableDrag) return;
        setDraggingNode(d.id);
        setTooltip(null); // Hide tooltip during drag
        d3.select(this).raise(); // Bring to front
      })
      .on('drag', function(event, d) {
        if (!enableDrag) return;
        
        // Update node position (viewport is now 1100 height)
        const newX = Math.max(40, Math.min(960, event.x));
        const newY = Math.max(40, Math.min(1060, event.y));
        
        // Update visual position
        d3.select(this).attr('transform', `translate(${newX - d.width/2}, ${newY - d.height/2})`);
        
        // Update node data
        d.x = newX;
        d.y = newY;
        
        // Regenerate paths for this node's connections (if in lines or both mode)
        if (visualizationMode === 'lines' || visualizationMode === 'both') {
          const newPathMap = pathConfig
            ? generateAllPaths(layoutData.links, pathConfig)
            : generateAllPaths(layoutData.links);
          
          // Update all line paths
          svg.selectAll('g.links path').each(function(_, i) {
            const link = layoutData.links[i];
            if (!link) return;
            const linkId = `${link.source.id}-${link.target.id}-${i}`;
            const pathResult = newPathMap.get(linkId);
            if (pathResult) {
              d3.select(this).attr('d', pathResult.d);
            }
          });
        }
        
        // Regenerate ribbons for this node's connections (if in ribbons or both mode)
        if (visualizationMode === 'ribbons' || visualizationMode === 'both') {
          const newRibbonMap = ribbonConfig
            ? generateAllRibbons(layoutData.links, ribbonConfig)
            : generateAllRibbons(layoutData.links);
          
          // Update all ribbon paths
          svg.selectAll('g.ribbons path').each(function(_, i) {
            const link = layoutData.links[i];
            if (!link) return;
            const linkId = `${link.source.id}-${link.target.id}-${i}`;
            const ribbonResult = newRibbonMap.get(linkId);
            if (ribbonResult) {
              d3.select(this).attr('d', ribbonResult.d);
            }
          });
        }
      })
      .on('end', function(event, d) {
        if (!enableDrag) return;
        setDraggingNode(null);
        
        // Notify parent of position change
        if (onNodePositionChange) {
          onNodePositionChange(d.id, d.x, d.y);
        }
        
        // Update layout data state AND regenerate paths with the updated nodes
        setLayoutData(prev => {
          if (!prev) return null;
          
          // Create updated nodes array
          const updatedNodes = prev.nodes.map(n => n.id === d.id ? { ...n, x: d.x, y: d.y } : n);
          
          // Create updated links with new node references
          const updatedLinks = prev.links.map(link => ({
            ...link,
            source: updatedNodes.find(n => n.id === link.source.id) || link.source,
            target: updatedNodes.find(n => n.id === link.target.id) || link.target
          }));
          
          // Regenerate paths with updated data (if in lines or both mode)
          if (visualizationMode === 'lines' || visualizationMode === 'both') {
            const newPathMap = pathConfig
              ? generateAllPaths(updatedLinks, pathConfig)
              : generateAllPaths(updatedLinks);
            setPaths(newPathMap);
          }
          
          // Regenerate ribbons with updated data (if in ribbons or both mode)
          if (visualizationMode === 'ribbons' || visualizationMode === 'both') {
            const newRibbonMap = ribbonConfig
              ? generateAllRibbons(updatedLinks, ribbonConfig)
              : generateAllRibbons(updatedLinks);
            setRibbons(newRibbonMap);
          }
          
          return {
            nodes: updatedNodes,
            links: updatedLinks
          };
        });
      });
    
    layoutData.nodes.forEach(node => {
      const nodeG = nodeGroup.append('g')
        .attr('class', 'node')
        .attr('transform', `translate(${node.x - node.width/2}, ${node.y - node.height/2})`)
        .style('cursor', enableDrag ? 'move' : 'pointer')
        .datum(node);
      
      // Apply drag behavior
      if (enableDrag) {
        nodeG.call(drag as any);
      }

      // Node background rectangle - only for component nodes
      const isActive = hoveredNode === node.id || draggingNode === node.id || selectedNode === node.id;
      const isDragging = draggingNode === node.id;
      const isComponent = node.type === 'component';
      
      if (isComponent) {
        nodeG.append('rect')
          .attr('width', node.width)
          .attr('height', node.height)
          .attr('rx', 8)
          .attr('fill', isDragging ? '#F0FDF4' : 'white')
          .attr('stroke', isDragging ? '#10B981' : node.color)
          .attr('stroke-width', isActive ? 3 : 2)
          .style('filter', isActive ?
            'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' :
            'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
          .style('transition', isDragging ? 'none' : 'all 0.3s ease');
      }

      // Node icon
      const iconPath = getIconPath(node.icon || node.id);
      const iconSize = isComponent
        ? Math.min(node.width, node.height) * 0.6
        : Math.min(node.width, node.height) * 0.9; // Larger icon for non-component nodes
      
      nodeG.append('image')
        .attr('xlink:href', iconPath)
        .attr('x', (node.width - iconSize) / 2)
        .attr('y', (node.height - iconSize) / 2)
        .attr('width', iconSize)
        .attr('height', iconSize)
        .style('pointer-events', 'none')
        .style('filter', !isComponent && isActive ?
          'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none');

      // Node label if enabled
      if (showLabels) {
        nodeG.append('text')
          .attr('x', node.width / 2)
          .attr('y', node.height + 15)
          .attr('text-anchor', 'middle')
          .attr('font-size', isComponent ? '11px' : '10px')
          .attr('font-weight', isComponent ? '600' : '500')
          .attr('fill', '#1F2937')
          .text(node.name);
      }

      // Add hover interactions
      if (showTooltips) {
        nodeG.on('mouseenter', function(event) {
          setHoveredNode(node.id);
          
          const incoming = layoutData.links.filter(l => l.target.id === node.id);
          const outgoing = layoutData.links.filter(l => l.source.id === node.id);
          
          setTooltip({
            x: event.pageX,
            y: event.pageY,
            node: {
              id: node.id,
              name: node.name,
              type: node.type,
              icon: node.icon,
              color: node.color
            },
            incomingFlows: incoming.map(l => ({
              source: { id: l.source.id, name: l.source.name },
              target: { id: l.target.id, name: l.target.name },
              value: l.value,
              type: l.type,
              label: l.label,
              color: l.color
            })),
            outgoingFlows: outgoing.map(l => ({
              source: { id: l.source.id, name: l.source.name },
              target: { id: l.target.id, name: l.target.name },
              value: l.value,
              type: l.type,
              label: l.label,
              color: l.color
            }))
          });
        })
        .on('mousemove', function(event) {
          if (tooltip) {
            setTooltip(prev => prev ? { ...prev, x: event.pageX, y: event.pageY } : null);
          }
        })
        .on('mouseleave', function() {
          setHoveredNode(null);
          setTooltip(null);
        });
      }
    });

  }, [layoutData, paths, ribbons, hoveredNode, draggingNode, selectedNode, showLabels, showTooltips, enableDrag, onNodePositionChange, visualizationMode]);

  // Initialize particle animations
  useEffect(() => {
    if (!svgRef.current || !layoutData || !showAnimations) return;
    
    // Cleanup previous animator
    if (particleAnimatorRef.current) {
      particleAnimatorRef.current.destroy();
      particleAnimatorRef.current = null;
    }

    // Only create animator if we're in lines or both mode
    if (visualizationMode === 'ribbons') return;

    try {
      // Create animator with config
      const animator = new FlowParticleAnimator(svgRef.current, particleConfig);
      particleAnimatorRef.current = animator;

      // Get path elements
      const pathElements = new Map<string, SVGPathElement>();
      layoutData.links.forEach((link, index) => {
        const linkId = `${link.source.id}-${link.target.id}-${index}`;
        const pathElement = svgRef.current?.querySelector(`#path-${linkId}`) as SVGPathElement;
        if (pathElement) {
          pathElements.set(linkId, pathElement);
        }
      });

      // Prepare links for particle initialization
      const particleLinks = layoutData.links.map((link, index) => ({
        id: `${link.source.id}-${link.target.id}-${index}`,
        source: link.source.id,
        target: link.target.id,
        value: link.value,
        color: link.color,
        type: link.type || 'material'
      }));

      // Initialize particles
      animator.initializeParticles(particleLinks, pathElements);

      // Handle pause on hover if enabled
      if (particleConfig?.pauseOnHover) {
        const svg = d3.select(svgRef.current);
        svg.on('mouseenter', () => animator.pause());
        svg.on('mouseleave', () => animator.resume());
      }
    } catch (error) {
      console.error('Error initializing particle animator:', error);
    }

    // Cleanup on unmount
    return () => {
      if (particleAnimatorRef.current) {
        particleAnimatorRef.current.destroy();
        particleAnimatorRef.current = null;
      }
    };
  }, [layoutData, showAnimations, particleConfig, visualizationMode]);

  return (
    <div className="relative w-full">
      {!layoutData || (visualizationMode === 'lines' && !paths) || ((visualizationMode === 'ribbons' || visualizationMode === 'both') && !ribbons) ? (
        <div className="flex items-center justify-center h-[1100px] bg-gray-50 rounded-lg shadow-inner">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading diagram...</p>
          </div>
        </div>
      ) : (
        <>
          <svg
            ref={svgRef}
            width="100%"
            height="1100"
            viewBox="0 0 1000 1100"
            className="bg-gray-50 rounded-lg shadow-inner"
          >
          </svg>

          {/* Tooltip */}
          {tooltip && showTooltips && (
            <EnhancedTooltip
              x={tooltip.x}
              y={tooltip.y}
              node={tooltip.node}
              incomingFlows={tooltip.incomingFlows}
              outgoingFlows={tooltip.outgoingFlows}
              systemView={systemView}
            />
          )}
        </>
      )}
    </div>
  );
}