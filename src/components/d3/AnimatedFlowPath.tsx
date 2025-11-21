'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface FlowPathProps {
  id: string;
  startX: string;
  startY: string;
  endX: string;
  endY: string;
  color?: string;
  particleColor?: string;
  particleCount?: number;
  duration?: number; // Duration in ms for particle to travel
  label?: string;
  strokeWidth?: number;
  dashArray?: string;
}

export function AnimatedFlowPath({
  id,
  startX,
  startY,
  endX,
  endY,
  color = '#374151',
  particleColor = '#3B82F6',
  particleCount = 3,
  duration = 3000,
  label,
  strokeWidth = 2,
  dashArray,
}: FlowPathProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!svgRef.current || !pathRef.current) return;

    const svg = d3.select(svgRef.current);

    // Get path element for calculations
    const pathNode = pathRef.current;
    const pathLength = pathNode.getTotalLength();

    // Create particles
    const particles = svg
      .selectAll(`.particle-${id}`)
      .data(d3.range(particleCount))
      .join('circle')
      .attr('class', `particle-${id}`)
      .attr('r', 4)
      .attr('fill', particleColor)
      .attr('opacity', 0.8)
      .style('filter', 'drop-shadow(0 0 3px rgba(0,0,0,0.3))');

    // Animate particles along path
    function animateParticles() {
      particles.each(function (d, i) {
        const particle = d3.select(this);
        const delay = (i * duration) / particleCount;

        particle
          .attr('opacity', 0)
          .transition()
          .delay(delay)
          .duration(200)
          .attr('opacity', 0.8)
          .transition()
          .duration(duration - 400)
          .ease(d3.easeLinear)
          .attrTween('transform', () => {
            return (t: number) => {
              const point = pathNode.getPointAtLength(t * pathLength);
              return `translate(${point.x}, ${point.y})`;
            };
          })
          .transition()
          .duration(200)
          .attr('opacity', 0)
          .on('end', function () {
            // Loop animation
            d3.select(this).call(() => animateParticles());
          });
      });
    }

    // Start animation
    animateParticles();

    // Cleanup
    return () => {
      particles.interrupt();
    };
  }, [id, particleCount, duration, particleColor]);

  // Convert percentage strings to pixel values for calculation
  // We'll use viewBox coordinates (0-100 for percentages)
  const startXNum = parseFloat(startX);
  const startYNum = parseFloat(startY);
  const endXNum = parseFloat(endX);
  const endYNum = parseFloat(endY);

  // Calculate control points for smooth curve
  const dx = endXNum - startXNum;
  const dy = endYNum - startYNum;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Control points for quadratic curve
  const controlX = startXNum + dx * 0.5;
  const controlY = startYNum + dy * 0.5 - dist * 0.1;

  const pathData = `M ${startXNum} ${startYNum} Q ${controlX} ${controlY} ${endXNum} ${endYNum}`;

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <marker
          id={`arrowhead-${id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>

      {/* Path with arrow */}
      <path
        ref={pathRef}
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        markerEnd={`url(#arrowhead-${id})`}
        style={{
          vectorEffect: 'non-scaling-stroke',
        }}
      />

      {/* Label */}
      {label && (
        <text
          x={(startXNum + endXNum) / 2}
          y={(startYNum + endYNum) / 2 - 2}
          textAnchor="middle"
          className="text-xs font-medium fill-gray-700 bg-white px-2 py-1"
          style={{ fontSize: '3px', vectorEffect: 'non-scaling-stroke' }}
        >
          {label}
        </text>
      )}
    </svg>
  );
}
