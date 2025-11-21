'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface AnimatedCounterProps {
  value: string;
  duration?: number;
}

export function AnimatedCounter({ value, duration = 1500 }: AnimatedCounterProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!spanRef.current) return;

    // Extract numeric part from string (e.g., "90%" -> 90, "$250-500" -> 250)
    const numMatch = value.match(/\d+/);
    if (!numMatch) {
      // No number found, just display as-is
      spanRef.current.textContent = value;
      return;
    }

    const targetNumber = parseInt(numMatch[0], 10);
    const prefix = value.substring(0, numMatch.index);
    const suffix = value.substring((numMatch.index || 0) + numMatch[0].length);

    // Store ref in variable for cleanup
    const span = spanRef.current;

    // Animate the number
    d3.select(span)
      .transition()
      .duration(duration)
      .ease(d3.easeQuadOut)
      .tween('text', function() {
        const interpolator = d3.interpolateNumber(0, targetNumber);
        return function(t) {
          const currentValue = Math.round(interpolator(t));
          this.textContent = `${prefix}${currentValue}${suffix}`;
        };
      });

    return () => {
      d3.select(span).interrupt();
    };
  }, [value, duration]);

  return <span ref={spanRef}>{value}</span>;
}
