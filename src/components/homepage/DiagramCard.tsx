'use client';

import { useState, useEffect } from 'react';
import BuilderCanvas from '@/components/builder/BuilderCanvas';
import { DiagramData } from '@/types/builder';
import { DiagramCardProps } from '@/types/homepage';
import { defaultTheme } from '@/lib/themePresets';

/**
 * DiagramCard Component
 * 
 * Displays a Sankey diagram in a card format on the homepage.
 * Loads diagram data from a JSON file and renders it using BuilderCanvas in preview mode.
 */
export default function DiagramCard({
  card,
  editMode = false,
  onEdit,
  onDelete,
  onToggleVisibility,
}: DiagramCardProps) {
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load diagram data from JSON file
  useEffect(() => {
    async function loadDiagram() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(card.diagramPath);
        
        if (!response.ok) {
          throw new Error(`Failed to load diagram: ${response.statusText}`);
        }
        
        const data: DiagramData = await response.json();
        setDiagramData(data);
      } catch (err) {
        console.error('Error loading diagram:', err);
        setError(err instanceof Error ? err.message : 'Failed to load diagram');
      } finally {
        setIsLoading(false);
      }
    }

    loadDiagram();
  }, [card.diagramPath]);

  // Empty handlers for BuilderCanvas (not used in preview mode)
  const handleNodeClick = () => {};
  const handleLinkClick = () => {};
  const handleNodeDrag = () => {};
  const handleCanvasClick = () => {};

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-96 bg-gray-100 rounded mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-red-200">
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <div className="text-red-500 text-2xl">⚠️</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-sm text-red-600 mb-4">Error loading diagram: {error}</p>
              <p className="text-xs text-gray-500">Path: {card.diagramPath}</p>
              {editMode && onDelete && (
                <button
                  onClick={() => onDelete(card.id)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete Card
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!diagramData) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
              {!card.visible && editMode && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                  Hidden
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
          </div>
          
          {/* Edit Mode Controls */}
          {editMode && (
            <div className="flex items-center space-x-2 ml-4">
              {onToggleVisibility && (
                <button
                  onClick={() => onToggleVisibility(card.id)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title={card.visible ? 'Hide card' : 'Show card'}
                >
                  {card.visible ? '👁️' : '👁️‍🗨️'}
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(card)}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Edit card"
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(card.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete card"
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Diagram Canvas */}
      <div className="relative" style={{ height: `${diagramData.config?.height || 800}px` }}>
        <BuilderCanvas
          nodes={diagramData.nodes}
          links={diagramData.links}
          mode="preview"
          selectedItem={null}
          isDrawingConnection={false}
          connectionStart={null}
          theme={defaultTheme}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          onNodeDrag={handleNodeDrag}
          onCanvasClick={handleCanvasClick}
        />
      </div>

      {/* Card Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>📊 {diagramData.nodes?.length || 0} nodes</span>
            <span>•</span>
            <span>🔗 {diagramData.links?.length || 0} flows</span>
          </div>
          <div>
            Updated: {new Date(card.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}