'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Image from 'next/image';

interface AnimatedTruckProps {
  id: string;
  startX: string;
  startY: string;
  endX: string;
  endY: string;
  duration?: number;
  imagePath?: string;
}

export function AnimatedTruck({
  id,
  startX,
  startY,
  endX,
  endY,
  duration = 4000,
  imagePath = '/images/chicken-truck.svg',
}: AnimatedTruckProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const truckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !truckRef.current) return;

    const startXNum = parseFloat(startX);
    const startYNum = parseFloat(startY);
    const endXNum = parseFloat(endX);
    const endYNum = parseFloat(endY);

    const truck = d3.select(truckRef.current);

    function animateTruck() {
      truck
        .style('opacity', '0')
        .style('left', `${startXNum}%`)
        .style('top', `${startYNum}%`)
        .transition()
        .duration(300)
        .style('opacity', '1')
        .transition()
        .duration(duration - 600)
        .ease(d3.easeLinear)
        .style('left', `${endXNum}%`)
        .style('top', `${endYNum}%`)
        .transition()
        .duration(300)
        .style('opacity', '0')
        .on('end', () => animateTruck());
    }

    animateTruck();

    return () => {
      truck.interrupt();
    };
  }, [startX, startY, endX, endY, duration]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
      <div
        ref={truckRef}
        className="absolute"
        style={{
          width: '60px',
          height: '40px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Image
          src={imagePath}
          alt="Chicken truck"
          width={60}
          height={40}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
        />
      </div>
    </div>
  );
}
