'use client';

import { useState, useEffect } from 'react';
import { getTooltipForIcon, getTooltipContext, TooltipData, TooltipContext } from '@/lib/tooltipLoader';

interface IconTooltipProps {
  iconPath?: string;
  context?: 'current' | 'proposed' | 'both';
  x: number;
  y: number;
  visible: boolean;
}

/**
 * IconTooltip Component
 * 
 * Displays rich tooltip content for icons based on loaded tooltip data.
 * Automatically positions itself relative to cursor.
 */
export default function IconTooltip({
  iconPath,
  context = 'proposed',
  x,
  y,
  visible,
}: IconTooltipProps) {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipContext, setTooltipContext] = useState<TooltipContext | null>(null);
  const [loading, setLoading] = useState(false);

  // Load tooltip data when icon changes
  useEffect(() => {
    if (!iconPath || !visible) {
      setTooltipData(null);
      setTooltipContext(null);
      return;
    }

    setLoading(true);
    getTooltipForIcon(iconPath).then(data => {
      setTooltipData(data);
      if (data) {
        setTooltipContext(getTooltipContext(data, context));
      }
      setLoading(false);
    });
  }, [iconPath, context, visible]);

  if (!visible || !tooltipData || !tooltipContext) {
    return null;
  }

  // Position tooltip - offset from cursor to avoid blocking
  const tooltipStyle = {
    left: `${x + 15}px`,
    top: `${y + 15}px`,
  };

  return (
    <div
      className="fixed z-[9999] max-w-md pointer-events-none"
      style={tooltipStyle}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-h-[80vh] overflow-y-auto">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {tooltipContext.title}
        </h3>

        {/* Description */}
        {tooltipContext.description && (
          <p className="text-sm text-gray-700 mb-3">
            {tooltipContext.description}
          </p>
        )}

        {/* Performance Data */}
        {tooltipContext.performance && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-gray-600 uppercase mb-1">
              Performance
            </h4>
            <div className="bg-blue-50 rounded p-2 space-y-1">
              {Object.entries(tooltipContext.performance).map(([key, value]) => (
                <div key={key} className="text-xs flex justify-between">
                  <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-gray-900 font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problems */}
        {tooltipContext.problems && tooltipContext.problems.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-red-600 uppercase mb-1">
              Problems
            </h4>
            <ul className="space-y-1">
              {tooltipContext.problems.map((problem, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start">
                  <span className="text-red-500 mr-1">⚠️</span>
                  <span>{problem}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {tooltipContext.improvements && tooltipContext.improvements.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-green-600 uppercase mb-1">
              Improvements
            </h4>
            <ul className="space-y-1">
              {tooltipContext.improvements.map((improvement, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start">
                  <span className="text-green-500 mr-1">✓</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {tooltipContext.benefits && tooltipContext.benefits.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-blue-600 uppercase mb-1">
              Benefits
            </h4>
            <ul className="space-y-1">
              {tooltipContext.benefits.map((benefit, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start">
                  <span className="text-blue-500 mr-1">→</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Value/Economic */}
        {tooltipContext.value && (
          <div className="bg-green-50 rounded p-2 border-l-4 border-green-500">
            <p className="text-xs font-semibold text-green-800">
              💰 {tooltipContext.value}
            </p>
          </div>
        )}

        {/* Context indicator */}
        <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
          <span>Context: {context}</span>
          <span className="text-gray-400">ℹ️</span>
        </div>
      </div>
    </div>
  );
}