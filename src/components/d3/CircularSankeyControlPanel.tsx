'use client';

import React, { useState } from 'react';
import { CircularSankeyConfig, DEFAULT_CONFIG } from '@/types/circular-sankey-config';

interface CircularSankeyControlPanelProps {
  config: CircularSankeyConfig;
  onChange: (config: CircularSankeyConfig) => void;
  onExport: () => void;
  onImport: (config: CircularSankeyConfig) => void;
  onReset: () => void;
}

type Tab = 'canvas' | 'nodes' | 'flows' | 'labels' | 'curves' | 'colors' | 'animation' | 'presets';

export function CircularSankeyControlPanel({
  config,
  onChange,
  onExport,
  onImport,
  onReset
}: CircularSankeyControlPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('canvas');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string>('chicken-house');

  const updateConfig = (updates: Partial<CircularSankeyConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateCanvas = (updates: Partial<CircularSankeyConfig['canvas']>) => {
    onChange({ ...config, canvas: { ...config.canvas, ...updates } });
  };

  const updateNodeSizes = (updates: Partial<CircularSankeyConfig['nodes']['sizes']>) => {
    onChange({
      ...config,
      nodes: {
        ...config.nodes,
        sizes: { ...config.nodes.sizes, ...updates }
      }
    });
  };

  const updateNodePosition = (nodeId: string, position: { x?: number; y?: number; radius?: number }) => {
    onChange({
      ...config,
      nodes: {
        ...config.nodes,
        positions: {
          ...config.nodes.positions,
          [nodeId]: { ...config.nodes.positions[nodeId], ...position }
        }
      }
    });
  };

  const updateFlows = (updates: Partial<CircularSankeyConfig['flows']>) => {
    onChange({ ...config, flows: { ...config.flows, ...updates } });
  };

  const updateLabels = (updates: Partial<CircularSankeyConfig['labels']>) => {
    onChange({ ...config, labels: { ...config.labels, ...updates } });
  };

  const updateCurves = (updates: Partial<CircularSankeyConfig['curves']>) => {
    onChange({ ...config, curves: { ...config.curves, ...updates } });
  };

  const updateColors = (updates: Partial<CircularSankeyConfig['colors']>) => {
    onChange({ ...config, colors: { ...config.colors, ...updates } });
  };

  const updateAnimation = (updates: Partial<CircularSankeyConfig['animation']>) => {
    onChange({ ...config, animation: { ...config.animation, ...updates } });
  };

  if (isCollapsed) {
    return (
      <div className="fixed right-4 top-4 z-50">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>⚙️</span>
          <span>Show Controls</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-4 z-50 bg-white rounded-lg shadow-2xl w-96 max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold text-gray-900">Sankey Controls</h2>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            title="Export Configuration"
          >
            💾 Export
          </button>
          <button
            onClick={onReset}
            className="text-orange-600 hover:text-orange-800 text-sm font-medium"
            title="Reset to Defaults"
          >
            ↺ Reset
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-gray-600 hover:text-gray-800"
            title="Collapse Panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b bg-gray-50">
        {(['canvas', 'nodes', 'flows', 'labels', 'curves', 'colors', 'animation', 'presets'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'canvas' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Canvas Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
              <input
                type="range"
                min="600"
                max="1600"
                step="50"
                value={config.canvas.width}
                onChange={(e) => updateCanvas({ width: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.canvas.width}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
              <input
                type="range"
                min="500"
                max="1200"
                step="50"
                value={config.canvas.height}
                onChange={(e) => updateCanvas({ height: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.canvas.height}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={config.canvas.aspectRatio}
                onChange={(e) => updateCanvas({ 
                  aspectRatio: parseFloat(e.target.value),
                  height: Math.round(config.canvas.width * parseFloat(e.target.value))
                })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.canvas.aspectRatio.toFixed(2)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <input
                type="color"
                value={config.canvas.backgroundColor}
                onChange={(e) => updateCanvas({ backgroundColor: e.target.value })}
                className="w-full h-10 rounded"
              />
            </div>
          </div>
        )}

        {activeTab === 'nodes' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Node Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Component Size</label>
              <input
                type="range"
                min="30"
                max="100"
                step="5"
                value={config.nodes.sizes.componentSize}
                onChange={(e) => updateNodeSizes({ componentSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.nodes.sizes.componentSize}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standard Size</label>
              <input
                type="range"
                min="20"
                max="60"
                step="5"
                value={config.nodes.sizes.standardSize}
                onChange={(e) => updateNodeSizes({ standardSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.nodes.sizes.standardSize}px</div>
            </div>

            <div className="border-t pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Node Positions</label>
              <select
                value={selectedNode}
                onChange={(e) => setSelectedNode(e.target.value)}
                className="w-full p-2 border rounded mb-3"
              >
                {Object.keys(config.nodes.positions).map(nodeId => (
                  <option key={nodeId} value={nodeId}>
                    {nodeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>

              {config.nodes.positions[selectedNode] && (
                <>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      X Position ({(config.nodes.positions[selectedNode].x * 100).toFixed(0)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={config.nodes.positions[selectedNode].x}
                      onChange={(e) => updateNodePosition(selectedNode, { x: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Y Position ({(config.nodes.positions[selectedNode].y * 100).toFixed(0)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={config.nodes.positions[selectedNode].y}
                      onChange={(e) => updateNodePosition(selectedNode, { y: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {config.nodes.positions[selectedNode].radius !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Radius ({(config.nodes.positions[selectedNode].radius! * 100).toFixed(0)}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.nodes.positions[selectedNode].radius}
                        onChange={(e) => updateNodePosition(selectedNode, { radius: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'flows' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Flow Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Width</label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={config.flows.minWidth}
                onChange={(e) => updateFlows({ minWidth: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.flows.minWidth}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width Multiplier</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={config.flows.widthMultiplier}
                onChange={(e) => updateFlows({ widthMultiplier: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.flows.widthMultiplier.toFixed(1)}x</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width Formula</label>
              <select
                value={config.flows.widthFormula}
                onChange={(e) => updateFlows({ widthFormula: e.target.value as 'sqrt' | 'linear' | 'log' })}
                className="w-full p-2 border rounded"
              >
                <option value="sqrt">Square Root (√)</option>
                <option value="linear">Linear (1:1)</option>
                <option value="log">Logarithmic (log)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opacity</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={config.flows.opacity}
                onChange={(e) => updateFlows({ opacity: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{(config.flows.opacity * 100).toFixed(0)}%</div>
            </div>
          </div>
        )}

        {activeTab === 'labels' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Label Settings</h3>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Show Link Labels</label>
              <input
                type="checkbox"
                checked={config.labels.showLinkLabels}
                onChange={(e) => updateLabels({ showLinkLabels: e.target.checked })}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Show Node Labels</label>
              <input
                type="checkbox"
                checked={config.labels.showNodeLabels}
                onChange={(e) => updateLabels({ showNodeLabels: e.target.checked })}
                className="h-4 w-4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Font Size</label>
              <input
                type="range"
                min="8"
                max="16"
                step="1"
                value={config.labels.linkFontSize}
                onChange={(e) => updateLabels({ linkFontSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.labels.linkFontSize}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Label Offset</label>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={config.labels.linkOffset}
                onChange={(e) => updateLabels({ linkOffset: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.labels.linkOffset}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Node Label Offset</label>
              <input
                type="range"
                min="0"
                max="40"
                step="2"
                value={config.labels.nodeLabelOffset}
                onChange={(e) => updateLabels({ nodeLabelOffset: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.labels.nodeLabelOffset}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Component Font Size</label>
              <input
                type="range"
                min="10"
                max="18"
                step="1"
                value={config.labels.componentFontSize}
                onChange={(e) => updateLabels({ componentFontSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.labels.componentFontSize}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standard Font Size</label>
              <input
                type="range"
                min="8"
                max="14"
                step="1"
                value={config.labels.standardFontSize}
                onChange={(e) => updateLabels({ standardFontSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.labels.standardFontSize}px</div>
            </div>
          </div>
        )}

        {activeTab === 'curves' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Curve Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Circular Path Curvature</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={config.curves.circularCurvature}
                onChange={(e) => updateCurves({ circularCurvature: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.curves.circularCurvature.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-2">
                Controls how much circular flow paths curve. Higher values create more dramatic curves.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Arc Radius</label>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={config.curves.returnArcRadius}
                onChange={(e) => updateCurves({ returnArcRadius: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.curves.returnArcRadius.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-2">
                Controls the depth of return connector curves. Lower values (0.3-0.6) create tighter curves closer to center, higher values (0.8-1.0) follow the outer perimeter.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Color Settings</h3>
            
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Components</h4>
              {Object.entries(config.colors)
                .filter(([key]) => !['input', 'intermediate', 'output', 'energy', 'biochar', 'material', 'manure', 'gas', 'waste'].includes(key))
                .map(([key, color]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 capitalize">
                      {key.replace(/-/g, ' ')}
                    </label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColors({ [key]: e.target.value } as any)}
                      className="h-8 w-16 rounded"
                    />
                  </div>
                ))}
            </div>

            <div className="space-y-3 border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-700">Material Types</h4>
              {(['input', 'intermediate', 'output', 'energy', 'biochar', 'material', 'manure', 'gas', 'waste'] as const).map(key => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 capitalize">{key}</label>
                  <input
                    type="color"
                    value={config.colors[key]}
                    onChange={(e) => updateColors({ [key]: e.target.value })}
                    className="h-8 w-16 rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'animation' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Animation Settings</h3>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Enable Animation</label>
              <input
                type="checkbox"
                checked={config.animation.enabled}
                onChange={(e) => updateAnimation({ enabled: e.target.checked })}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Use Icon Particles</label>
              <input
                type="checkbox"
                checked={config.animation.useIcons}
                onChange={(e) => updateAnimation({ useIcons: e.target.checked })}
                className="h-4 w-4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Particle Count</label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={config.animation.particleCount}
                onChange={(e) => updateAnimation({ particleCount: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.animation.particleCount} per flow</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Particle Size</label>
              <input
                type="range"
                min="2"
                max="16"
                step="1"
                value={config.animation.particleSize}
                onChange={(e) => updateAnimation({ particleSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.animation.particleSize}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Particle Speed</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={config.animation.particleSpeed}
                onChange={(e) => updateAnimation({ particleSpeed: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{config.animation.particleSpeed.toFixed(1)}x</div>
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Presets & Export</h3>
            
            <div className="space-y-2">
              <button
                onClick={onExport}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <span>💾</span>
                <span>Export Configuration</span>
              </button>
              
              <button
                onClick={onReset}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 flex items-center justify-center gap-2"
              >
                <span>↺</span>
                <span>Reset to Defaults</span>
              </button>

              <label className="block">
                <span className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center justify-center gap-2 cursor-pointer">
                  <span>📁</span>
                  <span>Import Configuration</span>
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const imported = JSON.parse(event.target?.result as string);
                          onImport(imported);
                        } catch (err) {
                          alert('Error importing configuration');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Presets</h4>
              <div className="space-y-2">
                <button
                  onClick={() => onChange({ ...config, canvas: { ...config.canvas, width: 900, height: 700 } })}
                  className="w-full text-left px-3 py-2 border rounded hover:bg-gray-50"
                >
                  <div className="font-medium">Default (900x700)</div>
                  <div className="text-xs text-gray-600">Standard circular layout</div>
                </button>
                
                <button
                  onClick={() => onChange({ ...config, canvas: { ...config.canvas, width: 700, height: 500 } })}
                  className="w-full text-left px-3 py-2 border rounded hover:bg-gray-50"
                >
                  <div className="font-medium">Compact (700x500)</div>
                  <div className="text-xs text-gray-600">Smaller, space-efficient</div>
                </button>
                
                <button
                  onClick={() => onChange({ ...config, canvas: { ...config.canvas, width: 1200, height: 800 } })}
                  className="w-full text-left px-3 py-2 border rounded hover:bg-gray-50"
                >
                  <div className="font-medium">Large (1200x800)</div>
                  <div className="text-xs text-gray-600">Detailed presentation view</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}