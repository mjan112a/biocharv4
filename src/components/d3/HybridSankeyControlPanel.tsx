'use client';

import React, { useState } from 'react';
import { HybridNode } from '@/lib/hybridSankeyLayout';
import { PathConfig } from '@/lib/hybridPathGenerator';
import { RibbonConfig } from '@/lib/ribbonPathGenerator';
import { ParticleAnimationConfig } from '@/lib/flowParticleAnimator';
import { VisualizationMode } from './HybridSankeyDiagram';

interface HybridSankeyControlPanelProps {
  nodes: HybridNode[];
  selectedNode: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onNodePositionChange: (nodeId: string, x: number, y: number) => void;
  pathConfig: PathConfig;
  onPathConfigChange: (config: PathConfig) => void;
  ribbonConfig?: RibbonConfig;
  onRibbonConfigChange?: (config: RibbonConfig) => void;
  particleConfig?: ParticleAnimationConfig;
  onParticleConfigChange?: (config: ParticleAnimationConfig) => void;
  visualizationMode?: VisualizationMode;
  onVisualizationModeChange?: (mode: VisualizationMode) => void;
  showAnimations?: boolean;
  onShowAnimationsChange?: (show: boolean) => void;
  onOptimizeLayout: () => void;
  onResetLayout: () => void;
  onSaveLayout: () => void;
  onLoadLayout: (file: File) => void;
  currentPreset: string;
  onPresetChange: (preset: string) => void;
}

const PRESETS = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'wide', label: 'Wide' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'custom', label: 'Custom' }
];

