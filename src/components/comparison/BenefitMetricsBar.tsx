'use client';

import React from 'react';

export interface BenefitMetric {
  category: 'environmental' | 'economic' | 'operational' | 'overall';
  label: string;
  value: string; // e.g., "-90%", "+$50k/yr", "High"
  description: string;
  icon: string;
}

interface BenefitMetricsBarProps {
  metrics: BenefitMetric[];
  className?: string;
}

/**
 * BenefitMetricsBar - Displays key improvement metrics in a visual horizontal bar
 * 
 * Shows 3-4 key metrics highlighting the benefits of the proposed system
 * with color-coded categories and large, easy-to-read numbers
 */
export function BenefitMetricsBar({ metrics, className = '' }: BenefitMetricsBarProps) {
  // Category styling
  const getCategoryStyle = (category: BenefitMetric['category']) => {
    switch (category) {
      case 'environmental':
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          text: 'text-green-900',
          valueText: 'text-green-600',
          icon: '🌍'
        };
      case 'economic':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-900',
          valueText: 'text-amber-600',
          icon: '💰'
        };
      case 'operational':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-900',
          valueText: 'text-blue-600',
          icon: '⚙️'
        };
      case 'overall':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-300',
          text: 'text-purple-900',
          valueText: 'text-purple-600',
          icon: '📊'
        };
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>🎯</span>
          Key Improvements at a Glance
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Measurable benefits of the proposed biochar system transformation
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const style = getCategoryStyle(metric.category);
          
          return (
            <div
              key={idx}
              className={`${style.bg} ${style.border} border-2 rounded-lg p-4 hover:shadow-md transition-all duration-200`}
            >
              {/* Icon and Category */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{metric.icon || style.icon}</span>
                <span className={`text-xs font-semibold uppercase tracking-wide ${style.text}`}>
                  {metric.category}
                </span>
              </div>

              {/* Label */}
              <h4 className={`text-sm font-semibold ${style.text} mb-2 leading-tight`}>
                {metric.label}
              </h4>

              {/* Value - Large and prominent */}
              <div className={`text-3xl font-bold ${style.valueText} mb-2`}>
                {metric.value}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-700 leading-tight">
                {metric.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Predefined metric sets for each component
 */
export const COMPONENT_METRICS: Record<string, BenefitMetric[]> = {
  'farm': [
    {
      category: 'environmental',
      label: 'Nutrient Runoff Reduction',
      value: '-95%',
      description: 'Biochar prevents nitrogen and phosphorus from entering waterways',
      icon: '💧'
    },
    {
      category: 'environmental',
      label: 'GHG Emissions Reduction',
      value: '-60%',
      description: 'Carbon sequestration and reduced synthetic fertilizer use',
      icon: '🌍'
    },
    {
      category: 'economic',
      label: 'Annual Cost Savings',
      value: '$50,000',
      description: 'Reduced fertilizer purchases and improved soil productivity',
      icon: '💰'
    },
    {
      category: 'operational',
      label: 'Soil Quality Improvement',
      value: '+40%',
      description: 'Enhanced water retention, nutrient availability, and microbial activity',
      icon: '🌱'
    }
  ],
  'chicken-house': [
    {
      category: 'environmental',
      label: 'Ammonia Reduction',
      value: '-90%',
      description: 'Biochar-based litter dramatically reduces ammonia emissions',
      icon: '😤'
    },
    {
      category: 'economic',
      label: 'Energy Cost Savings',
      value: '$25,000/yr',
      description: 'Reduced ventilation needs and improved bird health',
      icon: '⚡'
    },
    {
      category: 'operational',
      label: 'Bird Health Improvement',
      value: '+25%',
      description: 'Better air quality leads to healthier, more productive birds',
      icon: '🐔'
    },
    {
      category: 'operational',
      label: 'Litter Management',
      value: 'Simplified',
      description: 'Biochar litter lasts longer and requires less frequent replacement',
      icon: '♻️'
    }
  ],
  'processing-plant': [
    {
      category: 'environmental',
      label: 'Fossil Fuel Replacement',
      value: '100%',
      description: 'Biogas from anaerobic digester replaces natural gas',
      icon: '🔥'
    },
    {
      category: 'economic',
      label: 'Energy Independence',
      value: 'Complete',
      description: 'Self-sufficient energy from waste streams',
      icon: '💡'
    },
    {
      category: 'environmental',
      label: 'Waste Reduction',
      value: '-85%',
      description: 'Organic waste converted to valuable energy and products',
      icon: '♻️'
    },
    {
      category: 'operational',
      label: 'Operational Efficiency',
      value: '+30%',
      description: 'Reduced disposal costs and energy expenses',
      icon: '📈'
    }
  ],
  'waterways': [
    {
      category: 'environmental',
      label: 'Nutrient Runoff Reduction',
      value: '-95%',
      description: 'Biochar prevents nitrogen and phosphorus from entering waterways',
      icon: '💧'
    },
    {
      category: 'environmental',
      label: 'Water Quality Improvement',
      value: 'Dramatic',
      description: 'Restored ecosystems, reduced algal blooms and dead zones',
      icon: '🌊'
    },
    {
      category: 'environmental',
      label: 'Aquatic Life Recovery',
      value: '+80%',
      description: 'Fish populations and biodiversity improvement',
      icon: '🐟'
    },
    {
      category: 'overall',
      label: 'Ecosystem Health',
      value: 'Restored',
      description: 'Eliminated eutrophication and water pollution',
      icon: '🌿'
    }
  ],
  'anaerobic-digester': [
    {
      category: 'environmental',
      label: 'Waste Diversion',
      value: '100%',
      description: 'All organic waste converted to biogas and digestate',
      icon: '♻️'
    },
    {
      category: 'economic',
      label: 'Revenue Generation',
      value: '$75,000/yr',
      description: 'Biogas energy production and digestate sales',
      icon: '💰'
    },
    {
      category: 'environmental',
      label: 'GHG Emission Reduction',
      value: '-80%',
      description: 'Methane capture prevents atmospheric release',
      icon: '🌍'
    },
    {
      category: 'overall',
      label: 'System Value',
      value: 'High',
      description: 'Transforms disposal problem into revenue stream',
      icon: '⭐'
    }
  ],
  'pyrolysis-unit': [
    {
      category: 'environmental',
      label: 'Carbon Sequestration',
      value: '500 tons/yr',
      description: 'Biochar locks carbon in stable form for centuries',
      icon: '🌍'
    },
    {
      category: 'economic',
      label: 'Product Revenue',
      value: '$100,000/yr',
      description: 'Biochar, bio-oils, and syngas sales',
      icon: '💰'
    },
    {
      category: 'operational',
      label: 'Energy Generation',
      value: '2.5 MW',
      description: 'Syngas provides renewable energy for operations',
      icon: '⚡'
    },
    {
      category: 'overall',
      label: 'Innovation Impact',
      value: 'Transformative',
      description: 'Creates multiple value streams from waste material',
      icon: '🚀'
    }
  ]
};