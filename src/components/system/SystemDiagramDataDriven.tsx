/**
 * Data-Driven System Diagram
 * Generates all flows from system-comparison.json data
 */

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { useSystemView } from '@/hooks/useSystemView';
import { useSystemData } from '@/hooks/useSystemData';
import { ComponentName } from '@/types';
import { AnimatedIcon } from '@/components/d3/AnimatedIcon';
import { getIconPath } from '@/lib/iconMapping';
import { getTooltipData } from '@/lib/tooltipData';

interface ComponentBoxProps {
  id: ComponentName;
  name: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
}

function ComponentBox({ id, name, position }: ComponentBoxProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      data-component-id={id}
      onClick={() => router.push(`/${id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="absolute cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10 animate-slide-fade-in"
      style={position}
    >
      <div 
        className={`
          border-2 border-dashed bg-white rounded-lg p-4 w-40 text-center
          transition-all duration-300
          ${isHovered 
            ? 'border-blue-500 shadow-2xl shadow-blue-500/50 animate-pulse-glow' 
            : 'border-gray-400 shadow-md'
          }
        `}
      >
        <div className="flex flex-col items-center gap-2">
          <Icon name={id} size="lg" className={`transition-colors duration-300 ${isHovered ? 'text-blue-600' : 'text-gray-700'}`} />
          <h3 className="font-bold text-sm text-gray-900">{name}</h3>
        </div>
      </div>
    </div>
  );
}

interface FlowConfig {
  id: string;
  startX: string;
  startY: string;
  endX: string;
  endY: string;
  material: string;
  duration: number;
}

export function SystemDiagramDataDriven() {
  const { systemView } = useSystemView();
  const {
    getActiveComponents,
    getComponent,
    findConnections,
    getComponentInputs,
    getComponentOutputs
  } = useSystemData();
  
  // Add fade transition state
  const [isVisible, setIsVisible] = useState(true);
  const [prevView, setPrevView] = useState(systemView);

  // Handle view transitions with fade effect
  useEffect(() => {
    if (prevView !== systemView) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setPrevView(systemView);
        setIsVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [systemView, prevView]);

  // Generate component layout
  const components = useMemo(() => {
    const active = getActiveComponents;
    
    if (systemView === 'current') {
      // Current: 3 components - vertical layout
      return [
        { id: 'chicken-house', name: 'Chicken House', position: { top: '42%', left: '5%' } },
        { id: 'processing-plant', name: 'Processing Plant', position: { top: '8%', left: '42%' } },
        { id: 'farm-waterways', name: 'Farm & Waterways', position: { bottom: '8%', left: '42%' } }
      ].filter(c => active.includes(c.id as ComponentName));
    } else {
      // Proposed: 5 components - circular layout
      return [
        { id: 'chicken-house', name: 'Chicken House', position: { top: '42%', left: '5%' } },
        { id: 'processing-plant', name: 'Processing Plant', position: { top: '8%', left: '42%' } },
        { id: 'anaerobic-digester', name: 'Anaerobic Digester', position: { top: '42%', left: '42%' } },
        { id: 'pyrolysis-unit', name: 'Pyrolysis Unit', position: { top: '42%', right: '5%' } },
        { id: 'farm-waterways', name: 'Farm & Waterways', position: { bottom: '8%', left: '42%' } }
      ].filter(c => active.includes(c.id as ComponentName));
    }
  }, [systemView, getActiveComponents]);

  // Generate flows from connections and inputs/outputs
  const flows = useMemo((): FlowConfig[] => {
    const generatedFlows: FlowConfig[] = [];
    let flowIndex = 0;

    if (systemView === 'current') {
      // CURRENT PRACTICE FLOWS
      
      // External inputs to Chicken House - with tooltips
      generatedFlows.push(
        {
          id: `flow-${flowIndex++}`,
          startX: '2', startY: '38',
          endX: '8', endY: '45',
          material: 'Fresh Pine Shavings',
          duration: 3000
        },
        {
          id: `flow-${flowIndex++}`,
          startX: '2', startY: '52',
          endX: '8', endY: '50',
          material: 'Chicken Feed',
          duration: 3200
        }
      );

      // Chicken House to Processing Plant
      generatedFlows.push({
        id: `flow-${flowIndex++}`,
        startX: '18', startY: '42',
        endX: '42', endY: '20',
        material: 'Live Chickens',
        duration: 4000
      });

      // Processing outputs
      generatedFlows.push(
        {
          id: `flow-${flowIndex++}`,
          startX: '58', startY: '12',
          endX: '72', endY: '12',
          material: 'Meat',
          duration: 2800
        },
        {
          id: `flow-${flowIndex++}`,
          startX: '47', startY: '25',
          endX: '47', endY: '20',
          material: 'Fossil Fuels',
          duration: 2500
        }
      );

      // Chicken House waste to Farm
      generatedFlows.push(
        {
          id: `flow-${flowIndex++}`,
          startX: '15', startY: '55',
          endX: '40', endY: '75',
          material: 'Used Poultry Litter',
          duration: 3800
        },
        {
          id: `flow-${flowIndex++}`,
          startX: '25', startY: '82',
          endX: '38', endY: '82',
          material: 'Fertilizers',
          duration: 3000
        }
      );

    } else {
      // PROPOSED SYSTEM FLOWS
      
      // External inputs to Chicken House
      generatedFlows.push(
        {
          id: `flow-${flowIndex++}`,
          startX: '2', startY: '38',
          endX: '8', endY: '45',
          material: 'Fresh Pine Shavings',
          duration: 3000
        },
        {
          id: `flow-${flowIndex++}`,
          startX: '2', startY: '52',
          endX: '8', endY: '50',
          material: 'Chicken Feed',
          duration: 3200
        }
      );

      // Chicken House to Processing Plant
      generatedFlows.push({
        id: `flow-${flowIndex++}`,
        startX: '18', startY: '42',
        endX: '42', endY: '20',
        material: 'Live Chickens',
        duration: 4000
      });

      // Processing to Meat output
      generatedFlows.push({
        id: `flow-${flowIndex++}`,
        startX: '58', startY: '12',
        endX: '75', endY: '12',
        material: 'Meat',
        duration: 2800
      });

      // Chicken House litter splitting
      const connections = findConnections;
      connections.forEach(conn => {
        if (conn.source === 'chicken-house' && conn.target === 'anaerobic-digester') {
          generatedFlows.push({
            id: `flow-${flowIndex++}`,
            startX: '18', startY: '50',
            endX: '42', endY: '48',
            material: conn.material,
            duration: 3500
          });
        }
        if (conn.source === 'chicken-house' && conn.target === 'pyrolysis-unit') {
          generatedFlows.push({
            id: `flow-${flowIndex++}`,
            startX: '18', startY: '46',
            endX: '75', endY: '45',
            material: conn.material,
            duration: 3800
          });
        }
        if (conn.source === 'processing-plant' && conn.target === 'anaerobic-digester') {
          generatedFlows.push({
            id: `flow-${flowIndex++}`,
            startX: '47', startY: '20',
            endX: '47', endY: '40',
            material: conn.material,
            duration: 2500
          });
        }
        if (conn.source === 'anaerobic-digester' && conn.target === 'farm-waterways') {
          generatedFlows.push({
            id: `flow-${flowIndex++}`,
            startX: '47', startY: '54',
            endX: '47', endY: '70',
            material: 'Digestate',
            duration: 3200
          });
        }
        if (conn.source === 'pyrolysis-unit' && conn.target === 'chicken-house' && conn.material.toLowerCase().includes('biochar')) {
          generatedFlows.push({
            id: `flow-${flowIndex++}`,
            startX: '75', startY: '48',
            endX: '18', endY: '48',
            material: 'Biochar',
            duration: 4500
          });
        }
        if (conn.source === 'pyrolysis-unit' && conn.target === 'anaerobic-digester') {
          generatedFlows.push({
            id: `flow-${flowIndex++}`,
            startX: '75', startY: '46',
            endX: '54', endY: '46',
            material: conn.material,
            duration: 3000
          });
        }
      });

      // Energy outputs
      generatedFlows.push(
        {
          id: `flow-${flowIndex++}`,
          startX: '54', startY: '42',
          endX: '72', endY: '35',
          material: 'Bio-Methane',
          duration: 3500
        },
        {
          id: `flow-${flowIndex++}`,
          startX: '85', startY: '42',
          endX: '95', endY: '35',
          material: 'Syngas',
          duration: 3000
        },
        {
          id: `flow-${flowIndex++}`,
          startX: '85', startY: '46',
          endX: '95', endY: '50',
          material: 'Biochar',
          duration: 3200
        }
      );
    }

    return generatedFlows;
  }, [systemView, findConnections]);

  return (
    <div className={`relative w-full h-[600px] bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Component Boxes */}
      {components.map(comp => (
        <ComponentBox
          key={comp.id}
          id={comp.id as ComponentName}
          name={comp.name}
          position={comp.position}
        />
      ))}

      {/* Animated Flow Icons with Tooltips */}
      {flows.map(flow => (
        <AnimatedIcon
          key={flow.id}
          id={flow.id}
          startX={flow.startX}
          startY={flow.startY}
          endX={flow.endX}
          endY={flow.endY}
          iconPath={getIconPath(flow.material)}
          iconSize={35}
          duration={flow.duration}
          label={flow.material}
          labelColor="gray"
          tooltipData={getTooltipData(flow.material)}
        />
      ))}
    </div>
  );
}