/**
 * System Diagram - Flow-based layout showing component relationships
 * Displays different components based on Current vs Proposed view
 */

'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { ToggleSwitch } from '@/components/system/ToggleSwitch';
import { useSystemView } from '@/hooks/useSystemView';
import { ComponentName } from '@/types';
import { AnimatedFlowPath } from '@/components/d3/AnimatedFlowPath';
import { AnimatedCounter } from '@/components/d3/AnimatedCounter';
import { AnimatedTruck } from '@/components/d3/AnimatedTruck';
import { AnimatedIcon } from '@/components/d3/AnimatedIcon';
import { SankeyDiagram } from '@/components/d3/SankeyDiagram';
import { getIconPath } from '@/lib/iconMapping';

type ViewTab = 'flow' | 'sankey';

interface ComponentBoxProps {
  id: ComponentName;
  name: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  subtitle?: string;
}

function ComponentBox({ id, name, position, subtitle }: ComponentBoxProps) {
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
          <div>
            <h3 className="font-bold text-sm text-gray-900">{name}</h3>
            {subtitle && (
              <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BenefitBadge {
  metric: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
}

const BENEFIT_BADGES: Record<string, BenefitBadge[]> = {
  economic: [
    { metric: '$250-500/ton CO₂ credits', position: { top: '3%', right: '22%' } },
    { metric: '$6-12/MMBTU RNG', position: { top: '35%', left: '53%' } },
    { metric: '$800/ton USDA grants', position: { bottom: '12%', right: '22%' } },
  ],
  environmental: [
    { metric: '90% ammonia reduction', position: { top: '10%', left: '23%' } },
    { metric: '2.5 tonnes CO₂-eq', position: { top: '1%', right: '22%' } },
    { metric: '95% P, 70% N recovery', position: { bottom: '14%', right: '22%' } },
  ],
  reuse: [
    { metric: '100% energy self-sufficient', position: { top: '33%', left: '53%' } },
    { metric: 'Biochar soil amendment', position: { top: '5%', right: '22%' } },
    { metric: 'Zero fertilizer runoff', position: { bottom: '16%', right: '22%' } },
  ],
};

interface SystemDiagramProps {
  activeFilter?: string | null;
  activeComponents?: string[];
  systemView?: 'current' | 'proposed';
}

export function SystemDiagram({ activeFilter, activeComponents: providedComponents, systemView: providedView }: SystemDiagramProps) {
  const { systemView: hookSystemView } = useSystemView();
  
  // Use provided values or fall back to hook
  const systemView = providedView || hookSystemView;
  const activeComponents = providedComponents || (systemView === 'current'
    ? ['chicken-house', 'processing-plant', 'farm-waterways']
    : ['chicken-house', 'processing-plant', 'anaerobic-digester', 'pyrolysis-unit', 'farm-waterways']
  );
  
  // Helper to check if component should be rendered
  const isComponentActive = (componentId: string) => activeComponents.includes(componentId);
  const diagramRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('flow');

  return (
    <div className="relative bg-white rounded-2xl shadow-lg p-8" style={{ minHeight: '700px' }}>
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border-2 border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setActiveTab('flow')}
            className={`
              px-6 py-2 rounded-md font-semibold transition-all duration-300
              ${activeTab === 'flow'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            🔄 Flow View
          </button>
          <button
            onClick={() => setActiveTab('sankey')}
            className={`
              px-6 py-2 rounded-md font-semibold transition-all duration-300
              ${activeTab === 'sankey'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            📊 Material Flow
          </button>
        </div>
      </div>

      {/* Toggle Switch - Centered below tabs */}
      <div className="flex justify-center mb-6">
        <ToggleSwitch />
      </div>
      
      <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">
        {activeTab === 'flow' ? 'System Flow Diagram' : 'Quantitative Material Flows'}
      </h2>

      {/* Conditional Content Based on Active Tab */}
      {activeTab === 'flow' ? (
        <div ref={diagramRef} className="relative" style={{ height: '600px' }}>
          {/* Current Practice View - Vertical Layout */}
          {systemView === 'current' ? (
          <>
            {/* Processing Plant - TOP CENTER */}
            {isComponentActive('processing-plant') && (
              <ComponentBox
                id="processing-plant"
                name="Processing Plant"
                position={{ top: '8%', left: '42%' }}
              />
            )}

            {/* Chicken House - LEFT MIDDLE */}
            {isComponentActive('chicken-house') && (
              <ComponentBox
                id="chicken-house"
                name="Chicken House"
                position={{ top: '42%', left: '8%' }}
              />
            )}

            {/* Farm Land Application - BOTTOM CENTER */}
            <div className="absolute cursor-pointer" style={{ bottom: '12%', left: '38%' }}>
              <div className="border-2 border-dashed border-gray-400 bg-white rounded-lg p-4 w-48 text-center shadow-md animate-slide-fade-in">
                <h3 className="font-bold text-sm text-gray-900">Farm Land Application</h3>
                <p className="text-xs text-gray-600 mt-1">Crops & Livestock</p>
              </div>
            </div>

            {/* Rivers/Waterways - BOTTOM RIGHT (pollution indicator) */}
            <div className="absolute" style={{ bottom: '12%', right: '8%' }}>
              <div className="border-2 border-red-400 bg-red-50 rounded-lg p-3 w-44 text-center shadow-md animate-slide-fade-in">
                <h3 className="font-bold text-sm text-red-800">Rivers & Waterways</h3>
                <p className="text-xs text-red-600 mt-1">💧 Nutrient Pollution</p>
              </div>
            </div>

            {/* GHG Emissions indicator (from Processing Plant) */}
            <div className="absolute animate-slide-fade-in" style={{ top: '1%', left: '41%' }}>
              <div className="bg-red-100 border-2 border-red-400 rounded-lg px-3 py-2 shadow">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏭</span>
                  <div>
                    <p className="text-xs font-semibold text-red-800">GHG Emissions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FOG to Landfill indicator */}
            <div className="absolute animate-slide-fade-in" style={{ top: '15%', right: '15%' }}>
              <div className="bg-amber-100 border-2 border-amber-400 rounded-lg px-3 py-2 shadow">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🗑️</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-800">FOG → Landfill</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated Flow Paths - Current Practice (Vertical Layout) */}
            
            {/* Fresh Pine Shavings to Chicken House */}
            <AnimatedIcon
              id="pine-to-chicken"
              startX="2"
              startY="38"
              endX="8"
              endY="45"
              iconPath={getIconPath("Fresh Pine Shavings")}
              iconSize={35}
              duration={3000}
              label="Pine Shavings"
              labelColor="gray"
              tooltipData={{
                title: "PINE SHAVINGS (INPUT)",
                metrics: [
                  { label: "Cost per Ton", value: "$150-250", icon: "💵" },
                  { label: "Supply Distance", value: "100-300 miles", icon: "🚚" },
                  { label: "Replacement Frequency", value: "Every 60 days", icon: "📅" },
                  { label: "Annual Cost", value: "$75,000-125,000", icon: "💰" }
                ],
                highlights: [
                  "🌲 External resource dependency",
                  "🚚 High transportation costs",
                  "📈 Price volatility & supply risk"
                ]
              }}
            />

            {/* Chicken Feed to Chicken House */}
            <AnimatedIcon
              id="feed-to-chicken"
              startX="2"
              startY="52"
              endX="8"
              endY="50"
              iconPath={getIconPath("Chicken Feed")}
              iconSize={35}
              duration={3200}
              label="Chicken Feed"
              labelColor="gray"
              tooltipData={{
                title: "CHICKEN FEED (INPUT)",
                metrics: [
                  { label: "Cost per Ton", value: "$400-600", icon: "💵" },
                  { label: "Feed Conversion", value: "1.8:1 ratio", icon: "📊" },
                  { label: "NPK Content", value: "18-20-10", icon: "🌾" },
                  { label: "Annual Cost", value: "$2M-3M", icon: "💰" }
                ],
                highlights: [
                  "💰 Major operational expense",
                  "📈 Commodity price fluctuation",
                  "🌾 High nutritional requirements"
                ]
              }}
            />

            {/* Chickens to Processing Plant - Truck going UP */}
            <AnimatedTruck
              id="chickens-to-processing"
              startX="18"
              startY="42"
              endX="42"
              endY="20"
              duration={4000}
            />

            {/* Processing Plant to Meat (output right) */}
            <AnimatedIcon
              id="processing-to-meat"
              startX="58"
              startY="12"
              endX="72"
              endY="12"
              iconPath={getIconPath("Meat")}
              iconSize={35}
              duration={2800}
              label="Meat"
              labelColor="green"
              tooltipData={{
                title: "MEAT OUTPUT (REVENUE)",
                metrics: [
                  { label: "Market Value", value: "$1.50-2.50/lb", icon: "💵" },
                  { label: "Annual Production", value: "5-10M lbs", icon: "📦" },
                  { label: "Processing Yield", value: "72-75%", icon: "📊" },
                  { label: "Revenue Stream", value: "$10-25M/year", icon: "💰" }
                ],
                highlights: [
                  "🥇 Primary revenue source",
                  "📈 Consistent market demand",
                  "⭐ Quality standards critical"
                ]
              }}
            />

            {/* Fossil Fuels & Electricity to Processing Plant (from below) */}
            <AnimatedIcon
              id="energy-to-processing"
              startX="47"
              startY="25"
              endX="47"
              endY="20"
              iconPath={getIconPath("Fossil Fuels")}
              iconSize={35}
              duration={2500}
              label="Fossil Fuels"
              labelColor="amber"
              tooltipData={{
                title: "FOSSIL FUELS (PROBLEM)",
                metrics: [
                  { label: "Cost per MMBTU", value: "$8-15", icon: "💵" },
                  { label: "CO₂ Emissions", value: "117 lbs/MMBTU", icon: "🏭" },
                  { label: "Grid Dependency", value: "100%", icon: "⚡" },
                  { label: "Annual Energy Cost", value: "$500K-1M", icon: "💰" }
                ],
                highlights: [
                  "🌍 High carbon footprint",
                  "📈 Rising energy costs",
                  "⚠️ Supply chain vulnerability"
                ]
              }}
            />

            {/* Dead Chickens from Chicken House (downward) */}
            <AnimatedFlowPath
              id="dead-chickens"
              startX="18"
              startY="55"
              endX="22"
              endY="65"
              color="#7C2D12"
              particleColor="#991B1B"
              particleCount={1}
              duration={4000}
            />

            {/* Used Poultry Litter to Farm (downward) */}
            <AnimatedIcon
              id="litter-to-farm"
              startX="15"
              startY="55"
              endX="40"
              endY="75"
              iconPath={getIconPath("Used Poultry Litter")}
              iconSize={35}
              duration={3800}
              label="Used Litter"
              labelColor="red"
              tooltipData={{
                title: "USED LITTER (POLLUTION)",
                metrics: [
                  { label: "Ammonia Content", value: "90% higher vs Proposed", icon: "💨" },
                  { label: "N₂O Emissions", value: "54-97% more", icon: "🏭" },
                  { label: "Disposal Cost", value: "$20-40/ton", icon: "💵" },
                  { label: "Environmental Impact", value: "High", icon: "⚠️" }
                ],
                highlights: [
                  "🌍 Major pollutant source",
                  "💰 Expensive disposal required",
                  "🌊 Water contamination risk"
                ]
              }}
            />

            {/* Chemical Fertilizers to Farm (from left) */}
            <AnimatedIcon
              id="fertilizers-to-farm"
              startX="25"
              startY="82"
              endX="38"
              endY="82"
              iconPath={getIconPath("Fertilizers")}
              iconSize={35}
              duration={3000}
              label="Fertilizers"
              labelColor="purple"
              tooltipData={{
                title: "CHEMICAL FERTILIZERS",
                metrics: [
                  { label: "Cost per Ton", value: "$600-1,200", icon: "💵" },
                  { label: "NPK Content", value: "10-10-10 typical", icon: "🧪" },
                  { label: "Runoff Pollution", value: "30-50%", icon: "🌊" },
                  { label: "Soil Degradation", value: "Long-term", icon: "⚠️" }
                ],
                highlights: [
                  "💰 Expensive recurring cost",
                  "🌊 Causes water pollution",
                  "🌍 Depletes soil health over time"
                ]
              }}
            />

            {/* Farm to Crops (output left) */}
            <AnimatedFlowPath
              id="farm-to-crops"
              startX="38"
              startY="78"
              endX="10"
              endY="78"
              color="#059669"
              particleColor="#10B981"
              particleCount={2}
              duration={3500}
            />

            {/* Water & GHG Emissions from Farm (downward) */}
            <AnimatedFlowPath
              id="farm-emissions"
              startX="48"
              startY="85"
              endX="48"
              endY="95"
              color="#DC2626"
              particleColor="#EF4444"
              particleCount={3}
              duration={3000}
            />

            {/* Fertilizer Runoff to Rivers (right) */}
            <AnimatedFlowPath
              id="runoff-to-rivers"
              startX="58"
              startY="82"
              endX="73"
              endY="82"
              color="#DC2626"
              particleColor="#EF4444"
              particleCount={4}
              duration={4000}
            />
          </>
        ) : (
          /* Proposed System View - Improved Spacing */
          <>
            {/* Processing Plant - TOP CENTER */}
            {isComponentActive('processing-plant') && (
              <ComponentBox
                id="processing-plant"
                name="Processing Plant"
                position={{ top: '5%', left: '40%' }}
              />
            )}

            {/* Chicken House - LEFT MIDDLE (more left) */}
            {isComponentActive('chicken-house') && (
              <ComponentBox
                id="chicken-house"
                name="Chicken House"
                position={{ top: '42%', left: '5%' }}
              />
            )}

            {/* Anaerobic Digester - CENTER (more space from others) */}
            {isComponentActive('anaerobic-digester') && (
              <ComponentBox
                id="anaerobic-digester"
                name="Anaerobic Digester (AD)"
                position={{ top: '42%', left: '40%' }}
              />
            )}

            {/* Pyrolysis Unit - TOP RIGHT (more space) */}
            {isComponentActive('pyrolysis-unit') && (
              <ComponentBox
                id="pyrolysis-unit"
                name="Pyrolysis"
                position={{ top: '5%', right: '5%' }}
              />
            )}

            {/* Farm/Waterways - BOTTOM CENTER */}
            {isComponentActive('farm-waterways') && (
              <ComponentBox
                id="farm-waterways"
                name="Farmland, Rivers & Lakes"
                position={{ bottom: '8%', left: '37%' }}
                subtitle="Biochar & Digestate"
              />
            )}

            {/* Emission Reduction Badge - Smaller, Top Right Corner */}
            <div className="absolute top-2 right-2 bg-green-50/80 border border-green-300 rounded px-2 py-1 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="text-sm">🌱</span>
                <p className="text-[10px] font-medium text-green-700">-90% Emissions</p>
              </div>
            </div>

            {/* Animated Flow Paths - Proposed System (Vertical Layout) */}
            
            {/* Chicken House to AD - Used litter (horizontal right) */}
            <AnimatedIcon
              id="chicken-to-ad"
              startX="18"
              startY="47"
              endX="42"
              endY="45"
              iconPath={getIconPath("Used Poultry Litter")}
              iconSize={35}
              duration={3500}
              label="Used Litter"
              labelColor="gray"
              tooltipData={{
                title: "USED POULTRY LITTER",
                metrics: [
                  { label: "Processing Volume", value: "50-100 tons/day", icon: "📦" },
                  { label: "Ammonia Content", value: "3-5% (High)", icon: "💨" },
                  { label: "Methane Potential", value: "200-300 m³/ton", icon: "⚡" },
                  { label: "Energy Recovery", value: "70-80%", icon: "🔋" }
                ],
                highlights: [
                  "♻️ Captures nutrients for reuse",
                  "🌍 Eliminates landfill disposal",
                  "⚡ Generates renewable energy"
                ]
              }}
            />
            
            {/* Chicken House to Pyrolysis - Fresh litter (diagonal up-right) */}
            <AnimatedIcon
              id="chicken-to-pyrolysis"
              startX="18"
              startY="40"
              endX="72"
              endY="15"
              iconPath={getIconPath("Fresh Pine Shavings")}
              iconSize={35}
              duration={4000}
              label="Fresh Litter"
              labelColor="gray"
              tooltipData={{
                title: "FRESH PINE LITTER",
                metrics: [
                  { label: "Carbon Content", value: "45-50% (High)", icon: "⚫" },
                  { label: "Moisture Content", value: "8-12%", icon: "💧" },
                  { label: "Energy Value", value: "18-20 MJ/kg", icon: "🔥" },
                  { label: "Biochar Yield", value: "25-30%", icon: "🌱" }
                ],
                highlights: [
                  "♻️ Optimal for biochar production",
                  "🌲 Renewable resource from forestry",
                  "⚡ High energy density for pyrolysis"
                ]
              }}
            />
            
            {/* Processing Plant to AD - Waste (straight down) */}
            <AnimatedIcon
              id="processing-to-ad"
              startX="47"
              startY="20"
              endX="47"
              endY="35"
              iconPath={getIconPath("FOG")}
              iconSize={35}
              duration={3000}
              label="Waste"
              labelColor="gray"
              tooltipData={{
                title: "PROCESSING WASTE (FOG)",
                metrics: [
                  { label: "Organic Content", value: "90-95%", icon: "🧫" },
                  { label: "Methane Yield", value: "350-450 m³/ton", icon: "⚡" },
                  { label: "Processing Time", value: "20-30 days", icon: "⏱️" },
                  { label: "Energy Recovery", value: "85-90%", icon: "🔋" }
                ],
                highlights: [
                  "♻️ 100% waste diversion from landfill",
                  "⚡ High-value RNG production",
                  "🌍 Eliminates methane emissions"
                ]
              }}
            />
            
            {/* AD to Pyrolysis - Syngas energy (diagonal up-right) */}
            <AnimatedIcon
              id="ad-to-pyrolysis"
              startX="54"
              startY="40"
              endX="72"
              endY="20"
              iconPath={getIconPath("Syngas Energy")}
              iconSize={35}
              duration={2800}
              label="Syngas"
              labelColor="purple"
              tooltipData={{
                title: "SYNGAS (RENEWABLE GAS)",
                metrics: [
                  { label: "Energy Value", value: "$6-12/MMBTU", icon: "⚡" },
                  { label: "Fossil Fuel Replacement", value: "100%", icon: "🔥" },
                  { label: "Energy Self-Sufficiency", value: "Complete", icon: "🔋" }
                ],
                highlights: [
                  "♻️ Powers the pyrolysis process",
                  "💡 Zero external energy needed",
                  "🌍 Eliminates fossil fuel dependency"
                ]
              }}
            />
            
            {/* Pyrolysis to Farm - Biochar (straight down) */}
            <AnimatedIcon
              id="pyrolysis-to-farm"
              startX="78"
              startY="20"
              endX="55"
              endY="75"
              iconPath={getIconPath("Biochar")}
              iconSize={40}
              duration={4500}
              label="Biochar"
              labelColor="green"
              tooltipData={{
                title: "BIOCHAR",
                metrics: [
                  { label: "Carbon Sequestration", value: "2.5 tonnes CO₂e/ton", icon: "🌍" },
                  { label: "Market Value", value: "$250-500/ton", icon: "💰" },
                  { label: "Soil Stability", value: "1000+ years", icon: "⏳" },
                  { label: "Fertilizer Replacement", value: "100%", icon: "🌾" }
                ],
                highlights: [
                  "♻️ Closes the circular economy loop",
                  "💡 Replaces synthetic fertilizers",
                  "🌱 Improves soil water retention"
                ]
              }}
            />
            
            {/* AD to Farm - Digestate liquid (straight down) */}
            <AnimatedIcon
              id="ad-to-farm"
              startX="47"
              startY="55"
              endX="47"
              endY="75"
              iconPath={getIconPath("Digestate Liquids")}
              iconSize={35}
              duration={3800}
              label="Digestate"
              labelColor="blue"
              tooltipData={{
                title: "DIGESTATE LIQUID",
                metrics: [
                  { label: "Phosphorus Recovery", value: "95%", icon: "🧪" },
                  { label: "Nitrogen Recovery", value: "70%", icon: "🌿" },
                  { label: "Fertilizer Value", value: "High NPK", icon: "💧" }
                ],
                highlights: [
                  "♻️ Natural liquid fertilizer",
                  "🌊 Zero water pollution",
                  "🌾 Replaces chemical fertilizers"
                ]
              }}
            />
            
            {/* Biochar returns to Chicken House (circular!) */}
            <AnimatedIcon
              id="biochar-to-chicken"
              startX="38"
              startY="78"
              endX="18"
              endY="50"
              iconPath={getIconPath("Biochar")}
              iconSize={30}
              duration={4500}
              label="Biochar Return"
              labelColor="green"
              tooltipData={{
                title: "BIOCHAR RETURN (CIRCULAR)",
                metrics: [
                  { label: "Application Rate", value: "5-10% of litter", icon: "📊" },
                  { label: "Reuse Cycle", value: "Every 60 days", icon: "🔄" },
                  { label: "Carbon Permanence", value: "1000+ years", icon: "⏳" },
                  { label: "Ammonia Reduction", value: "90%", icon: "💨" }
                ],
                highlights: [
                  "♻️ Completes the circular economy",
                  "🌱 Zero-waste system achieved",
                  "🏡 Improves chicken health & air quality"
                ]
              }}
            />

            {/* Process Output Badge - Right Side */}
            <div className="absolute bg-purple-50/90 border border-purple-300 rounded-lg px-3 py-2 shadow-sm" style={{ top: '15%', right: '2%' }}>
              <p className="text-[10px] font-semibold text-purple-800">Pyrolysis Output:</p>
              <p className="text-[9px] text-purple-700">Biochar + Decaked Litter</p>
            </div>

            {/* Environmental Impact Badge - Bottom */}
            <div className="absolute bg-green-50/80 border border-green-300 rounded px-2 py-1 shadow-sm" style={{ bottom: '4%', left: '5%' }}>
              <p className="text-[10px] font-medium text-green-700">♻️ Zero Fertilizer Runoff</p>
            </div>
          </>
        )}

        {/* Benefit Overlays - Only show in Proposed view */}
        {systemView === 'proposed' && activeFilter && BENEFIT_BADGES[activeFilter] && (
          <>
            {BENEFIT_BADGES[activeFilter].map((badge, idx) => (
              <div
                key={idx}
                className="absolute animate-fade-in"
                style={badge.position}
              >
                <div className={`
                  px-3 py-2 rounded-lg shadow-lg border-2 text-sm font-semibold whitespace-nowrap
                  ${activeFilter === 'economic' ? 'bg-green-50 border-green-400 text-green-800' : ''}
                  ${activeFilter === 'environmental' ? 'bg-blue-50 border-blue-400 text-blue-800' : ''}
                  ${activeFilter === 'reuse' ? 'bg-purple-50 border-purple-400 text-purple-800' : ''}
                `}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {activeFilter === 'economic' ? '💰' : ''}
                      {activeFilter === 'environmental' ? '🌱' : ''}
                      {activeFilter === 'reuse' ? '♻️' : ''}
                    </span>
                    <AnimatedCounter value={badge.metric} />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        </div>
      ) : (
        <SankeyDiagram />
      )}

      {activeTab === 'flow' && (
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Click any component to view detailed information</p>
          {activeFilter && systemView === 'proposed' && (
            <p className="mt-2 text-amber-600 font-medium">
              Showing {activeFilter} benefits - Click the filter again to clear
            </p>
          )}
        </div>
      )}
    </div>
  );
}
