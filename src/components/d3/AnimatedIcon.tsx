'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Image from 'next/image';

interface TooltipData {
  title: string;
  metrics: Array<{ label: string; value: string; icon?: string }>;
  highlights?: string[];
}

interface AnimatedIconProps {
  id: string;
  startX: string;
  startY: string;
  endX: string;
  endY: string;
  duration?: number;
  iconPath: string;
  iconSize?: number;
  label?: string;
  labelColor?: string;
  tooltipData?: TooltipData;
}

export function AnimatedIcon({
  id,
  startX,
  startY,
  endX,
  endY,
  duration = 4000,
  iconPath,
  iconSize = 40,
  label,
  labelColor = 'gray',
  tooltipData,
}: AnimatedIconProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);

  useEffect(() => {
    if (!containerRef.current || !iconRef.current) return;

    const startXNum = parseFloat(startX);
    const startYNum = parseFloat(startY);
    const endXNum = parseFloat(endX);
    const endYNum = parseFloat(endY);

    const icon = d3.select(iconRef.current);
    const labelElement = labelRef.current ? d3.select(labelRef.current) : null;

    function animateIcon() {
      // Animate icon
      icon
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
        .on('end', () => {
          if (!isPaused) {
            animateIcon();
          }
        });

      // Animate label if present
      if (labelElement) {
        labelElement
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
          .style('opacity', '0');
      }
    }

    if (!isPaused) {
      animateIcon();
    }

    return () => {
      icon.interrupt();
      if (labelElement) {
        labelElement.interrupt();
      }
    };
  }, [startX, startY, endX, endY, duration, label, isPaused]);

  // Handle hover pause/resume
  const handleMouseEnter = () => {
    if (tooltipData) {
      setIsHovered(true);
      setIsPaused(true);
      // Interrupt current animation
      if (iconRef.current) {
        d3.select(iconRef.current).interrupt();
      }
      if (labelRef.current) {
        d3.select(labelRef.current).interrupt();
      }
    }
  };

  const handleMouseLeave = () => {
    if (tooltipData) {
      setIsHovered(false);
      setIsPaused(false);
      // Animation will restart via useEffect dependency
    }
  };

  const labelColorClass = {
    gray: 'text-gray-600 bg-white/70',
    green: 'text-green-700 bg-green-50/80 border-green-200',
    blue: 'text-blue-700 bg-blue-50/80 border-blue-200',
    purple: 'text-purple-700 bg-purple-50/80 border-purple-200',
    red: 'text-red-700 bg-red-50/70',
    amber: 'text-amber-700 bg-amber-50/70',
  }[labelColor] || 'text-gray-600 bg-white/70';

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
      {/* Icon with integrated hover area */}
      <div
        ref={iconRef}
        className={`absolute transition-transform duration-200 ${isHovered ? 'scale-125' : 'scale-100'}`}
        onMouseEnter={tooltipData ? handleMouseEnter : undefined}
        onMouseLeave={tooltipData ? handleMouseLeave : undefined}
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: tooltipData ? 'auto' : 'none',
          cursor: tooltipData ? 'pointer' : 'default',
        }}
      >
        <Image
          src={iconPath}
          alt={`Flow icon ${id}`}
          width={iconSize}
          height={iconSize}
          style={{ 
            filter: isHovered ? 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.6))' : 'none',
            pointerEvents: 'none',
          }}
        />

        {/* Tooltip (appears on hover) - attached to icon */}
        {isHovered && tooltipData && (
          <div
            className="absolute z-50 animate-fade-in pointer-events-none"
            style={{
              left: '50%',
              bottom: '100%',
              transform: 'translate(-50%, -10px)',
              minWidth: '200px',
            }}
          >
            <div className="bg-white border-2 border-blue-400 rounded-lg shadow-2xl p-3">
              {/* Title with Icon */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 flex-shrink-0">
                  <Image
                    src={iconPath}
                    alt="Icon"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <h4 className="font-bold text-sm text-gray-900">{tooltipData.title}</h4>
              </div>

              {/* Metrics */}
              <div className="space-y-1.5">
                {tooltipData.metrics.map((metric, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {metric.icon && <span className="text-sm">{metric.icon}</span>}
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-600">{metric.label}</p>
                      <p className="text-xs font-semibold text-gray-900">{metric.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              {tooltipData.highlights && tooltipData.highlights.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                  {tooltipData.highlights.map((highlight, idx) => (
                    <p key={idx} className="text-[10px] text-blue-700 font-medium">
                      {highlight}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Label (if provided) - positioned above icon */}
      {label && (
        <div
          ref={labelRef}
          className={`absolute text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${labelColorClass}`}
          style={{
            transform: 'translate(-50%, -150%)',
            pointerEvents: 'none',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
