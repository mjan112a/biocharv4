'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { CircularSankeyDiagramV2 } from './CircularSankeyDiagramV2';
import { CircularSankeyControlPanel } from './CircularSankeyControlPanel';
import { CircularSankeyConfig, DEFAULT_CONFIG } from '@/types/circular-sankey-config';

export function CircularSankeyWithControls() {
  const [config, setConfig] = useState<CircularSankeyConfig>(DEFAULT_CONFIG);
  const [showControls, setShowControls] = useState(true);
  const [editMode, setEditMode] = useState(true); // Enable edit mode by default
  const [showGrid, setShowGrid] = useState(true); // Show grid by default
  const [snapToGrid, setSnapToGrid] = useState(true); // Enable snap by default
  const [systemView, setSystemView] = useState<'current' | 'proposed'>('proposed');
  
  // Undo/Redo state
  const [history, setHistory] = useState<CircularSankeyConfig[]>([DEFAULT_CONFIG]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleConfigChange = useCallback((newConfig: CircularSankeyConfig) => {
    setConfig(newConfig);
    
    // Add to history (remove any future states if we're not at the end)
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newConfig);
      // Limit history to 50 states
      return newHistory.slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);
  
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setConfig(history[newIndex]);
    }
  }, [history, historyIndex]);
  
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setConfig(history[newIndex]);
    }
  }, [history, historyIndex]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sankey-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [config]);

  const handleImport = useCallback((importedConfig: CircularSankeyConfig) => {
    setConfig(importedConfig);
  }, []);

  const handleReset = useCallback(() => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      setConfig(DEFAULT_CONFIG);
      setHistory([DEFAULT_CONFIG]);
      setHistoryIndex(0);
    }
  }, []);

  return (
    <div className="relative w-full">
      {/* System View Toggle (above diagram) */}
      <div className="mb-4 flex justify-center">
        <div className="bg-white rounded-lg shadow-md p-2 flex items-center gap-3">
          <span className={`text-sm font-medium ${systemView === 'current' ? 'text-red-600' : 'text-gray-400'}`}>
            Current System
          </span>
          <button
            onClick={() => setSystemView(systemView === 'current' ? 'proposed' : 'current')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              systemView === 'proposed' ? 'bg-green-600' : 'bg-red-500'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                systemView === 'proposed' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${systemView === 'proposed' ? 'text-green-600' : 'text-gray-400'}`}>
            Proposed System
          </span>
        </div>
      </div>

      {/* Main Diagram */}
      <div className="w-full">
        <CircularSankeyDiagramV2
          config={config}
          className="w-full"
          onConfigChange={handleConfigChange}
          editMode={editMode}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          gridSize={0.05}
          systemView={systemView}
          onSystemViewChange={setSystemView}
          showTooltips={true}
        />
      </div>
      
      {/* Edit Mode Toggle & Undo/Redo (floating button) */}
      {showControls && (
        <div className="fixed left-4 top-4 z-50 bg-white rounded-lg shadow-lg p-3 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editMode"
                checked={editMode}
                onChange={(e) => setEditMode(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="editMode" className="text-sm font-medium text-gray-700">
                Edit Mode (Drag Nodes)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showGrid"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="showGrid" className="text-sm font-medium text-gray-700">
                Show Grid
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="snapToGrid"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="h-4 w-4"
                disabled={!editMode}
              />
              <label htmlFor="snapToGrid" className={`text-sm font-medium ${editMode ? 'text-gray-700' : 'text-gray-400'}`}>
                Snap to Grid
              </label>
            </div>
          </div>
          
          <div className="border-t pt-2 flex gap-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className={`flex-1 px-3 py-1.5 rounded text-sm font-medium ${
                historyIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`flex-1 px-3 py-1.5 rounded text-sm font-medium ${
                historyIndex >= history.length - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title="Redo (Ctrl+Y)"
            >
              ↷ Redo
            </button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            {historyIndex + 1} / {history.length} states
          </div>
        </div>
      )}

      {/* Control Panel Toggle Button (when hidden) */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed right-4 top-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>⚙️</span>
          <span>Show Controls</span>
        </button>
      )}

      {/* Control Panel */}
      {showControls && (
        <div className="fixed right-4 top-4 z-50">
          <CircularSankeyControlPanel
            config={config}
            onChange={handleConfigChange}
            onExport={handleExport}
            onImport={handleImport}
            onReset={handleReset}
          />
          <button
            onClick={() => setShowControls(false)}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            title="Hide Controls"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}