export function HybridSankeyControlPanel({
  nodes,
  selectedNode,
  onNodeSelect,
  onNodePositionChange,
  pathConfig,
  onPathConfigChange,
  ribbonConfig,
  onRibbonConfigChange,
  particleConfig,
  onParticleConfigChange,
  visualizationMode = 'lines',
  onVisualizationModeChange,
  showAnimations = false,
  onShowAnimationsChange,
  onOptimizeLayout,
  onResetLayout,
  onSaveLayout,
  onLoadLayout,
  currentPreset,
  onPresetChange
}: HybridSankeyControlPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onLoadLayout(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          <h3 className="text-white font-bold text-lg">Control Panel</h3>
        </div>
        <button className="text-white hover:text-gray-200 transition-colors">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
          
          {/* Node Editor Section */}
          <section>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📍</span>
              Node Editor
            </h4>
            
            {/* Node Selector */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Node
              </label>
              <select
                value={selectedNode || ''}
                onChange={(e) => onNodeSelect(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- None --</option>
                {nodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Position Controls */}
            {selectedNodeData && (
              <div className="space-y-3 bg-gray-50 p-3 rounded-md">
                {/* X Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    X Position: {Math.round(selectedNodeData.x)}
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="960"
                    value={selectedNodeData.x}
                    onChange={(e) => onNodePositionChange(selectedNodeData.id, parseFloat(e.target.value), selectedNodeData.y)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Y Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Y Position: {Math.round(selectedNodeData.y)}
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="660"
                    value={selectedNodeData.y}
                    onChange={(e) => onNodePositionChange(selectedNodeData.id, selectedNodeData.x, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Reset Button */}
                <button
                  onClick={onResetLayout}
                  className="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors text-sm"
                >
                  Reset Position
                </button>
              </div>
            )}
          </section>

          {/* Path Styling Section */}
          <section className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>🎨</span>
              Path Styling
            </h4>

            <div className="space-y-3">
              {/* Width Scale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width Scale: {pathConfig.widthScale.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.3"
                  step="0.01"
                  value={pathConfig.widthScale}
                  onChange={(e) => onPathConfigChange({ ...pathConfig, widthScale: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Curvature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curvature: {pathConfig.curvature.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={pathConfig.curvature}
                  onChange={(e) => onPathConfigChange({ ...pathConfig, curvature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Arc Radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arc Radius: {pathConfig.arcRadius.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={pathConfig.arcRadius}
                  onChange={(e) => onPathConfigChange({ ...pathConfig, arcRadius: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </section>

          {/* Visualization Mode Section */}
          <section className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>👁️</span>
              Visualization Mode
            </h4>

            <div className="space-y-3">
              {/* Mode Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onVisualizationModeChange?.('lines')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      visualizationMode === 'lines'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Lines
                  </button>
                  <button
                    onClick={() => onVisualizationModeChange?.('ribbons')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      visualizationMode === 'ribbons'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Ribbons
                  </button>
                  <button
                    onClick={() => onVisualizationModeChange?.('both')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      visualizationMode === 'both'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Both
                  </button>
                </div>
              </div>

              {/* Animations Toggle */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <label className="text-sm font-medium text-gray-700">
                  Enable Particle Animations
                </label>
                <button
                  onClick={() => onShowAnimationsChange?.(!showAnimations)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showAnimations ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showAnimations ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Particle Animation Controls */}
          {showAnimations && visualizationMode !== 'ribbons' && particleConfig && onParticleConfigChange && (
            <section className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>✨</span>
                Particle Animations
              </h4>

              <div className="space-y-3">
                {/* Flow Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flow Rate: {particleConfig.flowRate.toFixed(1)} particles/sec
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={particleConfig.flowRate}
                    onChange={(e) => onParticleConfigChange({ ...particleConfig, flowRate: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Velocity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Velocity: {particleConfig.velocity.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={particleConfig.velocity}
                    onChange={(e) => onParticleConfigChange({ ...particleConfig, velocity: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Particle Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Particle Size: {particleConfig.particleSize}px
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    step="1"
                    value={particleConfig.particleSize}
                    onChange={(e) => onParticleConfigChange({ ...particleConfig, particleSize: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Particle Spacing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spacing: {particleConfig.particleSpacing}px
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    step="10"
                    value={particleConfig.particleSpacing}
                    onChange={(e) => onParticleConfigChange({ ...particleConfig, particleSpacing: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Pause on Hover */}
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <label className="text-sm font-medium text-gray-700">
                    Pause on Hover
                  </label>
                  <button
                    onClick={() => onParticleConfigChange({ ...particleConfig, pauseOnHover: !particleConfig.pauseOnHover })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      particleConfig.pauseOnHover ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        particleConfig.pauseOnHover ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Ribbon Styling Controls */}
          {(visualizationMode === 'ribbons' || visualizationMode === 'both') && ribbonConfig && onRibbonConfigChange && (
            <section className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>🎀</span>
                Ribbon Styling
              </h4>

              <div className="space-y-3">
                {/* Width Scale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width Scale: {ribbonConfig.widthScale.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.3"
                    step="0.01"
                    value={ribbonConfig.widthScale}
                    onChange={(e) => onRibbonConfigChange({ ...ribbonConfig, widthScale: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Taper Ratio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taper Ratio: {ribbonConfig.taperRatio.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ribbonConfig.taperRatio}
                    onChange={(e) => onRibbonConfigChange({ ...ribbonConfig, taperRatio: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Curvature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Curvature: {ribbonConfig.curvature.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ribbonConfig.curvature}
                    onChange={(e) => onRibbonConfigChange({ ...ribbonConfig, curvature: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Arc Radius */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arc Radius: {ribbonConfig.arcRadius.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={ribbonConfig.arcRadius}
                    onChange={(e) => onRibbonConfigChange({ ...ribbonConfig, arcRadius: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Layout Section */}
          <section className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📐</span>
              Layout
            </h4>

            {/* Preset Selector */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preset
              </label>
              <select
                value={currentPreset}
                onChange={(e) => onPresetChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PRESETS.map(preset => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOptimizeLayout}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium"
                title="Minimize path crossings"
              >
                ✨ Optimize
              </button>
              <button
                onClick={onResetLayout}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors text-sm font-medium"
                title="Reset to default layout"
              >
                🔄 Reset All
              </button>
            </div>
          </section>

          {/* Save/Load Section */}
          <section className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>💾</span>
              Save / Load
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {/* Save Button */}
              <button
                onClick={onSaveLayout}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
              >
                💾 Save
              </button>

              {/* Load Button */}
              <label className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm font-medium text-center cursor-pointer">
                📂 Load
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Save custom layouts as JSON files for later use
            </p>
          </section>

          {/* Instructions */}
          <section className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>ℹ️</span>
              Tips
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <strong>Drag nodes</strong> to reposition them</li>
              <li>• <strong>Select a node</strong> to adjust position with sliders</li>
              <li>• <strong>Adjust path styling</strong> for better visibility</li>
              <li>• <strong>Optimize</strong> to reduce path crossings</li>
              <li>• <strong>Save/Load</strong> to preserve custom layouts</li>
            </ul>
          </section>

        </div>
      )}
    </div>
  );
}