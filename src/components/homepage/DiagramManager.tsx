'use client';

import { useState, useEffect } from 'react';
import DiagramCard from './DiagramCard';
import DiagramUploadModal from './DiagramUploadModal';
import { DiagramCard as DiagramCardType, HomepageDiagramsConfig, DiagramManagerProps } from '@/types/homepage';

/**
 * DiagramManager Component
 * 
 * Manages the display and interaction of all diagram cards on the homepage.
 * Loads cards from the configuration file and provides controls for adding,
 * editing, deleting, and reordering cards in edit mode.
 */
export default function DiagramManager({ editMode = false }: DiagramManagerProps) {
  const [config, setConfig] = useState<HomepageDiagramsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Load configuration from JSON file
  useEffect(() => {
    async function loadConfig() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/data/homepage-diagrams.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load configuration: ${response.statusText}`);
        }
        
        const data: HomepageDiagramsConfig = await response.json();
        setConfig(data);
      } catch (err) {
        console.error('Error loading diagram configuration:', err);
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, []);

  // Filter cards based on visibility and edit mode
  const displayedCards = config?.cards
    .filter(card => editMode || card.visible)
    .sort((a, b) => a.order - b.order) || [];

  // Handle card edit
  const handleEditCard = (card: DiagramCardType) => {
    console.log('Edit card:', card);
    // TODO: Implement edit functionality
    alert(`Edit functionality will be implemented in Phase 4.\nCard: ${card.title}`);
  };

  // Handle card delete
  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this diagram card? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/diagrams/config?id=${cardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete card');
      }

      // Refresh page to show updated cards
      window.location.reload();
    } catch (err) {
      console.error('Error deleting card:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete card');
    }
  };

  // Handle toggle visibility
  const handleToggleVisibility = async (cardId: string) => {
    try {
      // Find current card to get current visibility state
      const card = config?.cards.find(c => c.id === cardId);
      if (!card) return;

      const response = await fetch('/api/diagrams/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId,
          visible: !card.visible,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle visibility');
      }

      // Refresh page to show updated visibility
      window.location.reload();
    } catch (err) {
      console.error('Error toggling visibility:', err);
      alert(err instanceof Error ? err.message : 'Failed to toggle visibility');
    }
  };

  // Handle add new diagram
  const handleAddDiagram = () => {
    setShowUploadModal(true);
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-red-200">
            <div className="flex items-start space-x-3">
              <div className="text-red-500 text-3xl">⚠️</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Configuration Error</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <p className="text-sm text-gray-600">
                  Please check that the configuration file exists at <code className="bg-gray-100 px-2 py-1 rounded">/data/homepage-diagrams.json</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Latest System Diagrams
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our latest biochar system configurations and material flow visualizations
          </p>
        </div>

        {/* Diagram Cards Grid */}
        <div className="space-y-12">
          {displayedCards.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Diagrams Available</h3>
              <p className="text-gray-600 mb-6">
                {editMode 
                  ? 'Get started by adding your first diagram card below.'
                  : 'Check back soon for new system diagrams.'}
              </p>
              {editMode && (
                <button
                  onClick={handleAddDiagram}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  ➕ Add First Diagram
                </button>
              )}
            </div>
          ) : (
            displayedCards.map((card) => (
              <DiagramCard
                key={card.id}
                card={card}
                editMode={editMode}
                onEdit={handleEditCard}
                onDelete={handleDeleteCard}
                onToggleVisibility={handleToggleVisibility}
              />
            ))
          )}
        </div>

        {/* Add New Diagram Button (Edit Mode Only) */}
        {editMode && displayedCards.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={handleAddDiagram}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
            >
              <span className="text-2xl">➕</span>
              <span>Add New Diagram Card</span>
            </button>
          </div>
        )}

        {/* Configuration Info (Edit Mode Only) */}
        {editMode && config && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Configuration version: {config.version}</p>
            <p>Last updated: {new Date(config.lastUpdated).toLocaleString()}</p>
            <p>Total cards: {config.cards.length} ({config.cards.filter(c => c.visible).length} visible)</p>
          </div>
        )}

        {/* Upload Modal */}
        <DiagramUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSave={async (cardData) => {
            // The modal handles the API calls now, this is just a callback
            console.log('Card saved successfully:', cardData);
          }}
        />
      </div>
    </section>
  );
}